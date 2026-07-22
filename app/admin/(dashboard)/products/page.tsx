import Link from "next/link";
import { Archive, Edit3, Plus, Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { hasPermission } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/session";
import { getAdminProducts } from "@/lib/admin/products";
import { archiveProduct } from "./actions";

interface ProductsAdminPageProps {
  searchParams: Promise<{ query?: string; status?: string; message?: string }>;
}

const categoryLabels = { oil: "Oil filter", fuel: "Fuel filter", air: "Air filter" };

export default async function ProductsAdminPage({ searchParams }: ProductsAdminPageProps) {
  const profile = await requireStaff("products:read");
  const params = await searchParams;
  const products = await getAdminProducts({ query: params.query, status: params.status });
  const canEdit = hasPermission(profile, "products:write");
  const canArchive = hasPermission(profile, "products:publish");

  return (
    <>
      <AdminPageHeader title="Products" description="Manage catalogue details, technical data, fitment, imagery, and publication status." actions={canEdit && <Link href="/admin/products/new" className="button-primary"><Plus className="size-4" /> Add product</Link>} />
      {params.message && <p className="mt-6 rounded-xl border border-[#d7e1eb] bg-white px-4 py-3 text-sm text-[#526176]" role="status">{params.message}</p>}
      <form className="mt-7 grid gap-3 rounded-[20px] border border-[#e0e6ed] bg-white p-4 shadow-[0_8px_28px_rgba(7,23,43,0.04)] sm:grid-cols-[1fr_220px_auto]" action="/admin/products"><label className="relative"><span className="sr-only">Search products</span><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8390a2]" /><input name="query" defaultValue={params.query} placeholder="Search name or part number" className="h-12 w-full rounded-xl border border-[#dbe2ea] pl-11 pr-4 text-sm outline-none focus:border-[#e52833]" /></label><label><span className="sr-only">Filter by status</span><select name="status" defaultValue={params.status ?? ""} className="h-12 w-full rounded-xl border border-[#dbe2ea] bg-white px-4 text-sm font-bold text-[#334257] outline-none focus:border-[#e52833]"><option value="">All statuses</option><option value="published">Published</option><option value="draft">Draft</option><option value="review">Under review</option><option value="archived">Archived</option></select></label><button type="submit" className="button-dark">Apply filters</button></form>
      <div className="mt-6 overflow-hidden rounded-[22px] border border-[#e0e6ed] bg-white shadow-[0_8px_28px_rgba(7,23,43,0.04)]">
        {products.length > 0 ? <div className="overflow-x-auto"><table className="w-full min-w-[840px] text-left"><thead className="bg-[#f3f6f9] text-[10px] font-black uppercase tracking-[0.11em] text-[#6a778a]"><tr><th className="px-6 py-4">Product</th><th className="px-4 py-4">Category</th><th className="px-4 py-4">Availability</th><th className="px-4 py-4">Status</th><th className="px-4 py-4">Updated</th><th className="px-6 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-[#edf0f3]">{products.map((product) => <tr key={product.id} className="hover:bg-[#fafbfc]"><td className="px-6 py-4"><p className="text-sm font-black text-[#07172b]">{product.name}</p><p className="mt-1 font-mono text-[11px] font-bold text-[#748196]">{product.partNumber}{product.featured ? " · Featured" : ""}</p></td><td className="px-4 py-4 text-sm font-semibold text-[#58667a]">{categoryLabels[product.category]}</td><td className="px-4 py-4 text-sm text-[#657184]">{product.availability}</td><td className="px-4 py-4"><StatusBadge status={product.publicationStatus} /></td><td className="px-4 py-4 text-xs text-[#748196]">{new Date(product.updatedAt).toLocaleDateString("en-KE")}</td><td className="px-6 py-4"><div className="flex justify-end gap-2">{canEdit && <Link href={`/admin/products/${product.id}/edit`} className="inline-flex size-10 items-center justify-center rounded-full border border-[#dbe2ea] text-[#07172b] hover:border-[#b4c0ce] hover:bg-[#f1f4f7]" aria-label={`Edit ${product.name}`}><Edit3 className="size-4" /></Link>}{canArchive && product.publicationStatus !== "archived" && <form action={archiveProduct}><input type="hidden" name="productId" value={product.id} /><button type="submit" className="inline-flex size-10 items-center justify-center rounded-full border border-[#ead3d6] text-[#a6323d] hover:bg-[#fff0f1]" aria-label={`Archive ${product.name}`}><Archive className="size-4" /></button></form>}</div></td></tr>)}</tbody></table></div> : <div className="px-6 py-16 text-center"><h2 className="text-lg font-black text-[#07172b]">No products match this view</h2><p className="mt-2 text-sm text-[#748196]">Adjust the search or add the first Supabase-backed product.</p></div>}
      </div>
    </>
  );
}

