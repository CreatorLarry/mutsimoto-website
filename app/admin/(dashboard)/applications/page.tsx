import Link from "next/link";
import { CarFront, ChevronDown, Factory, PencilLine, Plus, Search, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EquipmentApplicationForm, VehicleApplicationForm } from "@/components/admin/application-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminApplications } from "@/lib/admin/applications";
import { getAdminProductOptions } from "@/lib/admin/catalogue-options";
import { hasPermission } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/session";
import type { AdminApplication } from "@/types/catalogue-admin";
import {
  createOrUpdateEquipmentApplication,
  createOrUpdateVehicleApplication,
  deleteApplication,
} from "./actions";

interface ApplicationsAdminPageProps {
  searchParams: Promise<{ query?: string; kind?: string; product?: string; message?: string }>;
}

function yearRange(application: Extract<AdminApplication, { kind: "vehicle" }>): string {
  if (!application.yearFrom && !application.yearTo) return "All applicable years";
  if (application.yearFrom && !application.yearTo) return `${application.yearFrom}–current`;
  if (!application.yearFrom && application.yearTo) return `Up to ${application.yearTo}`;
  return `${application.yearFrom}–${application.yearTo}`;
}

export default async function ApplicationsAdminPage({ searchParams }: ApplicationsAdminPageProps) {
  const profile = await requireStaff("products:read");
  const params = await searchParams;
  const [products, applications] = await Promise.all([
    getAdminProductOptions(),
    getAdminApplications({ query: params.query, kind: params.kind, productId: params.product }),
  ]);
  const canEdit = hasPermission(profile, "products:write");
  const vehicleCount = applications.filter((item) => item.kind === "vehicle").length;
  const equipmentCount = applications.length - vehicleCount;

  return (
    <>
      <AdminPageHeader
        title="Applications"
        description="Manage vehicle and equipment fitment records that power catalogue compatibility and application browsing."
        actions={canEdit && products.length > 0 ? <a href="#add-application" className="button-primary"><Plus className="size-4" /> Add application</a> : undefined}
      />
      {params.message && <p className="mt-6 rounded-xl border border-[#d7e1eb] bg-white px-4 py-3 text-sm text-[#526176]" role="status">{params.message}</p>}

      <section className="mt-7 grid gap-3 sm:grid-cols-3" aria-label="Application summary">
        {[
          ["Visible records", applications.length, "Current filtered view"],
          ["Vehicle fitments", vehicleCount, "Passenger and commercial"],
          ["Equipment fitments", equipmentCount, "Industrial and off-highway"],
        ].map(([label, value, note]) => <div key={String(label)} className="rounded-[18px] border border-[#e0e6ed] bg-white px-5 py-4"><p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#758196]">{label}</p><p className="mt-1 text-2xl font-black text-[#07172b]">{value}</p><p className="mt-1 text-xs text-[#7b8798]">{note}</p></div>)}
      </section>

      {canEdit && products.length > 0 && (
        <section id="add-application" className="mt-6 scroll-mt-8">
          <div className="grid gap-4 xl:grid-cols-2">
            <details className="group rounded-[22px] border border-[#dce3eb] bg-white shadow-[0_8px_28px_rgba(7,23,43,0.04)]" open>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 marker:hidden"><span className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#eaf1f7] text-[#173d64]"><CarFront className="size-5" /></span><span><span className="block text-sm font-black text-[#07172b]">Add vehicle fitment</span><span className="mt-0.5 block text-xs text-[#758196]">Brand, model, engine, and year range</span></span></span><ChevronDown className="size-4 text-[#778497] transition group-open:rotate-180" /></summary>
              <div className="border-t border-[#edf0f3] p-5"><VehicleApplicationForm action={createOrUpdateVehicleApplication} products={products} /></div>
            </details>
            <details className="group rounded-[22px] border border-[#dce3eb] bg-white shadow-[0_8px_28px_rgba(7,23,43,0.04)]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 marker:hidden"><span className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#fff0f1] text-[#c82a35]"><Factory className="size-5" /></span><span><span className="block text-sm font-black text-[#07172b]">Add equipment fitment</span><span className="mt-0.5 block text-xs text-[#758196]">Industry, machine, model, and engine</span></span></span><ChevronDown className="size-4 text-[#778497] transition group-open:rotate-180" /></summary>
              <div className="border-t border-[#edf0f3] p-5"><EquipmentApplicationForm action={createOrUpdateEquipmentApplication} products={products} /></div>
            </details>
          </div>
        </section>
      )}

      {products.length === 0 && canEdit && <div className="mt-6 rounded-[20px] border border-[#f0d6d9] bg-[#fff8f8] p-5"><p className="font-bold text-[#8d2c35]">Add a product before creating fitment records.</p><Link href="/admin/products/new" className="mt-3 inline-flex text-sm font-black text-[#c9202c] hover:underline">Create the first product</Link></div>}

      <form className="mt-7 grid gap-3 rounded-[20px] border border-[#e0e6ed] bg-white p-4 shadow-[0_8px_28px_rgba(7,23,43,0.04)] lg:grid-cols-[1fr_180px_260px_auto]" action="/admin/applications">
        <label className="relative"><span className="sr-only">Search applications</span><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8390a2]" /><input name="query" defaultValue={params.query} placeholder="Product, vehicle, engine, or equipment" className="h-12 w-full rounded-xl border border-[#dbe2ea] pl-11 pr-4 text-sm outline-none focus:border-[#e52833]" /></label>
        <label><span className="sr-only">Application type</span><select name="kind" defaultValue={params.kind ?? ""} className="h-12 w-full rounded-xl border border-[#dbe2ea] bg-white px-4 text-sm font-bold text-[#334257] outline-none focus:border-[#e52833]"><option value="">All applications</option><option value="vehicle">Vehicles</option><option value="equipment">Equipment</option></select></label>
        <label><span className="sr-only">Filter by product</span><select name="product" defaultValue={params.product ?? ""} className="h-12 w-full rounded-xl border border-[#dbe2ea] bg-white px-4 text-sm font-bold text-[#334257] outline-none focus:border-[#e52833]"><option value="">All products</option>{products.map((product) => <option key={product.id} value={product.id}>{product.partNumber} — {product.name}</option>)}</select></label>
        <button type="submit" className="button-dark">Apply filters</button>
      </form>

      <div className="mt-6 space-y-4">
        {applications.map((application) => (
          <article key={`${application.kind}-${application.id}`} className="rounded-[22px] border border-[#e0e6ed] bg-white p-5 shadow-[0_8px_28px_rgba(7,23,43,0.04)] sm:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] ${application.kind === "vehicle" ? "bg-[#eaf1f7] text-[#174c77]" : "bg-[#fff0f1] text-[#a92b35]"}`}>{application.kind === "vehicle" ? <CarFront className="size-3" /> : <Factory className="size-3" />}{application.kind}</span><StatusBadge status={application.product.publicationStatus} /></div>
                <h2 className="mt-4 text-xl font-black tracking-[-0.025em] text-[#07172b]">{application.kind === "vehicle" ? `${application.brand} ${application.model}` : `${application.manufacturer} ${application.model}`}</h2>
                <p className="mt-1 text-sm font-semibold text-[#59687c]">{application.kind === "vehicle" ? `${application.engine ?? "Any listed engine"} · ${yearRange(application)}` : `${application.equipmentType} · ${application.industry}${application.engine ? ` · ${application.engine}` : ""}`}</p>
                <Link href={`/admin/products/${application.product.id}/edit`} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#f2f5f8] px-3 py-2 text-xs font-bold text-[#32445b] hover:bg-[#e9eef3]"><span className="font-mono text-[#d51f2a]">{application.product.partNumber}</span>{application.product.name}</Link>
                {application.notes && <p className="mt-4 max-w-3xl text-sm leading-6 text-[#6a778a]">{application.notes}</p>}
              </div>
              {canEdit && <div className="flex shrink-0 flex-wrap gap-2">
                <details className="group relative">
                  <summary className="inline-flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-full border border-[#d7dfe7] px-4 text-xs font-black text-[#28394f] hover:bg-[#f4f6f8] marker:hidden"><PencilLine className="size-3.5" /> Edit</summary>
                  <div className="mt-3 w-full rounded-2xl border border-[#dce3eb] bg-[#f8fafb] p-4 xl:absolute xl:right-0 xl:z-20 xl:w-[560px] xl:shadow-xl">{application.kind === "vehicle" ? <VehicleApplicationForm action={createOrUpdateVehicleApplication} products={products} application={application} compact /> : <EquipmentApplicationForm action={createOrUpdateEquipmentApplication} products={products} application={application} compact />}</div>
                </details>
                <details className="group relative">
                  <summary className="inline-flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-full border border-[#ead3d6] px-4 text-xs font-black text-[#a6323d] hover:bg-[#fff0f1] marker:hidden"><Trash2 className="size-3.5" /> Remove</summary>
                  <form action={deleteApplication} className="mt-3 rounded-2xl border border-[#edcfd3] bg-[#fff7f8] p-4 xl:absolute xl:right-0 xl:z-30 xl:w-72 xl:shadow-xl"><input type="hidden" name="applicationId" value={application.id} /><input type="hidden" name="kind" value={application.kind} /><p className="text-xs leading-5 text-[#72434a]">Remove this fitment from {application.product.partNumber}? The product itself will not be deleted.</p><button type="submit" className="mt-3 rounded-full bg-[#b52430] px-4 py-2 text-xs font-black text-white hover:bg-[#951c27]">Confirm removal</button></form>
                </details>
              </div>}
            </div>
          </article>
        ))}
        {applications.length === 0 && <div className="rounded-[22px] border border-[#e0e6ed] bg-white px-6 py-16 text-center"><h2 className="text-lg font-black text-[#07172b]">No applications match this view</h2><p className="mt-2 text-sm text-[#748196]">Adjust the filters or add a vehicle or equipment fitment above.</p></div>}
      </div>
    </>
  );
}
