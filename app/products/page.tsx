import type { Metadata } from "next";
import { CatalogueExplorer } from "@/components/products/catalogue-explorer";
import { PageHero } from "@/components/ui/page-hero";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Product Catalogue", description: "Search and filter Mutsimoto oil, fuel, and air filters by part number, vehicle, engine, or equipment." };

interface ProductsPageProps {
  searchParams: Promise<{ q?: string; category?: string; application?: string; equipment?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const [products, params] = await Promise.all([getProducts(), searchParams]);
  return (
    <>
      <PageHero eyebrow="Product catalogue" title="Find the right filter for the job" description="Search Mutsimoto oil, fuel, and air filters by part number, OEM reference, vehicle, engine, or equipment." crumbs={[{ label: "Home", href: "/" }, { label: "Products" }]} />
      <CatalogueExplorer products={products} initialQuery={params.q} initialCategory={params.category} initialApplication={params.application} initialEquipment={params.equipment} />
    </>
  );
}
