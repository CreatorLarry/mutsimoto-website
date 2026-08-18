import "server-only";

import { productCategoryLabels } from "@/types/categories";
import type { StaffProfile } from "@/types/admin";
import type {
  ImportedProduct,
  ParsedProductWorkbook,
  ProductImportCommitResult,
} from "@/types/product-import";
import { createClient } from "@/lib/supabase/server";

type StaffSupabaseClient = Awaited<ReturnType<typeof createClient>>;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function descriptionsFor(product: ImportedProduct) {
  const application =
    product.applicationType === "both"
      ? "automotive and industrial applications"
      : `${product.applicationType} applications`;
  const automaticShortDescription = `${product.name} (${product.partNumber}) is a Mutsimoto ${productCategoryLabels[product.category]} for ${application}.`;
  const shortDescription = product.shortDescription || automaticShortDescription;
  const fullDescription =
    product.fullDescription ||
    `${product.shortDescription || automaticShortDescription} Contact Mutsimoto Motor Company to confirm fitment, technical specifications, and cross-reference compatibility before installation.`;
  return { shortDescription, fullDescription };
}

async function availableSlug(
  client: StaffSupabaseClient,
  preferred: string,
  currentProductId: string | null,
): Promise<string> {
  const base = slugify(preferred) || "mutsimoto-filter";
  for (let suffix = 1; suffix <= 100; suffix += 1) {
    const candidate = suffix === 1 ? base : `${base}-${suffix}`;
    const { data, error } = await client
      .from("products")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (error) throw new Error("The product URL could not be checked.");
    if (!data || String(data.id) === currentProductId) return candidate;
  }
  throw new Error("A unique product URL could not be generated.");
}

async function upsertEngine(
  client: StaffSupabaseClient,
  manufacturer: string,
  model: string | null,
): Promise<string | null> {
  if (!model) return null;
  const { data, error } = await client
    .from("engine_models")
    .upsert(
      { manufacturer, model, slug: slugify(`${manufacturer}-${model}`) },
      { onConflict: "manufacturer,model" },
    )
    .select("id")
    .single();
  if (error || !data) throw new Error(`Engine ${manufacturer} ${model} could not be saved.`);
  return String(data.id);
}

async function replaceRelatedData(
  client: StaffSupabaseClient,
  productId: string,
  product: ImportedProduct,
) {
  const relatedTables = [
    "specifications",
    "oem_references",
    "product_vehicle_applications",
    "product_equipment_applications",
  ] as const;
  for (const table of relatedTables) {
    const { error } = await client.from(table).delete().eq("product_id", productId);
    if (error) throw new Error(`Existing ${table.replaceAll("_", " ")} could not be replaced.`);
  }

  if (product.specifications.length > 0) {
    const { error } = await client.from("specifications").insert(
      product.specifications.map((item) => ({
        product_id: productId,
        label: item.label,
        value: item.value,
        unit: item.unit,
        display_order: item.displayOrder,
      })),
    );
    if (error) throw new Error("Technical specifications could not be saved.");
  }

  if (product.references.length > 0) {
    const { error } = await client.from("oem_references").insert(
      product.references.map((item) => ({
        product_id: productId,
        reference_type: item.referenceType,
        manufacturer: item.manufacturer,
        reference_number: item.referenceNumber,
      })),
    );
    if (error) throw new Error("OEM and cross-reference numbers could not be saved.");
  }

  for (const item of product.vehicleApplications) {
    const { data: brand, error: brandError } = await client
      .from("vehicle_brands")
      .upsert({ name: item.brand, slug: slugify(item.brand) }, { onConflict: "name" })
      .select("id")
      .single();
    if (brandError || !brand) throw new Error(`Vehicle brand ${item.brand} could not be saved.`);
    const { data: model, error: modelError } = await client
      .from("vehicle_models")
      .upsert(
        {
          vehicle_brand_id: brand.id,
          name: item.model,
          slug: slugify(item.model),
        },
        { onConflict: "vehicle_brand_id,slug" },
      )
      .select("id")
      .single();
    if (modelError || !model) {
      throw new Error(`Vehicle model ${item.brand} ${item.model} could not be saved.`);
    }
    const engineId = await upsertEngine(
      client,
      item.engineManufacturer,
      item.engineModel,
    );
    const { error } = await client.from("product_vehicle_applications").insert({
      product_id: productId,
      vehicle_model_id: model.id,
      engine_model_id: engineId,
      year_from: item.yearFrom,
      year_to: item.yearTo,
      notes: item.notes,
    });
    if (error) {
      throw new Error(`Vehicle application ${item.brand} ${item.model} could not be saved.`);
    }
  }

  for (const item of product.equipmentApplications) {
    const { data: equipmentType, error: equipmentError } = await client
      .from("equipment_types")
      .upsert(
        {
          name: item.equipmentType,
          slug: slugify(item.equipmentType),
          industry: item.industry,
        },
        { onConflict: "name" },
      )
      .select("id")
      .single();
    if (equipmentError || !equipmentType) {
      throw new Error(`Equipment type ${item.equipmentType} could not be saved.`);
    }
    const engineId = await upsertEngine(
      client,
      item.engineManufacturer,
      item.engineModel,
    );
    const { error } = await client.from("product_equipment_applications").insert({
      product_id: productId,
      equipment_type_id: equipmentType.id,
      manufacturer: item.manufacturer,
      model: item.model,
      engine_model_id: engineId,
      notes: item.notes,
    });
    if (error) {
      throw new Error(
        `Equipment application ${item.manufacturer} ${item.model} could not be saved.`,
      );
    }
  }
}

async function saveProduct(
  client: StaffSupabaseClient,
  profile: StaffProfile,
  product: ImportedProduct,
): Promise<"created" | "updated"> {
  const { data: existing, error: lookupError } = await client
    .from("products")
    .select("id")
    .eq("part_number_normalized", product.normalizedPartNumber)
    .maybeSingle();
  if (lookupError) throw new Error("The product could not be checked in the database.");

  const existingId = existing ? String(existing.id) : null;
  const slug = await availableSlug(
    client,
    `${product.name}-${product.partNumber}`,
    existingId,
  );
  const descriptions = descriptionsFor(product);
  const payload = {
    name: product.name,
    slug,
    part_number: product.partNumber,
    category: product.category,
    short_description: descriptions.shortDescription,
    full_description: descriptions.fullDescription,
    application_type: product.applicationType,
    availability: product.availability,
    featured: product.featured,
    publication_status: "draft" as const,
    seo_title: product.seoTitle || null,
    seo_description: product.seoDescription || null,
    updated_by: profile.id,
    published_at: null,
  };

  let productId = existingId;
  if (existingId) {
    const { error } = await client.from("products").update(payload).eq("id", existingId);
    if (error) throw new Error("The product record could not be updated.");
  } else {
    const { data, error } = await client
      .from("products")
      .insert({ ...payload, created_by: profile.id })
      .select("id")
      .single();
    if (error || !data) throw new Error("The product record could not be created.");
    productId = String(data.id);
  }

  if (!productId) throw new Error("The saved product could not be identified.");
  await replaceRelatedData(client, productId, product);
  return existingId ? "updated" : "created";
}

export async function importProductWorkbook(
  parsed: ParsedProductWorkbook,
  profile: StaffProfile,
  options: { offset: number; limit: number },
): Promise<ProductImportCommitResult> {
  const client = await createClient();
  const products = parsed.products.slice(options.offset, options.offset + options.limit);
  const nextOffset = options.offset + products.length;
  const result: ProductImportCommitResult = {
    created: 0,
    updated: 0,
    failed: [],
    mediaPending: {
      images: parsed.totals.images,
      technicalSheets: parsed.totals.technicalSheets,
    },
    progress: {
      processed: products.length,
      total: parsed.products.length,
      nextOffset: nextOffset < parsed.products.length ? nextOffset : null,
      complete: nextOffset >= parsed.products.length,
    },
  };

  for (const product of products) {
    try {
      const action = await saveProduct(client, profile, product);
      result[action] += 1;
    } catch (error) {
      result.failed.push({
        partNumber: product.partNumber,
        name: product.name,
        message: error instanceof Error ? error.message : "The product could not be imported.",
      });
    }
  }

  return result;
}
