"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { productCategoryLabels } from "@/types/categories";
import type {
  ProductImportCommitResult,
  ProductImportPreview,
} from "@/types/product-import";

type WorkflowPhase = "idle" | "previewing" | "ready" | "importing" | "complete";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

export function ProductImportWorkflow() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<WorkflowPhase>("idle");
  const [preview, setPreview] = useState<ProductImportPreview | null>(null);
  const [result, setResult] = useState<ProductImportCommitResult | null>(null);
  const [error, setError] = useState("");
  const busy = phase === "previewing" || phase === "importing";

  function selectFile(nextFile: File | null) {
    setFile(nextFile);
    setPreview(null);
    setResult(null);
    setError("");
    setPhase("idle");
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0] ?? null);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (busy) return;
    selectFile(event.dataTransfer.files?.[0] ?? null);
  }

  async function previewWorkbook() {
    if (!file) {
      setError("Choose the completed XLSX workbook first.");
      return;
    }
    setPhase("previewing");
    setPreview(null);
    setResult(null);
    setError("");
    const formData = new FormData();
    formData.set("workbook", file);

    try {
      const response = await fetch("/api/admin/products/import/preview", {
        method: "POST",
        body: formData,
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        throw new Error(messageFromResponse(body, "The workbook could not be previewed."));
      }
      setPreview(body as ProductImportPreview);
      setPhase("ready");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The workbook could not be previewed.");
      setPhase("idle");
    }
  }

  async function importWorkbook() {
    if (!file || !preview?.valid) return;
    setPhase("importing");
    setResult(null);
    setError("");
    const formData = new FormData();
    formData.set("workbook", file);

    try {
      const response = await fetch("/api/admin/products/import/commit", {
        method: "POST",
        body: formData,
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        throw new Error(messageFromResponse(body, "The workbook could not be imported."));
      }
      setResult(body as ProductImportCommitResult);
      setPhase("complete");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The workbook could not be imported.");
      setPhase("ready");
    }
  }

  function startAgain() {
    if (inputRef.current) inputRef.current.value = "";
    selectFile(null);
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
                Choose the completed workbook
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#657184]">
                Use the official Mutsimoto XLSX template. The workbook is checked before
                any catalogue records are changed.
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
              Drop the XLSX workbook here
            </p>
            <p className="mt-1 text-xs text-[#748196]">or choose it from this computer</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full border border-[#cdd7e1] bg-white px-4 text-xs font-black text-[#24364c] hover:border-[#9caaba] hover:bg-[#eef3f7] disabled:opacity-50"
            >
              Browse files
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={onFileChange}
              className="sr-only"
            />
          </div>

          {file && (
            <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-[#dbe4ec] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-[#07172b]">{file.name}</p>
                <p className="mt-1 text-xs text-[#7c899b]">{formatBytes(file.size)}</p>
              </div>
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
          )}
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
                  preview.valid
                    ? "bg-[#e8f7ef] text-[#137047]"
                    : "bg-[#fff0f1] text-[#9e303a]"
                }`}
              >
                {preview.valid ? (
                  <CheckCircle2 className="size-3.5" />
                ) : (
                  <AlertCircle className="size-3.5" />
                )}
                {preview.valid ? "Ready to import" : "Corrections required"}
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
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex max-w-2xl gap-3">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#173d64]" />
                  <p className="text-xs leading-6 text-[#526176]">
                    Matching part numbers are updated; new part numbers are created. Every
                    imported product is saved as a draft for staff review. Images and PDFs
                    stay pending until their actual files are uploaded.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={importWorkbook}
                  disabled={!preview.valid || phase === "importing" || phase === "complete"}
                  className="button-primary shrink-0 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {phase === "importing" ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <ArrowRight className="size-4" />
                  )}
                  {phase === "complete"
                    ? "Import complete"
                    : phase === "importing"
                    ? `Importing ${preview.totals.products} products…`
                    : `Import ${preview.totals.products} products as drafts`}
                </button>
              </div>
            </div>
          </section>
        )}

        {result && (
          <section
            className={`rounded-[24px] border p-6 shadow-[0_8px_28px_rgba(7,23,43,0.04)] sm:p-8 ${
              result.failed.length === 0
                ? "border-[#bfe2cf] bg-[#f3fbf7]"
                : "border-[#ead6b7] bg-[#fffaf0]"
            }`}
          >
            <div className="flex items-start gap-4">
              {result.failed.length === 0 ? (
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
                  {result.failed.length === 0
                    ? "The catalogue drafts are now available in Products for review."
                    : `${result.failed.length} products could not be completed. Correct them and safely import the same workbook again.`}
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

            {(result.mediaPending.images > 0 || result.mediaPending.technicalSheets > 0) && (
              <p className="mt-5 rounded-xl border border-[#dbe3eb] bg-white px-4 py-3 text-xs leading-5 text-[#526176]">
                Media pending: {result.mediaPending.images} image files and{" "}
                {result.mediaPending.technicalSheets} PDF data sheets were referenced in
                the workbook. Their filenames are validated, but the actual files still
                need to be uploaded.
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/admin/products?status=draft" className="button-dark">
                Review draft products <ArrowRight className="size-4" />
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
              "Imported records always return to draft status.",
              "Images and PDFs are never accepted by filename alone.",
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
