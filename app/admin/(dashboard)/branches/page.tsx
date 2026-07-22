import { Building2, ChevronDown, Clock3, Mail, MapPin, PencilLine, Phone, Plus, Search, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BranchForm } from "@/components/admin/branch-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminBranches } from "@/lib/admin/branches";
import { requireStaff } from "@/lib/auth/session";
import { createOrUpdateBranch, deleteBranch, setBranchActive } from "./actions";

interface BranchesAdminPageProps {
  searchParams: Promise<{ query?: string; status?: string; message?: string }>;
}

export default async function BranchesAdminPage({ searchParams }: BranchesAdminPageProps) {
  const profile = await requireStaff("content:manage");
  const params = await searchParams;
  const branches = await getAdminBranches({ query: params.query, status: params.status });
  const activeCount = branches.filter((branch) => branch.active).length;

  return (
    <>
      <AdminPageHeader title="Branches" description="Maintain the public branch network, contact channels, opening hours, map details, and branch availability." actions={<a href="#add-branch" className="button-primary"><Plus className="size-4" /> Add branch</a>} />
      {params.message && <p className="mt-6 rounded-xl border border-[#d7e1eb] bg-white px-4 py-3 text-sm text-[#526176]" role="status">{params.message}</p>}

      <section className="mt-7 grid gap-3 sm:grid-cols-3" aria-label="Branch summary">
        {[["Branches in view", branches.length], ["Active locations", activeCount], ["Hidden locations", branches.length - activeCount]].map(([label, value]) => <div key={String(label)} className="rounded-[18px] border border-[#e0e6ed] bg-white px-5 py-4"><p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#758196]">{label}</p><p className="mt-1 text-2xl font-black text-[#07172b]">{value}</p></div>)}
      </section>

      <section id="add-branch" className="mt-6 scroll-mt-8 rounded-[22px] border border-[#dce3eb] bg-white shadow-[0_8px_28px_rgba(7,23,43,0.04)]">
        <details className="group"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 marker:hidden"><span className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#eaf1f7] text-[#173d64]"><Building2 className="size-5" /></span><span><span className="block text-sm font-black text-[#07172b]">Create a branch location</span><span className="mt-0.5 block text-xs text-[#758196]">Contact, hours, map coordinates, and visibility</span></span></span><ChevronDown className="size-4 text-[#778497] transition group-open:rotate-180" /></summary><div className="max-w-3xl border-t border-[#edf0f3] p-5"><BranchForm action={createOrUpdateBranch} /></div></details>
      </section>

      <form action="/admin/branches" className="mt-7 grid gap-3 rounded-[20px] border border-[#e0e6ed] bg-white p-4 shadow-[0_8px_28px_rgba(7,23,43,0.04)] sm:grid-cols-[1fr_210px_auto]">
        <label className="relative"><span className="sr-only">Search branches</span><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8390a2]" /><input name="query" defaultValue={params.query} placeholder="Search branch, city, phone, or email" className="h-12 w-full rounded-xl border border-[#dbe2ea] pl-11 pr-4 text-sm outline-none focus:border-[#e52833]" /></label>
        <label><span className="sr-only">Branch status</span><select name="status" defaultValue={params.status ?? ""} className="h-12 w-full rounded-xl border border-[#dbe2ea] bg-white px-4 text-sm font-bold text-[#334257] outline-none focus:border-[#e52833]"><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Hidden</option></select></label>
        <button type="submit" className="button-dark">Apply filters</button>
      </form>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {branches.map((branch) => <article key={branch.id} className="rounded-[22px] border border-[#e0e6ed] bg-white p-5 shadow-[0_8px_28px_rgba(7,23,43,0.04)] sm:p-6">
          <div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><StatusBadge status={branch.active ? "active" : "inactive"} /><span className="font-mono text-[10px] font-bold text-[#8994a3]">/{branch.slug}</span></div><h2 className="mt-3 text-xl font-black text-[#07172b]">{branch.name}</h2><p className="mt-1 text-sm font-semibold text-[#657184]">{branch.address}, {branch.city}</p></div><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#eef4f7] text-[#173d64]"><MapPin className="size-5" /></span></div>
          <div className="mt-5 grid gap-3 border-y border-[#edf0f3] py-4 text-xs text-[#5f6e82] sm:grid-cols-2"><a href={`tel:${branch.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 hover:text-[#d51f2a]"><Phone className="size-3.5" />{branch.phone}</a><a href={`mailto:${branch.email}`} className="inline-flex min-w-0 items-center gap-2 hover:text-[#d51f2a]"><Mail className="size-3.5 shrink-0" /><span className="truncate">{branch.email}</span></a><p className="inline-flex items-start gap-2 sm:col-span-2"><Clock3 className="mt-0.5 size-3.5 shrink-0" />{branch.openingHours}</p></div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <details className="group relative"><summary className="inline-flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-full border border-[#d7dfe7] px-4 text-xs font-black text-[#28394f] hover:bg-[#f4f6f8] marker:hidden"><PencilLine className="size-3.5" /> Edit</summary><div className="mt-3 w-full rounded-2xl border border-[#dce3eb] bg-[#f8fafb] p-4 xl:absolute xl:left-0 xl:z-20 xl:w-[600px] xl:shadow-xl"><BranchForm action={createOrUpdateBranch} branch={branch} compact /></div></details>
            <form action={setBranchActive}><input type="hidden" name="branchId" value={branch.id} /><input type="hidden" name="active" value={String(!branch.active)} /><button type="submit" className={`min-h-10 rounded-full border px-4 text-xs font-black ${branch.active ? "border-[#ead3d6] text-[#a6323d] hover:bg-[#fff0f1]" : "border-[#cce5d8] text-[#187148] hover:bg-[#edf9f3]"}`}>{branch.active ? "Hide branch" : "Activate branch"}</button></form>
            {profile.role === "super_admin" && <details className="group relative ml-auto"><summary className="inline-flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-full border border-[#ead3d6] px-4 text-xs font-black text-[#a6323d] hover:bg-[#fff0f1] marker:hidden"><Trash2 className="size-3.5" /> Delete</summary><form action={deleteBranch} className="mt-3 rounded-2xl border border-[#edcfd3] bg-[#fff7f8] p-4 xl:absolute xl:right-0 xl:z-30 xl:w-72 xl:shadow-xl"><input type="hidden" name="branchId" value={branch.id} /><p className="text-xs leading-5 text-[#72434a]">Permanently delete {branch.name}? Deactivation is safer when the branch has enquiry history.</p><button type="submit" className="mt-3 rounded-full bg-[#b52430] px-4 py-2 text-xs font-black text-white hover:bg-[#951c27]">Confirm permanent deletion</button></form></details>}
          </div>
        </article>)}
      </div>
      {branches.length === 0 && <div className="mt-6 rounded-[22px] border border-[#e0e6ed] bg-white px-6 py-16 text-center"><h2 className="text-lg font-black text-[#07172b]">No branches match this view</h2><p className="mt-2 text-sm text-[#748196]">Adjust the filters or add a new branch above.</p></div>}
    </>
  );
}
