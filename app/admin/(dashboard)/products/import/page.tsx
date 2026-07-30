import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductImportWorkflow } from "@/components/admin/product-import-workflow";
import { requireStaff } from "@/lib/auth/session";

export default async function ProductImportPage() {
  await requireStaff("products:write");

  return (
    <>
      <AdminPageHeader
        eyebrow="Catalogue operations"
        title="Import product workbook"
        description="Check a completed Mutsimoto XLSX template, review every validation message, and create or update product drafts in one controlled workflow."
        actions={
          <Link
            href="/admin/products"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d7dee7] bg-white px-5 text-sm font-bold text-[#07172b] hover:border-[#a8b4c2]"
          >
            <ArrowLeft className="size-4" /> Back to products
          </Link>
        }
      />
      <ProductImportWorkflow />
    </>
  );
}
