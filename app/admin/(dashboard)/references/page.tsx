import Link from "next/link";
import { ChevronDown, PencilLine, Plus, Search, Shuffle, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ReferenceForm } from "@/components/admin/reference-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminProductOptions } from "@/lib/admin/catalogue-options";
import { getAdminReferences } from "@/lib/admin/references";
import { hasPermission } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/session";
import { createOrUpdateReference, deleteReference } from "./actions";

interface ReferencesAdminPageProps {
  searchParams: Promise<{ query?: string; type?: string; product?: string; message?: string }>;
}

const referenceLabels = {
  oem: "OEM number",
  competitor: "Competitor",
  alternative: "Alternative",
};

export default async function ReferencesAdminPage({ searchParams }: ReferencesAdminPageProps) {
  const profile = await requireStaff("products:read");
  const params = await searchParams;
  const [products, references] = await Promise.all([
    getAdminProductOptions(),
    getAdminReferences({ query: params.query, type: params.type, productId: params.product }),
  ]);
  const canEdit = hasPermission(profile, "products:write");

  return (
    <>
      <AdminPageHeader title="Cross-references" description="Connect OEM, competitor, and alternative part numbers to Mutsimoto filters so catalogue searches return the correct equivalent." actions={canEdit && products.length > 0 ? <a href="#add-reference" className="button-primary"><Plus className="size-4" /> Add reference</a> : undefined} />
      {params.message && <p className="mt-6 rounded-xl border border-[#d7e1eb] bg-white px-4 py-3 text-sm text-[#526176]" role="status">{params.message}</p>}

      {canEdit && products.length > 0 && <section id="add-reference" className="mt-7 scroll-mt-8 rounded-[22px] border border-[#dce3eb] bg-white shadow-[0_8px_28px_rgba(7,23,43,0.04)]"><details className="group" open><summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 marker:hidden"><span className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#fff0f1] text-[#c82a35]"><Shuffle className="size-5" /></span><span><span className="block text-sm font-black text-[#07172b]">Add a searchable part number</span><span className="mt-0.5 block text-xs text-[#758196]">Link an external number to one Mutsimoto product</span></span></span><ChevronDown className="size-4 text-[#778497] transition group-open:rotate-180" /></summary><div className="max-w-3xl border-t border-[#edf0f3] p-5"><ReferenceForm action={createOrUpdateReference} products={products} /></div></details></section>}

      {products.length === 0 && canEdit && <div className="mt-6 rounded-[20px] border border-[#f0d6d9] bg-[#fff8f8] p-5"><p className="font-bold text-[#8d2c35]">Add a product before creating cross-references.</p><Link href="/admin/products/new" className="mt-3 inline-flex text-sm font-black text-[#c9202c] hover:underline">Create the first product</Link></div>}

      <form className="mt-7 grid gap-3 rounded-[20px] border border-[#e0e6ed] bg-white p-4 shadow-[0_8px_28px_rgba(7,23,43,0.04)] lg:grid-cols-[1fr_190px_260px_auto]" action="/admin/references">
        <label className="relative"><span className="sr-only">Search cross-references</span><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8390a2]" /><input name="query" defaultValue={params.query} placeholder="Reference, manufacturer, or Mutsimoto part" className="h-12 w-full rounded-xl border border-[#dbe2ea] pl-11 pr-4 text-sm outline-none focus:border-[#e52833]" /></label>
        <label><span className="sr-only">Reference type</span><select name="type" defaultValue={params.type ?? ""} className="h-12 w-full rounded-xl border border-[#dbe2ea] bg-white px-4 text-sm font-bold text-[#334257] outline-none focus:border-[#e52833]"><option value="">All reference types</option><option value="oem">OEM numbers</option><option value="competitor">Competitors</option><option value="alternative">Alternatives</option></select></label>
        <label><span className="sr-only">Filter by product</span><select name="product" defaultValue={params.product ?? ""} className="h-12 w-full rounded-xl border border-[#dbe2ea] bg-white px-4 text-sm font-bold text-[#334257] outline-none focus:border-[#e52833]"><option value="">All products</option>{products.map((product) => <option key={product.id} value={product.id}>{product.partNumber} — {product.name}</option>)}</select></label>
        <button type="submit" className="button-dark">Apply filters</button>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 px-1"><p className="text-xs font-bold text-[#6b788b]">{references.length} reference{references.length === 1 ? "" : "s"} in this view</p><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8a95a5]">Normalized automatically for search</p></div>

      <div className="mt-4 space-y-3">
        {references.map((reference) => <article key={reference.id} className="rounded-[20px] border border-[#e0e6ed] bg-white p-5 shadow-[0_7px_24px_rgba(7,23,43,0.035)]">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="grid min-w-0 flex-1 gap-4 md:grid-cols-[minmax(180px,0.8fr)_minmax(240px,1.2fr)_minmax(220px,1fr)] md:items-center">
              <div><p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#788598]">External reference</p><p className="mt-1 break-all font-mono text-lg font-black text-[#07172b]">{reference.referenceNumber}</p></div>
              <div><span className="inline-flex rounded-full bg-[#eef2f6] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-[#48586d]">{referenceLabels[reference.referenceType]}</span><p className="mt-2 text-sm font-bold text-[#526176]">{reference.manufacturer}</p></div>
              <Link href={`/admin/products/${reference.product.id}/edit`} className="rounded-xl border border-[#e2e7ed] p-3 hover:bg-[#f6f8fa]"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-black text-[#d51f2a]">{reference.product.partNumber}</span><StatusBadge status={reference.product.publicationStatus} /></div><p className="mt-1 truncate text-xs font-bold text-[#59687c]">{reference.product.name}</p></Link>
            </div>
            {canEdit && <div className="flex shrink-0 flex-wrap gap-2">
              <details className="group relative"><summary className="inline-flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-full border border-[#d7dfe7] px-4 text-xs font-black text-[#28394f] hover:bg-[#f4f6f8] marker:hidden"><PencilLine className="size-3.5" /> Edit</summary><div className="mt-3 w-full rounded-2xl border border-[#dce3eb] bg-[#f8fafb] p-4 xl:absolute xl:right-0 xl:z-20 xl:w-[520px] xl:shadow-xl"><ReferenceForm action={createOrUpdateReference} products={products} reference={reference} compact /></div></details>
              <details className="group relative"><summary className="inline-flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-full border border-[#ead3d6] px-4 text-xs font-black text-[#a6323d] hover:bg-[#fff0f1] marker:hidden"><Trash2 className="size-3.5" /> Remove</summary><form action={deleteReference} className="mt-3 rounded-2xl border border-[#edcfd3] bg-[#fff7f8] p-4 xl:absolute xl:right-0 xl:z-30 xl:w-72 xl:shadow-xl"><input type="hidden" name="referenceId" value={reference.id} /><p className="text-xs leading-5 text-[#72434a]">Remove {reference.referenceNumber} from {reference.product.partNumber}? The product will not be deleted.</p><button type="submit" className="mt-3 rounded-full bg-[#b52430] px-4 py-2 text-xs font-black text-white hover:bg-[#951c27]">Confirm removal</button></form></details>
            </div>}
          </div>
        </article>)}
        {references.length === 0 && <div className="rounded-[22px] border border-[#e0e6ed] bg-white px-6 py-16 text-center"><h2 className="text-lg font-black text-[#07172b]">No cross-references match this view</h2><p className="mt-2 text-sm text-[#748196]">Adjust the filters or add a searchable part number above.</p></div>}
      </div>
    </>
  );
}
