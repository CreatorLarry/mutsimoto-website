import Link from "next/link";
import { AlertTriangle, ChevronLeft, ChevronRight, FileClock, Plus, RotateCcw, Search, ShieldCheck } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { auditActionOptions, auditEntityOptions, getAdminAuditLogs, type AuditLogFilters, type AdminAuditLog } from "@/lib/admin/audit-logs";
import { requireStaff } from "@/lib/auth/session";

interface ActivityLogsPageProps {
  searchParams: Promise<AuditLogFilters>;
}

const actionLabels: Record<string, string> = {
  product_status_changed: "Product status changed",
  product_updated: "Product updated",
  products_insert: "Product created",
  products_delete: "Product deleted",
  staff_profile_updated: "Staff access changed",
  staff_user_deleted: "Staff account deleted",
  enquiry_updated: "Enquiry updated",
  enquiries_delete: "Enquiry deleted",
  branches_insert: "Branch created",
  branches_update: "Branch updated",
  branches_delete: "Branch deleted",
  downloads_insert: "Download created",
  downloads_update: "Download updated",
  downloads_delete: "Download deleted",
  content_pages_insert: "Company content created",
  content_pages_update: "Company content updated",
  content_pages_delete: "Company content deleted",
  leadership_profiles_insert: "Leadership profile created",
  leadership_profiles_update: "Leadership profile updated",
  leadership_profiles_delete: "Leadership profile deleted",
};

const entityLabels: Record<string, string> = {
  products: "Products",
  profiles: "Staff users",
  enquiries: "Enquiries",
  branches: "Branches",
  downloads: "Downloads",
  content_pages: "Company content",
  leadership_profiles: "Leadership",
};

function textValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function changedFields(log: AdminAuditLog): string[] {
  const value = log.metadata.changed_fields;
  return Array.isArray(value) ? value.filter((field): field is string => typeof field === "string") : [];
}

function recordHref(log: AdminAuditLog): string | null {
  if (log.entityType === "products" && log.entityId && !log.action.endsWith("_delete")) return `/admin/products/${log.entityId}/edit`;
  if (log.entityType === "profiles") return "/admin/users";
  if (log.entityType === "enquiries") return "/admin/enquiries";
  if (log.entityType === "branches") return "/admin/branches";
  if (log.entityType === "downloads") return "/admin/downloads";
  if (["content_pages", "leadership_profiles"].includes(log.entityType)) return "/admin/settings";
  return null;
}

function pageHref(params: AuditLogFilters, page: number): string {
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && key !== "page") next.set(key, value);
  }
  next.set("page", String(page));
  return `/admin/logs?${next.toString()}`;
}

export default async function ActivityLogsPage({ searchParams }: ActivityLogsPageProps) {
  await requireStaff("audit:read");
  const params = await searchParams;
  const data = await getAdminAuditLogs(params);
  const pageCount = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <>
      <AdminPageHeader
        eyebrow="Security and accountability"
        title="Activity logs"
        description="A protected, chronological record of administrative changes. Only super administrators can view this history, and dashboard users cannot edit or delete it."
      />

      <section className="mt-7 grid gap-3 sm:grid-cols-3" aria-label="Activity summary">
        <div className="rounded-[18px] border border-[#e0e6ed] bg-white px-5 py-4"><p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#758196]">Matching activities</p><p className="mt-1 text-2xl font-black text-[#07172b]">{data.total.toLocaleString()}</p></div>
        <div className="rounded-[18px] border border-[#e0e6ed] bg-white px-5 py-4"><p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#758196]">Current page</p><p className="mt-1 text-2xl font-black text-[#07172b]">{data.page} of {pageCount}</p></div>
        <div className="rounded-[18px] border border-[#cce7da] bg-[#eef8f3] px-5 py-4"><p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#37735d]">Log protection</p><p className="mt-1 inline-flex items-center gap-2 text-sm font-black text-[#176b4c]"><ShieldCheck className="size-5" />Append-only for staff</p></div>
      </section>

      <form action="/admin/logs" className="mt-6 grid gap-3 rounded-[20px] border border-[#e0e6ed] bg-white p-4 shadow-[0_8px_28px_rgba(7,23,43,0.04)] md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_1fr_150px_auto]">
        <label className="relative"><span className="sr-only">Search activity logs</span><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8390a2]" /><input name="query" defaultValue={params.query} placeholder="Action, record type, or ID" className="h-12 w-full rounded-xl border border-[#dbe2ea] pl-11 pr-4 text-sm outline-none focus:border-[#e52833]" /></label>
        <label><span className="sr-only">Activity type</span><select name="action" defaultValue={params.action ?? ""} className="h-12 w-full rounded-xl border border-[#dbe2ea] bg-white px-3 text-xs font-bold text-[#334257] outline-none focus:border-[#e52833]"><option value="">All activities</option>{auditActionOptions.map((action) => <option key={action} value={action}>{actionLabels[action]}</option>)}</select></label>
        <label><span className="sr-only">Record type</span><select name="entity" defaultValue={params.entity ?? ""} className="h-12 w-full rounded-xl border border-[#dbe2ea] bg-white px-3 text-xs font-bold text-[#334257] outline-none focus:border-[#e52833]"><option value="">All record types</option>{auditEntityOptions.map((entity) => <option key={entity} value={entity}>{entityLabels[entity]}</option>)}</select></label>
        <label><span className="sr-only">Staff member</span><select name="actor" defaultValue={params.actor ?? ""} className="h-12 w-full rounded-xl border border-[#dbe2ea] bg-white px-3 text-xs font-bold text-[#334257] outline-none focus:border-[#e52833]"><option value="">All staff</option>{data.actors.map((actor) => <option key={actor.id} value={actor.id}>{actor.fullName}</option>)}</select></label>
        <label><span className="sr-only">Date range</span><select name="days" defaultValue={params.days ?? "30"} className="h-12 w-full rounded-xl border border-[#dbe2ea] bg-white px-3 text-xs font-bold text-[#334257] outline-none focus:border-[#e52833]"><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="365">Last year</option><option value="all">All time</option></select></label>
        <div className="flex gap-2"><button type="submit" className="button-dark min-h-12 px-5">Filter</button><Link href="/admin/logs" className="grid size-12 place-items-center rounded-xl border border-[#dbe2ea] text-[#526176] hover:bg-[#f2f5f7]" aria-label="Reset filters"><RotateCcw className="size-4" /></Link></div>
      </form>

      <section className="mt-6 space-y-3" aria-label="Recorded administrative activity">
        {data.logs.map((log) => {
          const destructive = log.action.endsWith("_delete");
          const created = log.action.endsWith("_insert");
          const fields = changedFields(log);
          const label = textValue(log.metadata.entity_label);
          const actorName = log.actor?.fullName ?? textValue(log.metadata.actor_name) ?? "System or deleted user";
          const actorEmail = log.actor?.email ?? textValue(log.metadata.actor_email);
          const href = recordHref(log);

          return (
            <article key={log.id} className={`rounded-[20px] border bg-white p-5 shadow-[0_8px_28px_rgba(7,23,43,0.035)] ${destructive ? "border-[#efc8cc]" : "border-[#e0e6ed]"}`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                <div className={`grid size-11 shrink-0 place-items-center rounded-2xl ${destructive ? "bg-[#fff0f1] text-[#b52430]" : created ? "bg-[#e8f4ef] text-[#28765b]" : "bg-[#eaf0f6] text-[#173b61]"}`}>{destructive ? <AlertTriangle className="size-5" /> : created ? <Plus className="size-5" /> : <FileClock className="size-5" />}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.09em] ${destructive ? "bg-[#fff0f1] text-[#a6323d]" : "bg-[#edf2f7] text-[#526176]"}`}>{actionLabels[log.action] ?? log.action.replaceAll("_", " ")}</span><span className="rounded-full bg-[#f5f7f9] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.09em] text-[#748196]">{entityLabels[log.entityType] ?? log.entityType}</span></div>
                  <h2 className="mt-3 text-base font-black text-[#07172b]">{label ?? log.entityId ?? "Administrative record"}</h2>
                  <p className="mt-1 text-xs text-[#657184]"><strong className="font-black text-[#35445a]">{actorName}</strong>{actorEmail ? ` · ${actorEmail}` : ""}</p>
                  {fields.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{fields.map((field) => <span key={field} className="rounded-md bg-[#f2f5f7] px-2 py-1 font-mono text-[10px] text-[#59687b]">{field}</span>)}</div>}
                  <div className="mt-4 flex flex-wrap items-center gap-4"><time className="text-[11px] font-semibold text-[#7c899b]" dateTime={log.createdAt}>{new Date(log.createdAt).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "medium" })}</time>{href && <Link href={href} className="text-[11px] font-black text-[#d51f2a] hover:text-[#a91b25]">Review record</Link>}<details><summary className="cursor-pointer text-[11px] font-black text-[#526176] hover:text-[#07172b]">Technical details</summary><pre className="mt-3 max-h-80 max-w-full overflow-auto rounded-xl bg-[#07172b] p-4 text-[10px] leading-5 text-[#d5deea]">{JSON.stringify(log.metadata, null, 2)}</pre></details></div>
                </div>
                <span className="shrink-0 font-mono text-[10px] text-[#9aa5b4]">LOG-{log.id}</span>
              </div>
            </article>
          );
        })}
        {data.logs.length === 0 && <div className="rounded-[22px] border border-[#e0e6ed] bg-white px-6 py-16 text-center"><FileClock className="mx-auto size-8 text-[#94a0b0]" /><h2 className="mt-4 text-lg font-black text-[#07172b]">No activity matches these filters</h2><p className="mt-2 text-sm text-[#748196]">Try a wider date range or reset the filters.</p></div>}
      </section>

      {pageCount > 1 && <nav className="mt-6 flex items-center justify-between rounded-[18px] border border-[#e0e6ed] bg-white p-3" aria-label="Activity log pages"><span className="px-2 text-xs font-bold text-[#718096]">Page {data.page} of {pageCount}</span><div className="flex gap-2">{data.page > 1 && <Link href={pageHref(params, data.page - 1)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#dbe2ea] px-4 text-xs font-black text-[#334257]"><ChevronLeft className="size-4" />Previous</Link>}{data.page < pageCount && <Link href={pageHref(params, data.page + 1)} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#07172b] px-4 text-xs font-black text-white">Next<ChevronRight className="size-4" /></Link>}</div></nav>}
    </>
  );
}
