import Link from "next/link";
import { redirect } from "next/navigation";
import { Archive, ChevronLeft, ChevronRight, Edit3, FileSpreadsheet, Plus, Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DeleteAction } from "@/components/admin/delete-action";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminProducts } from "@/lib/admin/products";
import { hasPermission } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/session";
import { productCategoryLabels } from "@/types/categories";
import { archiveProduct, deleteProduct } from "./actions";

interface ProductsAdminPageProps {
  searchParams: Promise<{
    query?: string;
    status?: string;
    page?: string;
    message?: string;
  }>;
}

function productPageHref(
  params: Awaited<ProductsAdminPageProps["searchParams"]>,
  page: number,
): string {
  const next = new URLSearchParams();
  if (params.query) next.set("query", params.query);
  if (params.status) next.set("status", params.status);
  next.set("page", String(page));
  return `/admin/products?${next.toString()}`;
}

export default async function ProductsAdminPage({ searchParams }: ProductsAdminPageProps) {
  const profile = await requireStaff("products:read");
  const params = await searchParams;
  const data = await getAdminProducts({
    query: params.query,
    status: params.status,
    page: params.page,
  });
  const pageCount = Math.max(1, Math.ceil(data.total / data.pageSize));

  if (data.total > 0 && data.page > pageCount) {
    redirect(productPageHref(params, pageCount));
  }

  const canEdit = hasPermission(profile, "products:write");
  const canArchive = hasPermission(profile, "products:publish");
  const canDelete = profile.role === "super_admin";
  const firstProduct = data.total === 0 ? 0 : (data.page - 1) * data.pageSize + 1;
  const lastProduct = Math.min(data.page * data.pageSize, data.total);

  return (
    <>
      <AdminPageHeader
        title="Products"
        description="Manage catalogue details, technical data, fitment, imagery, and publication status."
        actions={canEdit && (
          <>
            <Link
              href="/admin/products/import"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d7dee7] bg-white px-5 text-sm font-bold text-[#07172b] hover:border-[#a8b4c2]"
            >
              <FileSpreadsheet className="size-4" /> Import workbook
            </Link>
            <Link href="/admin/products/new" className="button-primary">
              <Plus className="size-4" /> Add product
            </Link>
          </>
        )}
      />

      {params.message && (
        <p className="mt-6 rounded-xl border border-[#d7e1eb] bg-white px-4 py-3 text-sm text-[#526176]" role="status">
          {params.message}
        </p>
      )}

      <form
        className="mt-7 grid gap-3 rounded-[20px] border border-[#e0e6ed] bg-white p-4 shadow-[0_8px_28px_rgba(7,23,43,0.04)] sm:grid-cols-[1fr_220px_auto]"
        action="/admin/products"
      >
        <label className="relative">
          <span className="sr-only">Search products</span>
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8390a2]" />
          <input
            name="query"
            defaultValue={params.query}
            placeholder="Search name or part number"
            className="h-12 w-full rounded-xl border border-[#dbe2ea] bg-white pl-11 pr-4 text-sm text-[#17283d] outline-none placeholder:text-[#7c899b] focus:border-[#e52833]"
          />
        </label>
        <label>
          <span className="sr-only">Filter by status</span>
          <select
            name="status"
            defaultValue={params.status ?? ""}
            className="h-12 w-full rounded-xl border border-[#dbe2ea] bg-white px-4 text-sm font-bold text-[#334257] outline-none focus:border-[#e52833]"
          >
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="review">Under review</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <button type="submit" className="button-dark">Apply filters</button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-bold text-[#6b788b]">
        <p>
          {data.total === 0
            ? "No products in this view"
            : `Showing ${firstProduct}–${lastProduct} of ${data.total} products`}
        </p>
        <p className="text-[10px] uppercase tracking-[0.1em] text-[#8a95a5]">12 products per page</p>
      </div>

      <div className="mt-3 overflow-hidden rounded-[22px] border border-[#e0e6ed] bg-white shadow-[0_8px_28px_rgba(7,23,43,0.04)]">
        {data.products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left">
              <thead className="bg-[#f3f6f9] text-[10px] font-black uppercase tracking-[0.11em] text-[#6a778a]">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-4 py-4">Category</th>
                  <th className="px-4 py-4">Availability</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Updated</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf0f3]">
                {data.products.map((product) => (
                  <tr key={product.id} className="hover:bg-[#fafbfc]">
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-[#07172b]">{product.name}</p>
                      <p className="mt-1 font-mono text-[11px] font-bold text-[#748196]">
                        {product.partNumber}{product.featured ? " · Featured" : ""}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-[#58667a]">
                      {productCategoryLabels[product.category]}
                    </td>
                    <td className="px-4 py-4 text-sm text-[#657184]">{product.availability}</td>
                    <td className="px-4 py-4"><StatusBadge status={product.publicationStatus} /></td>
                    <td className="px-4 py-4 text-xs text-[#748196]">
                      {new Date(product.updatedAt).toLocaleDateString("en-KE")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {canEdit && (
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#dbe2ea] px-3 text-xs font-black text-[#07172b] hover:border-[#b4c0ce] hover:bg-[#f1f4f7]"
                          >
                            <Edit3 className="size-3.5" /> Edit
                          </Link>
                        )}
                        {canArchive && product.publicationStatus !== "archived" && (
                          <form action={archiveProduct}>
                            <input type="hidden" name="productId" value={product.id} />
                            <button
                              type="submit"
                              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#d7dfe7] px-3 text-xs font-black text-[#526176] hover:bg-[#f4f6f8]"
                            >
                              <Archive className="size-3.5" /> Archive
                            </button>
                          </form>
                        )}
                        {canDelete && (
                          <DeleteAction
                            action={deleteProduct}
                            fields={{ productId: product.id }}
                            label="Delete"
                            confirmMessage={`Permanently delete ${product.name} (${product.partNumber})? Its specifications, references, applications, views, and stored product media will also be removed. This cannot be undone.`}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <h2 className="text-lg font-black text-[#07172b]">No products match this view</h2>
            <p className="mt-2 text-sm text-[#748196]">Adjust the search or add the first Supabase-backed product.</p>
          </div>
        )}
      </div>

      {pageCount > 1 && (
        <nav
          className="mt-6 flex flex-col gap-3 rounded-[18px] border border-[#e0e6ed] bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
          aria-label="Product pages"
        >
          <span className="px-2 text-xs font-bold text-[#718096]">Page {data.page} of {pageCount}</span>
          <div className="flex gap-2">
            {data.page > 1 && (
              <Link
                href={productPageHref(params, data.page - 1)}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#dbe2ea] px-4 text-xs font-black text-[#334257] hover:bg-[#f4f6f8]"
              >
                <ChevronLeft className="size-4" /> Previous
              </Link>
            )}
            {data.page < pageCount && (
              <Link
                href={productPageHref(params, data.page + 1)}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#07172b] px-4 text-xs font-black text-white hover:bg-[#122d4b]"
              >
                Next <ChevronRight className="size-4" />
              </Link>
            )}
          </div>
        </nav>
      )}
    </>
  );
}
