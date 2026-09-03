import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DeleteAction } from "@/components/admin/delete-action";
import { ProductForm } from "@/components/admin/product-form";
import { hasPermission } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/session";
import { getCatalogueSchemaHealth } from "@/lib/admin/catalogue-health";
import { getAdminProduct } from "@/lib/admin/products";
import { deleteProduct, updateProduct } from "../../actions";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string }>;
}

export default async function EditProductPage({ params, searchParams }: EditProductPageProps) {
  const profile = await requireStaff("products:write");
  const { id } = await params;
  const { message } = await searchParams;
  const [product, schemaHealth] = await Promise.all([
    getAdminProduct(id),
    getCatalogueSchemaHealth(),
  ]);
  if (!product) notFound();
  const action = updateProduct.bind(null, id);

  return <><AdminPageHeader eyebrow="Product management" title={product.name} description={`${product.partNumber} · ${product.publicationStatus.replaceAll("_", " ")}`} actions={<><Link href="/admin/products" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#d7dee7] bg-white px-5 text-sm font-bold text-[#07172b]"><ArrowLeft className="size-4" /> Products</Link>{product.publicationStatus === "published" && <Link href={`/products/${product.slug}`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#07172b] px-5 text-sm font-bold text-white" target="_blank" rel="noopener noreferrer">Public page <ExternalLink className="size-4" /></Link>}{profile.role === "super_admin" && <DeleteAction action={deleteProduct} fields={{ productId: product.id ?? id }} label="Delete product" confirmMessage={`Permanently delete ${product.name} (${product.partNumber}) and all of its catalogue data? This cannot be undone.`} />}</>} />{message && <p className="mt-6 rounded-xl border border-[#d7e1eb] bg-white px-4 py-3 text-sm text-[#526176]" role="status">{message}</p>}<ProductForm action={action} product={product} canPublish={hasPermission(profile, "products:publish")} schemaReady={schemaHealth.ready} schemaMessage={schemaHealth.message} /></>;
}
