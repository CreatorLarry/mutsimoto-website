import { createClient } from "@/lib/supabase/client";
import type {
  ProductImportCommitProduct,
  ProductImportImageManifestEntry,
} from "@/types/product-import";

const maximumImageSize = 5 * 1024 * 1024;
const imageContentTypes: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export interface ProductImportImageFailure {
  partNumber: string;
  filename: string;
  message: string;
}

export interface ProductImportImageMatch {
  matched: number;
  missing: string[];
  unused: string[];
  duplicates: string[];
  invalid: string[];
}

export interface ProductImportImageUploadResult {
  uploaded: number;
  failures: ProductImportImageFailure[];
  primaryImages: Map<string, string>;
}

function baseName(path: string): string {
  return path.split(/[\\/]/).pop() ?? path;
}

function imageExtension(path: string): string {
  return baseName(path).split(".").pop()?.toLowerCase() ?? "";
}

function indexedFiles(files: File[]) {
  const byName = new Map<string, File>();
  const duplicates = new Set<string>();
  const invalid = new Set<string>();

  for (const file of files) {
    const name = baseName(file.name);
    const key = name.toLowerCase();
    if (!imageContentTypes[imageExtension(name)] || file.size > maximumImageSize) {
      invalid.add(name);
      continue;
    }
    if (byName.has(key)) duplicates.add(name);
    else byName.set(key, file);
  }
  return { byName, duplicates: [...duplicates], invalid: [...invalid] };
}

export function matchProductImportImages(
  manifest: ProductImportImageManifestEntry[],
  files: File[],
): ProductImportImageMatch {
  const indexed = indexedFiles(files);
  const expected = new Set(manifest.map((item) => item.filename.toLowerCase()));
  const missing = manifest
    .filter((item) => !indexed.byName.has(item.filename.toLowerCase()))
    .map((item) => item.filename);
  const unused = [...indexed.byName.keys()]
    .filter((name) => !expected.has(name))
    .map((name) => indexed.byName.get(name)?.name ?? name);

  return {
    matched: manifest.length - missing.length,
    missing,
    unused,
    duplicates: indexed.duplicates,
    invalid: indexed.invalid,
  };
}

function safeStorageName(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]+/g, "-");
}

export async function uploadProductImportImages(options: {
  manifest: ProductImportImageManifestEntry[];
  files: File[];
  products: ProductImportCommitProduct[];
  onProgress: (processed: number) => void;
}): Promise<ProductImportImageUploadResult> {
  const supabase = createClient();
  const files = indexedFiles(options.files).byName;
  const products = new Map(
    options.products.map((product) => [product.normalizedPartNumber, product]),
  );
  const groups = new Map<string, ProductImportImageManifestEntry[]>();
  for (const item of options.manifest) {
    const group = groups.get(item.normalizedPartNumber) ?? [];
    group.push(item);
    groups.set(item.normalizedPartNumber, group);
  }

  let processed = 0;
  let uploaded = 0;
  const failures: ProductImportImageFailure[] = [];
  const primaryImages = new Map<string, string>();

  for (const [partNumber, entries] of groups) {
    const product = products.get(partNumber);
    if (!product) {
      for (const entry of entries) {
        failures.push({
          partNumber: entry.partNumber,
          filename: entry.filename,
          message: "The product record was not available for this image.",
        });
        processed += 1;
        options.onProgress(processed);
      }
      continue;
    }

    const uploadedEntries: Array<{
      entry: ProductImportImageManifestEntry;
      storagePath: string;
    }> = [];

    for (const entry of entries) {
      const file = files.get(entry.filename.toLowerCase());
      if (!file) {
        failures.push({
          partNumber: entry.partNumber,
          filename: entry.filename,
          message: "The selected package does not contain this image.",
        });
      } else {
        const contentType = imageContentTypes[imageExtension(entry.filename)];
        const storagePath = `${product.id}/catalogue-import/${safeStorageName(entry.filename)}`;
        let uploadFailed = true;
        for (let attempt = 1; attempt <= 3; attempt += 1) {
          const { error } = await supabase.storage
            .from("product-images")
            .upload(storagePath, file, {
              cacheControl: "3600",
              contentType,
              upsert: true,
            });
          if (!error) {
            uploadFailed = false;
            break;
          }
          if (attempt < 3) {
            await new Promise((resolve) => window.setTimeout(resolve, attempt * 300));
          }
        }
        if (uploadFailed) {
          failures.push({
            partNumber: entry.partNumber,
            filename: entry.filename,
            message: "The image could not be uploaded to product storage after three attempts.",
          });
        } else {
          uploadedEntries.push({ entry, storagePath });
        }
      }
      processed += 1;
      options.onProgress(processed);
    }

    if (uploadedEntries.length === 0) continue;
    const primary =
      uploadedEntries.find(({ entry }) => entry.isPrimary) ?? uploadedEntries[0];
    const { error: primaryError } = await supabase
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", product.id)
      .eq("is_primary", true);
    if (primaryError) {
      failures.push(
        ...uploadedEntries.map(({ entry }) => ({
          partNumber: entry.partNumber,
          filename: entry.filename,
          message: "The existing primary image could not be replaced.",
        })),
      );
      continue;
    }

    const { error: metadataError } = await supabase.from("product_images").upsert(
      uploadedEntries.map(({ entry, storagePath }) => ({
        product_id: product.id,
        storage_path: storagePath,
        alt_text: entry.altText,
        display_order: entry.displayOrder,
        is_primary: storagePath === primary.storagePath,
      })),
      { onConflict: "storage_path" },
    );
    if (metadataError) {
      failures.push(
        ...uploadedEntries.map(({ entry }) => ({
          partNumber: entry.partNumber,
          filename: entry.filename,
          message: "The uploaded image could not be attached to its product.",
        })),
      );
      continue;
    }

    uploaded += uploadedEntries.length;
    primaryImages.set(product.id, primary.storagePath);
  }

  return { uploaded, failures, primaryImages };
}
