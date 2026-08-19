"use client";

import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type InputHTMLAttributes,
} from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Download,
  FileArchive,
  FileSpreadsheet,
  Images,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import {
  matchProductImportImages,
  uploadProductImportImages,
  type ProductImportImageFailure,
} from "@/lib/client/product-import-images";
import { prepareProductImportPackage } from "@/lib/client/product-import-package";
import { productCategoryLabels } from "@/types/categories";
import type {
  ProductImportCommitResult,
  ProductImportPreview,
} from "@/types/product-import";

type WorkflowPhase =
  | "idle"
  | "preparing"
  | "previewing"
  | "ready"
  | "importing"
  | "uploading"
  | "publishing"
  | "complete";

interface ImportResumeState {
  offset: number;
  created: number;
  updated: number;
  failed: ProductImportCommitResult["failed"];
  products: ProductImportCommitResult["products"];
}

interface ImportOutcome {
  imagesUploaded: number;
  imageFailures: ProductImportImageFailure[];
  published: number;
  finalizationFailures: Array<{ id: string; message: string }>;
}

interface FinalizeResponse {
  updated: number;
  published: number;
  failed: Array<{ id: string; message: string }>;
}

const importBatchSize = 8;
const directoryPickerProps = {
  webkitdirectory: "",
  directory: "",
} as unknown as InputHTMLAttributes<HTMLInputElement>;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizedReference(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function messageFromResponse(value: unknown, fallback: string): string {
  if (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof value.message === "string"
  ) {
    return value.message;
  }
  return fallback;
}

async function readResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function requestFailureMessage(
  response: Response,
  body: unknown,
  fallback: string,
): string {
  const message = messageFromResponse(body, "");
  if (message) return message;
  if (response.status === 401) return "Your staff session has expired. Sign in again.";
  if (response.status === 413) return "The workbook is too large for the server to receive.";
  if (response.status >= 500) {
    return "The server interrupted this import batch. Your completed batches are safe and the import can be resumed.";
  }
  return fallback;
}

function isCommitResult(value: unknown): value is ProductImportCommitResult {
  return (
    typeof value === "object" &&
    value !== null &&
    "created" in value &&
    typeof value.created === "number" &&
    "updated" in value &&
    typeof value.updated === "number" &&
    "failed" in value &&
    Array.isArray(value.failed) &&
    "products" in value &&
    Array.isArray(value.products) &&
    "progress" in value &&
    typeof value.progress === "object" &&
    value.progress !== null &&
    "nextOffset" in value.progress
  );
}

function isFinalizeResponse(value: unknown): value is FinalizeResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "updated" in value &&
    typeof value.updated === "number" &&
    "published" in value &&
    typeof value.published === "number" &&
    "failed" in value &&
    Array.isArray(value.failed)
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#e0e6ed] bg-[#f7f9fb] px-4 py-4">
      <p className="text-2xl font-black tracking-[-0.04em] text-[#07172b]">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.1em] text-[#748196]">
        {label}
      </p>
    </div>
  );
}

export function ProductImportWorkflow({ canPublish }: { canPublish: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [sourceName, setSourceName] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [phase, setPhase] = useState<WorkflowPhase>("idle");
  const [preview, setPreview] = useState<ProductImportPreview | null>(null);
  const [result, setResult] = useState<ProductImportCommitResult | null>(null);
  const [resume, setResume] = useState<ImportResumeState | null>(null);
  const [processedProducts, setProcessedProducts] = useState(0);
  const [processedImages, setProcessedImages] = useState(0);
  const [publishImmediately, setPublishImmediately] = useState(false);
  const [outcome, setOutcome] = useState<ImportOutcome | null>(null);
  const [error, setError] = useState("");
  const busy = ["preparing", "previewing", "importing", "uploading", "publishing"].includes(
    phase,
  );
  const imageMatch = useMemo(
    () => matchProductImportImages(preview?.imageManifest ?? [], selectedImages),
    [preview, selectedImages],
  );
  const imagesReady =
    !preview ||
    preview.imageManifest.length === 0 ||
    (imageMatch.missing.length === 0 &&
      imageMatch.duplicates.length === 0 &&
      imageMatch.invalid.length === 0);
  const readyToImport = Boolean(preview?.valid && imagesReady);

  function resetImportState() {
    setPreview(null);
    setResult(null);
    setResume(null);
    setProcessedProducts(0);
    setProcessedImages(0);
    setOutcome(null);
    setError("");
  }

  async function selectFile(nextFile: File | null) {
    resetImportState();
    setFile(null);
    setSourceName("");
    setSelectedImages([]);
    if (!nextFile) {
      setPhase("idle");
      return;
    }

    setPhase("preparing");
    try {
      const prepared = await prepareProductImportPackage(nextFile);
      setFile(prepared.workbook);
      setSourceName(prepared.sourceName);
      setSelectedImages(prepared.images);
      setPhase("idle");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "The import package could not be prepared.",
      );
      setPhase("idle");
    }
  }

  function selectImageFiles(files: File[]) {
    setSelectedImages(
      files.filter((image) => /\.(?:jpe?g|png|webp)$/i.test(image.name)),
    );
    setResult(null);
    setOutcome(null);
    setProcessedImages(0);
    setError("");
    if (phase === "complete") setPhase(preview ? "ready" : "idle");
  }

  function onImageFolderChange(event: ChangeEvent<HTMLInputElement>) {
    selectImageFiles(Array.from(event.target.files ?? []));
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    void selectFile(event.target.files?.[0] ?? null);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (busy) return;
    void selectFile(event.dataTransfer.files?.[0] ?? null);
  }

  async function finalizeProducts(
    products: ProductImportCommitResult["products"],
    primaryImages: Map<string, string>,
    blockedPartNumbers: Set<string>,
  ): Promise<{ published: number; failed: Array<{ id: string; message: string }> }> {
    const items = products
      .map((product) => ({
        id: product.id,
        primaryImagePath: primaryImages.get(product.id) ?? null,
        publish: publishImmediately && !blockedPartNumbers.has(product.normalizedPartNumber),
      }))
      .filter((item) => item.primaryImagePath || item.publish);
    let published = 0;
    let failed: Array<{ id: string; message: string }> = [];

    for (let index = 0; index < items.length; index += 25) {
      const response = await fetch("/api/admin/products/import/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.slice(index, index + 25) }),
      });
      const body = await readResponse(response);
      if (!response.ok) {
        throw new Error(
          requestFailureMessage(response, body, "The imported products could not be finalized."),
        );
      }
      if (!isFinalizeResponse(body)) {
        throw new Error("The server returned an unreadable final import response.");
      }
      published += body.published;
      failed = [...failed, ...body.failed];
    }
    return { published, failed };
  }

  async function previewWorkbook() {
    if (!file) {
      setError("Choose the completed XLSX workbook first.");
      return;
    }
    setPhase("previewing");
    setPreview(null);
    setResult(null);
    setResume(null);
    setProcessedProducts(0);
    setProcessedImages(0);
    setOutcome(null);
    setError("");
    const formData = new FormData();
    formData.set("workbook", file);

    try {
      const response = await fetch("/api/admin/products/import/preview", {
        method: "POST",
        body: formData,
      });
      const body = await readResponse(response);
      if (!response.ok) {
        throw new Error(
          requestFailureMessage(response, body, "The workbook could not be previewed."),
        );
      }
      if (!body) throw new Error("The server returned an unreadable workbook preview.");
      setPreview(body as ProductImportPreview);
      setPhase("ready");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The workbook could not be previewed.");
      setPhase("idle");
    }
  }

  async function importWorkbook() {
    if (!file || !preview?.valid || !imagesReady) return;
    if (
      publishImmediately &&
      !window.confirm(
        `Import and publish ${preview.totals.products} products after their images are uploaded?`,
      )
    ) {
      return;
    }
    setPhase("importing");
    setResult(null);
    setOutcome(null);
    setError("");
    let offset = resume?.offset ?? 0;
    let created = resume?.created ?? 0;
    let updated = resume?.updated ?? 0;
    let failed = resume?.failed ?? [];
    let products = resume?.products ?? [];

    try {
      while (offset < preview.totals.products) {
        const formData = new FormData();
        formData.set("workbook", file);
        formData.set("offset", String(offset));
        formData.set("batchSize", String(importBatchSize));

        const response = await fetch("/api/admin/products/import/commit", {
          method: "POST",
          body: formData,
        });
        const body = await readResponse(response);
        if (!response.ok) {
          throw new Error(
            requestFailureMessage(response, body, "The workbook could not be imported."),
          );
        }
        if (!isCommitResult(body)) {
          throw new Error(
            "The server returned an unreadable import response. The import can be resumed safely.",
          );
        }

        created += body.created;
        updated += body.updated;
        failed = [...failed, ...body.failed];
        products = [
          ...new Map(
            [...products, ...body.products].map((product) => [product.id, product]),
          ).values(),
        ];
        offset = body.progress.nextOffset ?? preview.totals.products;
        setProcessedProducts(offset);
        setResume({ offset, created, updated, failed, products });
      }

      setPhase("uploading");
      setProcessedImages(0);
      const imageResult = await uploadProductImportImages({
        manifest: preview.imageManifest,
        files: selectedImages,
        products,
        onProgress: setProcessedImages,
      });
      const blockedPartNumbers = new Set(
        imageResult.failures.map((failure) => normalizedReference(failure.partNumber)),
      );

      setPhase("publishing");
      const finalized = await finalizeProducts(
        products,
        imageResult.primaryImages,
        blockedPartNumbers,
      );

      setResult({
        created,
        updated,
        failed,
        products,
        mediaPending: {
          images: imageResult.failures.length,
          technicalSheets: preview.totals.technicalSheets,
        },
        progress: {
          processed: preview.totals.products,
          total: preview.totals.products,
          nextOffset: null,
          complete: true,
        },
      });
      setOutcome({
        imagesUploaded: imageResult.uploaded,
        imageFailures: imageResult.failures,
        published: finalized.published,
        finalizationFailures: finalized.failed,
      });
      setResume(null);
      setPhase("complete");
    } catch (caught) {
      setResume({ offset, created, updated, failed, products });
      const reason =
        caught instanceof TypeError
          ? "The connection was interrupted. Your completed batches are safe and the import can be resumed."
          : caught instanceof Error
            ? caught.message
            : "The workbook could not be imported.";
      setError(
        offset > 0
          ? `${reason} ${offset} of ${preview.totals.products} products are complete. Select Resume import to continue.`
          : reason,
      );
      setPhase("ready");
    }
  }

  function startAgain() {
    if (inputRef.current) inputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
    void selectFile(null);
  }

  return (
    <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_360px]">
      <div className="space-y-6">
        <section className="rounded-[24px] border border-[#dce3eb] bg-white p-5 shadow-[0_8px_28px_rgba(7,23,43,0.04)] sm:p-7">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#eaf1f7] text-[#173d64]">
              <FileSpreadsheet className="size-5" />
            </span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#d51f2a]">
                Step 1
              </p>
              <h2 className="mt-1 text-xl font-black text-[#07172b]">
                Choose the workbook package
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#657184]">
                Choose the ZIP package to include its images automatically, or select an
                XLSX workbook and add the matching image folder separately.
              </p>
            </div>
          </div>

          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={onDrop}
            className="mt-6 rounded-[20px] border-2 border-dashed border-[#cbd6e1] bg-[#f7f9fb] px-5 py-9 text-center transition hover:border-[#8da0b4] hover:bg-[#f2f6f9]"
          >
            <UploadCloud className="mx-auto size-8 text-[#526176]" />
            <p className="mt-3 text-sm font-black text-[#07172b]">
              Drop the ZIP package or XLSX workbook here
            </p>
            <p className="mt-1 text-xs text-[#748196]">or choose it from this computer</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full border border-[#cdd7e1] bg-white px-4 text-xs font-black text-[#24364c] hover:border-[#9caaba] hover:bg-[#eef3f7] disabled:opacity-50"
            >
              {phase === "preparing" ? (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              ) : (
                <FileArchive className="mr-2 size-4" />
              )}
              {phase === "preparing" ? "Opening package…" : "Browse files"}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".zip,.xlsx,application/zip,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={onFileChange}
              className="sr-only"
            />
          </div>

          {file && (
            <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-[#dbe4ec] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-[#07172b]">
                  {sourceName || file.name}
                </p>
                <p className="mt-1 text-xs text-[#7c899b]">
                  {formatBytes(file.size)} workbook · {selectedImages.length} images selected
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={busy}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#cdd7e1] bg-white px-4 text-xs font-black text-[#24364c] hover:bg-[#eef3f7] disabled:opacity-50"
                >
                  <Images className="size-4" /> Choose image folder
                </button>
                <button
                  type="button"
                  onClick={previewWorkbook}
                  disabled={busy}
                  className="button-dark shrink-0 disabled:cursor-wait disabled:opacity-55"
                >
                  {phase === "previewing" ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="size-4" />
                  )}
                  {phase === "previewing" ? "Checking workbook…" : "Check workbook"}
                </button>
              </div>
            </div>
          )}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            {...directoryPickerProps}
            onChange={onImageFolderChange}
            className="sr-only"
          />
        </section>

        {error && (
          <div
            role="alert"
            className="flex gap-3 rounded-2xl border border-[#efcbd0] bg-[#fff4f5] p-4 text-sm leading-6 text-[#8f2934]"
          >
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {preview && (
          <section className="overflow-hidden rounded-[24px] border border-[#dce3eb] bg-white shadow-[0_8px_28px_rgba(7,23,43,0.04)]">
            <div className="flex flex-col gap-4 border-b border-[#e6ebf0] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#d51f2a]">
                  Step 2
                </p>
                <h2 className="mt-1 text-xl font-black text-[#07172b]">
                  Review before import
                </h2>
              </div>
              <span
                className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.08em] ${
                  readyToImport
                    ? "bg-[#e8f7ef] text-[#137047]"
                    : "bg-[#fff0f1] text-[#9e303a]"
                }`}
              >
                {readyToImport ? (
                  <CheckCircle2 className="size-3.5" />
                ) : (
                  <AlertCircle className="size-3.5" />
                )}
                {readyToImport
                  ? "Ready to import"
                  : preview.valid
                    ? "Images required"
                    : "Corrections required"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 lg:grid-cols-4 sm:p-7">
              <Stat label="Products" value={preview.totals.products} />
              <Stat label="Specifications" value={preview.totals.specifications} />
              <Stat label="References" value={preview.totals.references} />
              <Stat
                label="Applications"
                value={
                  preview.totals.vehicleApplications +
                  preview.totals.equipmentApplications
                }
              />
              <Stat label="Image files" value={preview.totals.images} />
              <Stat label="PDF files" value={preview.totals.technicalSheets} />
              <Stat label="Errors" value={preview.errorCount} />
              <Stat label="Warnings" value={preview.warningCount} />
            </div>

            {preview.imageManifest.length > 0 && (
              <div className="border-t border-[#e6ebf0] px-5 py-6 sm:px-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-black text-[#07172b]">
                      Actual product images
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-[#748196]">
                      Filenames are matched to the workbook before any image is uploaded.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={busy}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#cdd7e1] bg-white px-4 text-xs font-black text-[#24364c] hover:bg-[#eef3f7] disabled:opacity-50"
                  >
                    <Images className="size-4" /> Change image folder
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat label="Selected" value={selectedImages.length} />
                  <Stat label="Matched" value={imageMatch.matched} />
                  <Stat label="Missing" value={imageMatch.missing.length} />
                  <Stat label="Unused" value={imageMatch.unused.length} />
                </div>
                {(imageMatch.missing.length > 0 ||
                  imageMatch.duplicates.length > 0 ||
                  imageMatch.invalid.length > 0) && (
                  <div className="mt-4 rounded-2xl border border-[#efcbd0] bg-[#fff4f5] p-4 text-xs leading-5 text-[#8f2934]">
                    {imageMatch.missing.length > 0 && (
                      <p>
                        Missing: {imageMatch.missing.slice(0, 8).join(", ")}
                        {imageMatch.missing.length > 8 ? "…" : ""}
                      </p>
                    )}
                    {imageMatch.duplicates.length > 0 && (
                      <p>Duplicate filenames: {imageMatch.duplicates.slice(0, 8).join(", ")}</p>
                    )}
                    {imageMatch.invalid.length > 0 && (
                      <p>
                        Unsupported or oversized: {imageMatch.invalid.slice(0, 8).join(", ")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {preview.issues.length > 0 && (
              <div className="border-t border-[#e6ebf0] px-5 py-6 sm:px-7">
                <h3 className="text-sm font-black text-[#07172b]">Workbook messages</h3>
                <div className="mt-4 max-h-[430px] overflow-auto rounded-2xl border border-[#e1e7ed]">
                  <table className="w-full min-w-[720px] text-left">
                    <thead className="sticky top-0 bg-[#f3f6f9] text-[9px] font-black uppercase tracking-[0.1em] text-[#6a778a]">
                      <tr>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3">Part number</th>
                        <th className="px-4 py-3">Message</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#edf0f3]">
                      {preview.issues.map((item, index) => (
                        <tr key={`${item.sheet}-${item.row}-${item.field}-${index}`}>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-1 text-[9px] font-black uppercase ${
                                item.severity === "error"
                                  ? "bg-[#fff0f1] text-[#9e303a]"
                                  : "bg-[#fff6df] text-[#8b6418]"
                              }`}
                            >
                              {item.severity}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs font-bold text-[#435166]">
                            {item.sheet}
                            {item.row ? ` · row ${item.row}` : ""}
                            {item.field ? ` · ${item.field.replaceAll("_", " ")}` : ""}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-[#526176]">
                            {item.partNumber ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-xs leading-5 text-[#657184]">
                            {item.message}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {preview.hiddenIssueCount > 0 && (
                  <p className="mt-3 text-xs text-[#7b8798]">
                    {preview.hiddenIssueCount} additional messages are hidden. Correct the
                    first messages and check the workbook again.
                  </p>
                )}
              </div>
            )}

            {preview.sampleProducts.length > 0 && (
              <div className="border-t border-[#e6ebf0] px-5 py-6 sm:px-7">
                <h3 className="text-sm font-black text-[#07172b]">Product preview</h3>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {preview.sampleProducts.map((product) => (
                    <article
                      key={product.partNumber}
                      className="rounded-2xl border border-[#e0e6ed] bg-[#fafbfc] p-4"
                    >
                      <p className="font-mono text-[10px] font-black uppercase tracking-[0.08em] text-[#d51f2a]">
                        {product.partNumber}
                      </p>
                      <h4 className="mt-2 text-sm font-black text-[#07172b]">
                        {product.name}
                      </h4>
                      <p className="mt-1 text-xs text-[#687589]">
                        {productCategoryLabels[product.category]} ·{" "}
                        {product.applicationType}
                      </p>
                      <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.07em] text-[#8a95a5]">
                        {product.specifications} specs · {product.references} references ·{" "}
                        {product.applications} applications · {product.mediaFiles} media
                      </p>
                    </article>
                  ))}
                </div>
                {preview.totals.products > preview.sampleProducts.length && (
                  <p className="mt-3 text-xs text-[#7b8798]">
                    Showing the first {preview.sampleProducts.length} of{" "}
                    {preview.totals.products} products.
                  </p>
                )}
              </div>
            )}

            <div className="border-t border-[#e6ebf0] bg-[#f7f9fb] p-5 sm:p-7">
              {(phase === "importing" || processedProducts > 0) && phase !== "complete" && (
                <div className="mb-5" aria-live="polite">
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold text-[#526176]">
                    <span>Import progress</span>
                    <span>
                      {processedProducts} of {preview.totals.products} products
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#dfe6ed]">
                    <div
                      className="h-full rounded-full bg-[#d51f2a] transition-[width] duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          (processedProducts / preview.totals.products) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
              {(phase === "uploading" || phase === "publishing") &&
                preview.imageManifest.length > 0 && (
                  <div className="mb-5" aria-live="polite">
                    <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold text-[#526176]">
                      <span>{phase === "publishing" ? "Finalizing catalogue" : "Uploading images"}</span>
                      <span>
                        {processedImages} of {preview.imageManifest.length} images
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#dfe6ed]">
                      <div
                        className="h-full rounded-full bg-[#173d64] transition-[width] duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            (processedImages / preview.imageManifest.length) * 100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              {canPublish && (
                <label className="mb-5 flex items-start gap-3 rounded-2xl border border-[#cbd8e4] bg-white p-4 text-xs font-bold leading-5 text-[#435166]">
                  <input
                    type="checkbox"
                    checked={publishImmediately}
                    onChange={(event) => setPublishImmediately(event.target.checked)}
                    disabled={busy || phase === "complete"}
                    className="mt-0.5 size-4 accent-[#d51f2a]"
                  />
                  <span>
                    Publish successfully imported products immediately after their images
                    are uploaded. Products with import or image failures stay as drafts.
                  </span>
                </label>
              )}
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex max-w-2xl gap-3">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#173d64]" />
                  <p className="text-xs leading-6 text-[#526176]">
                    Matching part numbers are updated and new part numbers are created.
                    Matched images upload directly to protected product storage before the
                    selected publication option is applied.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={importWorkbook}
                  disabled={!readyToImport || busy || phase === "complete"}
                  className="button-primary shrink-0 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {busy ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <ArrowRight className="size-4" />
                  )}
                  {phase === "complete"
                    ? "Import complete"
                    : phase === "importing"
                      ? `Importing ${processedProducts} of ${preview.totals.products}…`
                      : phase === "uploading"
                        ? `Uploading ${processedImages} of ${preview.imageManifest.length} images…`
                        : phase === "publishing"
                          ? "Finalizing products…"
                          : resume && resume.offset > 0
                            ? `Resume import (${resume.offset} of ${preview.totals.products})`
                            : publishImmediately
                              ? `Import and publish ${preview.totals.products} products`
                              : `Import ${preview.totals.products} products as drafts`}
                </button>
              </div>
            </div>
          </section>
        )}

        {result && (
          <section
            className={`rounded-[24px] border p-6 shadow-[0_8px_28px_rgba(7,23,43,0.04)] sm:p-8 ${
              result.failed.length === 0 &&
              (outcome?.imageFailures.length ?? 0) === 0 &&
              (outcome?.finalizationFailures.length ?? 0) === 0
                ? "border-[#bfe2cf] bg-[#f3fbf7]"
                : "border-[#ead6b7] bg-[#fffaf0]"
            }`}
          >
            <div className="flex items-start gap-4">
              {result.failed.length === 0 &&
              (outcome?.imageFailures.length ?? 0) === 0 &&
              (outcome?.finalizationFailures.length ?? 0) === 0 ? (
                <CheckCircle2 className="mt-0.5 size-7 shrink-0 text-[#168a55]" />
              ) : (
                <AlertCircle className="mt-0.5 size-7 shrink-0 text-[#b3771f]" />
              )}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#526176]">
                  Import complete
                </p>
                <h2 className="mt-1 text-xl font-black text-[#07172b]">
                  {result.created} created · {result.updated} updated
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#657184]">
                  {result.failed.length === 0 &&
                  (outcome?.imageFailures.length ?? 0) === 0 &&
                  (outcome?.finalizationFailures.length ?? 0) === 0
                    ? publishImmediately
                      ? "The products and their images are now live in the public catalogue."
                      : "The products and their images are saved as drafts for review."
                    : "Some products or images need attention. Correct the reported items and safely run the same package again."}
                </p>
              </div>
            </div>

            {result.failed.length > 0 && (
              <div className="mt-5 space-y-2">
                {result.failed.map((failure) => (
                  <div
                    key={failure.partNumber}
                    className="rounded-xl border border-[#ead6b7] bg-white px-4 py-3"
                  >
                    <p className="text-xs font-black text-[#07172b]">
                      {failure.partNumber} · {failure.name}
                    </p>
                    <p className="mt-1 text-xs text-[#7a5c2d]">{failure.message}</p>
                  </div>
                ))}
              </div>
            )}

            {outcome && (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Stat label="Images uploaded" value={outcome.imagesUploaded} />
                <Stat label="Products published" value={outcome.published} />
                <Stat
                  label="Import issues"
                  value={
                    result.failed.length +
                    outcome.imageFailures.length +
                    outcome.finalizationFailures.length
                  }
                />
              </div>
            )}

            {outcome && outcome.imageFailures.length > 0 && (
              <div className="mt-5 rounded-2xl border border-[#ead6b7] bg-white p-4">
                <p className="text-xs font-black text-[#8a5a16]">
                  {outcome.imageFailures.length} images could not be completed. Their
                  products remain drafts.
                </p>
                <div className="mt-3 space-y-1 text-xs text-[#7a5c2d]">
                  {outcome.imageFailures.slice(0, 20).map((failure, index) => (
                    <p key={`${failure.partNumber}-${failure.filename}-${index}`}>
                      {failure.partNumber} · {failure.filename}: {failure.message}
                    </p>
                  ))}
                  {outcome.imageFailures.length > 20 && (
                    <p>…and {outcome.imageFailures.length - 20} more image issues.</p>
                  )}
                </div>
              </div>
            )}

            {outcome && outcome.finalizationFailures.length > 0 && (
              <p className="mt-5 rounded-xl border border-[#ead6b7] bg-white px-4 py-3 text-xs leading-5 text-[#7a5c2d]">
                {outcome.finalizationFailures.length} products could not be finalized and
                remain as drafts. Running the same package again is safe.
              </p>
            )}

            {(result.mediaPending.images > 0 || result.mediaPending.technicalSheets > 0) && (
              <p className="mt-5 rounded-xl border border-[#dbe3eb] bg-white px-4 py-3 text-xs leading-5 text-[#526176]">
                Remaining media: {result.mediaPending.images} image files and{" "}
                {result.mediaPending.technicalSheets} PDF data sheets. Image failures can
                be retried with the same package; PDF sheet files remain a separate upload.
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/admin/products?status=${outcome?.published ? "published" : "draft"}`}
                className="button-dark"
              >
                View imported products <ArrowRight className="size-4" />
              </Link>
              <button
                type="button"
                onClick={startAgain}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#cbd6e1] bg-white px-5 text-sm font-bold text-[#07172b] hover:bg-[#eef3f7]"
              >
                <RefreshCw className="size-4" /> Import another workbook
              </button>
            </div>
          </section>
        )}
      </div>

      <aside className="space-y-5">
        <section className="rounded-[22px] border border-[#dce3eb] bg-[#07172b] p-6 text-white shadow-[0_12px_32px_rgba(7,23,43,0.12)]">
          <span className="grid size-11 place-items-center rounded-xl bg-white/10 text-[#ff5660]">
            <Download className="size-5" />
          </span>
          <h2 className="mt-5 text-lg font-black">Need a clean template?</h2>
          <p className="mt-2 text-sm leading-6 text-[#acb9c9]">
            Download the workbook with examples and instructions for the data team.
          </p>
          <a
            href="/templates/mutsimoto-product-catalogue-import.xlsx"
            download
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-black text-[#07172b] hover:bg-[#edf2f7]"
          >
            <Download className="size-4" /> Download XLSX template
          </a>
        </section>

        <section className="rounded-[22px] border border-[#dce3eb] bg-white p-6 shadow-[0_8px_28px_rgba(7,23,43,0.04)]">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#d51f2a]">
            Safe import rules
          </p>
          <ol className="mt-4 space-y-4">
            {[
              "The workbook is validated before database changes.",
              "Part numbers decide whether a product is created or updated.",
              "Actual images must match the filenames listed in the workbook.",
              "Immediate publishing is restricted to authorised staff.",
            ].map((text, index) => (
              <li key={text} className="flex gap-3 text-xs leading-5 text-[#526176]">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#eaf1f7] text-[10px] font-black text-[#173d64]">
                  {index + 1}
                </span>
                {text}
              </li>
            ))}
          </ol>
        </section>
      </aside>
    </div>
  );
}
