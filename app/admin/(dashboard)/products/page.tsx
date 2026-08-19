import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, FileSpreadsheet, ImageOff, Plus, Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductBulkTable } from "@/components/admin/product-bulk-table";
import { getAdminProductImageAudit, getAdminProducts } from "@/lib/admin/products";
import { hasPermission } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/session";
import { productCategoryOptions } from "@/types/categories";
import { productAvailabilityOptions } from "@/types/product-admin";
import {
  archiveProduct,
  bulkUpdateProducts,
  deleteProduct,
} from "./actions";

interface ProductsAdminPageProps {
  searchParams: Promise<{
    query?: string;
    status?: string;
    availability?: string;
    category?: string;
    image?: string;
    page?: string;
    message?: string;
  }>;
}

type ProductSearchParams = Awaited<ProductsAdminPageProps["searchParams"]>;

function productPageHref(params: ProductSearchParams, page: number): string {
  const next = new URLSearchParams();
  if (params.query) next.set("query", params.query);
  if (params.status) next.set("status", params.status);
  if (params.availability) next.set("availability", params.availability);
  if (params.category) next.set("category", params.category);
  if (params.image) next.set("image", params.image);
  next.set("page", String(page));
  return `/admin/products?${next.toString()}`;
}

export default async function ProductsAdminPage({ searchParams }: ProductsAdminPageProps) {
  const profile = await requireStaff("products:read");
  const params = await searchParams;
  const [data, imageAudit] = await Promise.all([
    getAdminProducts({
      query: params.query,
      status: params.status,
      availability: params.availability,
      category: params.category,
      image: params.image,
      page: params.page,
    }),
    getAdminProductImageAudit(),
  ]);
  const pageCount = Math.max(1, Math.ceil(data.total / data.pageSize));

  if (data.total > 0 && data.page > pageCount) {
    redirect(productPageHref(params, pageCount));
  }

  const canEdit = hasPermission(profile, "products:write");
  const canPublish = hasPermission(profile, "products:publish");
  const canDelete = profile.role === "super_admin";
  const firstProduct = data.total === 0 ? 0 : (data.page - 1) * data.pageSize + 1;
  const lastProduct = Math.min(data.page * data.pageSize, data.total);
  const returnPath = productPageHref(params, data.page);
  const hasFilters = Boolean(
    params.query || params.status || params.availability || params.category || params.image,
  );

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
        <p
          className="mt-6 rounded-xl border border-[#d7e1eb] bg-white px-4 py-3 text-sm text-[#526176]"
          role="status"
        >
          {params.message}
        </p>
      )}

      <section className="mt-7 grid gap-3 sm:grid-cols-3" aria-label="Product image audit">
        {[
          {
            label: "Published without images",
            value: imageAudit.published,
            href: "/admin/products?status=published&image=missing",
            exportStatus: "published",
            tone: "border-[#efc8cc] bg-[#fff5f5] text-[#a52a35]",
          },
          {
            label: "Drafts without images",
            value: imageAudit.draft,
            href: "/admin/products?status=draft&image=missing",
            exportStatus: "draft",
            tone: "border-[#eadcbf] bg-[#fffaf0] text-[#875d13]",
          },
          {
            label: "All products without images",
            value: imageAudit.total,
            href: "/admin/products?image=missing",
            exportStatus: "all",
            tone: "border-[#d4e0eb] bg-[#f5f8fb] text-[#173b61]",
          },
        ].map((item) => (
          <article key={item.label} className={`rounded-[18px] border p-5 ${item.tone}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.12em]">{item.label}</p>
                <p className="mt-2 text-3xl font-black text-[#07172b]">{item.value}</p>
              </div>
              <ImageOff className="size-5" aria-hidden="true" />
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-[11px] font-black">
              <Link href={item.href} className="hover:underline">Review products</Link>
              <a
                href={`/api/admin/products/image-audit?status=${item.exportStatus}`}
                className="inline-flex items-center gap-1 hover:underline"
              >
                <Download className="size-3.5" /> Export CSV
              </a>
            </div>
          </article>
        ))}
      </section>

      <form
        className="mt-7 grid gap-3 rounded-[20px] border border-[#e0e6ed] bg-white p-4 shadow-[0_8px_28px_rgba(7,23,43,0.04)] md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_160px_180px_160px_160px_auto]"
        action="/admin/products"
      >
        <label className="relative md:col-span-2 xl:col-span-1">
          <span className="sr-only">Search products</span>
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8390a2]" />
          <input
            name="query"
            defaultValue={params.query}
            placeholder="Name, part number, or comma-separated part numbers"
            className="h-12 w-full rounded-xl border border-[#dbe2ea] bg-white pl-11 pr-4 text-sm text-[#17283d] outline-none placeholder:text-[#7c899b] focus:border-[#e52833]"
          />
        </label>
        <label>
          <span className="sr-only">Filter by publication status</span>
          <select
            name="status"
            defaultValue={params.status ?? ""}
            className="h-12 w-full rounded-xl border border-[#dbe2ea] bg-white px-4 text-sm font-bold text-[#334257] outline-none focus:border-[#e52833]"
          >
            <option value="">All publication states</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="review">Under review</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by product image</span>
          <select
            name="image"
            defaultValue={params.image ?? ""}
            className="h-12 w-full rounded-xl border border-[#dbe2ea] bg-white px-4 text-sm font-bold text-[#334257] outline-none focus:border-[#e52833]"
          >
            <option value="">All image states</option>
            <option value="missing">Missing product image</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by availability</span>
          <select
            name="availability"
            defaultValue={params.availability ?? ""}
            className="h-12 w-full rounded-xl border border-[#dbe2ea] bg-white px-4 text-sm font-bold text-[#334257] outline-none focus:border-[#e52833]"
          >
            <option value="">All availability</option>
            {productAvailabilityOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by category</span>
          <select
            name="category"
            defaultValue={params.category ?? ""}
            className="h-12 w-full rounded-xl border border-[#dbe2ea] bg-white px-4 text-sm font-bold text-[#334257] outline-none focus:border-[#e52833]"
          >
            <option value="">All categories</option>
            {productCategoryOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <div className="flex gap-2">
          <button type="submit" className="button-dark flex-1">Apply filters</button>
          {hasFilters && (
            <Link
              href="/admin/products"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#dbe2ea] px-4 text-xs font-black text-[#526176] hover:bg-[#f4f6f8]"
            >
              Clear
            </Link>
          )}
        </div>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-bold text-[#6b788b]">
        <p>
          {data.total === 0
            ? "No products in this view"
            : `Showing ${firstProduct}–${lastProduct} of ${data.total} products`}
        </p>
        <p className="text-[10px] uppercase tracking-[0.1em] text-[#8a95a5]">12 products per page</p>
      </div>

      {data.products.length > 0 ? (
        <ProductBulkTable
          products={data.products}
          canEdit={canEdit}
          canPublish={canPublish}
          canDelete={canDelete}
          returnPath={returnPath}
          bulkAction={bulkUpdateProducts}
          archiveAction={archiveProduct}
          deleteAction={deleteProduct}
        />
      ) : (
        <div className="mt-3 rounded-[22px] border border-[#e0e6ed] bg-white px-6 py-16 text-center shadow-[0_8px_28px_rgba(7,23,43,0.04)]">
          <h2 className="text-lg font-black text-[#07172b]">No products match this view</h2>
          <p className="mt-2 text-sm text-[#748196]">Adjust the search or add the first Supabase-backed product.</p>
        </div>
      )}

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
                Previous
              </Link>
            )}
            {data.page < pageCount && (
              <Link
                href={productPageHref(params, data.page + 1)}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#07172b] px-4 text-xs font-black text-white hover:bg-[#122d4b]"
              >
                Next
              </Link>
            )}
          </div>
        </nav>
      )}
    </>
  );
}
