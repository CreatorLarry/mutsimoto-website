import type { AdminDownload } from "@/types/content-admin";

interface DownloadFormProps {
  action: (formData: FormData) => Promise<void>;
  download?: AdminDownload;
  compact?: boolean;
}

const fieldClass = "mt-2 h-11 w-full rounded-xl border border-[#d9e1e9] bg-white px-3 text-sm text-[#26364b] outline-none transition focus:border-[#e52833] focus:ring-2 focus:ring-[#e52833]/10";
const textAreaClass = "mt-2 min-h-24 w-full resize-y rounded-xl border border-[#d9e1e9] bg-white px-3 py-3 text-sm text-[#26364b] outline-none transition focus:border-[#e52833] focus:ring-2 focus:ring-[#e52833]/10";
const labelClass = "text-[10px] font-black uppercase tracking-[0.11em] text-[#637186]";

export function DownloadForm({ action, download, compact = false }: DownloadFormProps) {
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      {download && <input type="hidden" name="downloadId" value={download.id} />}
      <label className={`${labelClass} sm:col-span-2`}>Document title<input name="title" defaultValue={download?.title} required maxLength={180} placeholder="e.g. Complete Product Catalogue 2026" className={fieldClass} /></label>
      <label className={`${labelClass} sm:col-span-2`}>Description<textarea name="description" defaultValue={download?.description} required maxLength={1000} placeholder="Explain what buyers and technicians will find in this document." className={textAreaClass} /></label>
      <label className={labelClass}>Category<input name="category" list="download-categories" defaultValue={download?.category} required maxLength={100} placeholder="e.g. Product catalogue" className={fieldClass} /><datalist id="download-categories"><option value="Product catalogue" /><option value="Oil filters" /><option value="Fuel filters" /><option value="Air filters" /><option value="Cross-reference" /><option value="Technical guide" /></datalist></label>
      <label className={labelClass}>{download ? "Replace PDF (optional)" : "PDF file"}<input name="document" type="file" accept="application/pdf,.pdf" required={!download} className="mt-2 block w-full rounded-xl border border-[#d9e1e9] bg-white px-3 py-2 text-xs text-[#526176] file:mr-3 file:rounded-full file:border-0 file:bg-[#e9eef3] file:px-3 file:py-2 file:text-xs file:font-black file:text-[#26364b]" /></label>
      <label className="flex items-start gap-3 rounded-xl border border-[#dce3eb] bg-[#f7f9fb] p-3 text-xs font-bold leading-5 text-[#526176] sm:col-span-2"><input name="published" type="checkbox" defaultChecked={download?.published ?? false} className="mt-1 accent-[#d51f2a]" />Publish this document on the public Downloads page immediately.</label>
      <div className="sm:col-span-2"><button type="submit" className={compact ? "button-dark min-h-10 px-4 py-2 text-xs" : "button-primary"}>{download ? "Save document" : "Upload document"}</button></div>
    </form>
  );
}
