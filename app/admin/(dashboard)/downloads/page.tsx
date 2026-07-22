import { ChevronDown, Download, ExternalLink, FileText, PencilLine, Plus, Search, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DownloadForm } from "@/components/admin/download-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminDownloads } from "@/lib/admin/downloads";
import { requireStaff } from "@/lib/auth/session";
import { createOrUpdateDownload, deleteDownload, setDownloadPublished } from "./actions";

interface DownloadsAdminPageProps {
  searchParams: Promise<{ query?: string; status?: string; category?: string; message?: string }>;
}

function fileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
}

export default async function DownloadsAdminPage({ searchParams }: DownloadsAdminPageProps) {
  const profile = await requireStaff("content:manage");
  const params = await searchParams;
  const allDownloads = await getAdminDownloads();
  const downloads = allDownloads
    .filter((item) => !params.status || (params.status === "published" ? item.published : params.status === "draft" ? !item.published : true))
    .filter((item) => !params.category || item.category === params.category)
    .filter((item) => !params.query || `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(params.query.toLowerCase()));
  const categories = [...new Set(allDownloads.map((item) => item.category))].sort();
  const publishedCount = allDownloads.filter((item) => item.published).length;

  return (
    <>
      <AdminPageHeader title="Downloads" description="Upload, publish, replace, and maintain PDF catalogues, cross-reference guides, and technical documents." actions={<a href="#upload-document" className="button-primary"><Plus className="size-4" /> Upload PDF</a>} />
      {params.message && <p className="mt-6 rounded-xl border border-[#d7e1eb] bg-white px-4 py-3 text-sm text-[#526176]" role="status">{params.message}</p>}

      <section className="mt-7 grid gap-3 sm:grid-cols-3" aria-label="Download summary">
        {[["Stored documents", allDownloads.length], ["Published", publishedCount], ["Drafts", allDownloads.length - publishedCount]].map(([label, value]) => <div key={String(label)} className="rounded-[18px] border border-[#e0e6ed] bg-white px-5 py-4"><p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#758196]">{label}</p><p className="mt-1 text-2xl font-black text-[#07172b]">{value}</p></div>)}
      </section>

      <section id="upload-document" className="mt-6 scroll-mt-8 rounded-[22px] border border-[#dce3eb] bg-white shadow-[0_8px_28px_rgba(7,23,43,0.04)]">
        <details className="group"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 marker:hidden"><span className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#fff0f1] text-[#c82a35]"><Download className="size-5" /></span><span><span className="block text-sm font-black text-[#07172b]">Upload a catalogue PDF</span><span className="mt-0.5 block text-xs text-[#758196]">PDF only · maximum file size 25 MB</span></span></span><ChevronDown className="size-4 text-[#778497] transition group-open:rotate-180" /></summary><div className="max-w-3xl border-t border-[#edf0f3] p-5"><DownloadForm action={createOrUpdateDownload} /></div></details>
      </section>

      <form action="/admin/downloads" className="mt-7 grid gap-3 rounded-[20px] border border-[#e0e6ed] bg-white p-4 shadow-[0_8px_28px_rgba(7,23,43,0.04)] lg:grid-cols-[1fr_190px_220px_auto]">
        <label className="relative"><span className="sr-only">Search documents</span><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8390a2]" /><input name="query" defaultValue={params.query} placeholder="Search title, description, or category" className="h-12 w-full rounded-xl border border-[#dbe2ea] pl-11 pr-4 text-sm outline-none focus:border-[#e52833]" /></label>
        <label><span className="sr-only">Publication status</span><select name="status" defaultValue={params.status ?? ""} className="h-12 w-full rounded-xl border border-[#dbe2ea] bg-white px-4 text-sm font-bold text-[#334257] outline-none focus:border-[#e52833]"><option value="">All statuses</option><option value="published">Published</option><option value="draft">Draft</option></select></label>
        <label><span className="sr-only">Document category</span><select name="category" defaultValue={params.category ?? ""} className="h-12 w-full rounded-xl border border-[#dbe2ea] bg-white px-4 text-sm font-bold text-[#334257] outline-none focus:border-[#e52833]"><option value="">All categories</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
        <button type="submit" className="button-dark">Apply filters</button>
      </form>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {downloads.map((download) => <article key={download.id} className="rounded-[22px] border border-[#e0e6ed] bg-white p-5 shadow-[0_8px_28px_rgba(7,23,43,0.04)] sm:p-6">
          <div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><StatusBadge status={download.published ? "published" : "draft"} /><span className="rounded-full bg-[#eef2f6] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-[#526176]">{download.category}</span></div><h2 className="mt-3 text-xl font-black text-[#07172b]">{download.title}</h2><p className="mt-2 text-sm leading-6 text-[#657184]">{download.description}</p></div><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#fff0f1] text-[#c82a35]"><FileText className="size-5" /></span></div>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-[#edf0f3] py-4 text-xs font-bold text-[#667387]"><span>{fileSize(download.fileSize)} PDF</span><span>Updated {new Date(download.updatedAt).toLocaleDateString("en-KE")}</span><a href={download.publicUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[#d51f2a] hover:underline">Open file <ExternalLink className="size-3" /></a></div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <details className="group relative"><summary className="inline-flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-full border border-[#d7dfe7] px-4 text-xs font-black text-[#28394f] hover:bg-[#f4f6f8] marker:hidden"><PencilLine className="size-3.5" /> Edit or replace</summary><div className="mt-3 w-full rounded-2xl border border-[#dce3eb] bg-[#f8fafb] p-4 xl:absolute xl:left-0 xl:z-20 xl:w-[600px] xl:shadow-xl"><DownloadForm action={createOrUpdateDownload} download={download} compact /></div></details>
            <form action={setDownloadPublished}><input type="hidden" name="downloadId" value={download.id} /><input type="hidden" name="published" value={String(!download.published)} /><button type="submit" className={`min-h-10 rounded-full border px-4 text-xs font-black ${download.published ? "border-[#ead3d6] text-[#a6323d] hover:bg-[#fff0f1]" : "border-[#cce5d8] text-[#187148] hover:bg-[#edf9f3]"}`}>{download.published ? "Unpublish" : "Publish"}</button></form>
            {profile.role === "super_admin" && <details className="group relative ml-auto"><summary className="inline-flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-full border border-[#ead3d6] px-4 text-xs font-black text-[#a6323d] hover:bg-[#fff0f1] marker:hidden"><Trash2 className="size-3.5" /> Delete</summary><form action={deleteDownload} className="mt-3 rounded-2xl border border-[#edcfd3] bg-[#fff7f8] p-4 xl:absolute xl:right-0 xl:z-30 xl:w-72 xl:shadow-xl"><input type="hidden" name="downloadId" value={download.id} /><p className="text-xs leading-5 text-[#72434a]">Permanently delete {download.title} and its stored PDF? This cannot be undone.</p><button type="submit" className="mt-3 rounded-full bg-[#b52430] px-4 py-2 text-xs font-black text-white hover:bg-[#951c27]">Confirm permanent deletion</button></form></details>}
          </div>
        </article>)}
      </div>
      {downloads.length === 0 && <div className="mt-6 rounded-[22px] border border-[#e0e6ed] bg-white px-6 py-16 text-center"><h2 className="text-lg font-black text-[#07172b]">No documents match this view</h2><p className="mt-2 text-sm text-[#748196]">Adjust the filters or upload the first PDF catalogue above.</p></div>}
    </>
  );
}
