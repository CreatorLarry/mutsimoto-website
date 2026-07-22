import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";
import { hasPermission } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/session";
import { createProduct } from "../actions";

interface NewProductPageProps { searchParams: Promise<{ message?: string }> }

export default async function NewProductPage({ searchParams }: NewProductPageProps) {
  const profile = await requireStaff("products:write");
  const { message } = await searchParams;
  return <><AdminPageHeader eyebrow="Product management" title="Add product" description="Create a complete catalogue record, then save it as a draft, submit it for review, or publish it if your role allows." actions={<Link href="/admin/products" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#d7dee7] bg-white px-5 text-sm font-bold text-[#07172b]"><ArrowLeft className="size-4" /> Products</Link>} />{message && <p className="mt-6 rounded-xl border border-[#f2c5c8] bg-[#fff2f3] px-4 py-3 text-sm text-[#9f1e27]" role="alert">{message}</p>}<ProductForm action={createProduct} canPublish={hasPermission(profile, "products:publish")} /></>;
}

