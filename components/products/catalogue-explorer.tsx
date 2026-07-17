"use client";

import { SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { FilterDrawer } from "@/components/products/filter-drawer";
import { FilterSidebar, type CatalogueFilters, type FilterOptions } from "@/components/products/filter-sidebar";
import { ProductCard } from "@/components/products/product-card";
import { EmptySearchState } from "@/components/ui/empty-state";
import { SearchBar } from "@/components/ui/search-bar";
import type { ApplicationType, FilterCategory, Product } from "@/types";

interface CatalogueExplorerProps {
  products: Product[];
  initialQuery?: string;
  initialCategory?: string;
  initialApplication?: string;
  initialEquipment?: string;
}

const emptyFilters: CatalogueFilters = { category: "", application: "", brand: "", engine: "", equipment: "" };

function unique(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

export function CatalogueExplorer({ products, initialQuery = "", initialCategory = "", initialApplication = "", initialEquipment = "" }: CatalogueExplorerProps) {
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState("part");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<CatalogueFilters>({
    category: (["Oil Filters", "Fuel Filters", "Air Filters"].includes(initialCategory) ? initialCategory : "") as FilterCategory | "",
    application: (["Automotive", "Industrial"].includes(initialApplication) ? initialApplication : "") as ApplicationType | "",
    brand: "",
    engine: "",
    equipment: initialEquipment,
  });

  const options = useMemo<FilterOptions>(() => ({ brands: unique(products.flatMap((product) => product.vehicleBrands)), engines: unique(products.flatMap((product) => product.engineModels)), equipment: unique(products.flatMap((product) => product.equipmentTypes)) }), [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = products.filter((product) => {
      const searchData = [product.name, product.partNumber, product.category, product.shortDescription, ...product.vehicleBrands, ...product.engineModels, ...product.equipmentTypes, ...product.oemNumbers].join(" ").toLowerCase();
      return (!normalizedQuery || searchData.includes(normalizedQuery))
        && (!filters.category || product.category === filters.category)
        && (!filters.application || product.applicationType === filters.application)
        && (!filters.brand || product.vehicleBrands.includes(filters.brand))
        && (!filters.engine || product.engineModels.includes(filters.engine))
        && (!filters.equipment || product.equipmentTypes.includes(filters.equipment));
    });
    return result.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "category") return a.category.localeCompare(b.category) || a.partNumber.localeCompare(b.partNumber);
      return a.partNumber.localeCompare(b.partNumber);
    });
  }, [filters, products, query, sort]);

  function reset() {
    setQuery("");
    setFilters(emptyFilters);
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-16">
      <div className="rounded-[22px] border border-[#ebd3aa] bg-[#ffe9c7] p-4 shadow-[0_8px_30px_rgba(7,23,43,0.045)] sm:p-5"><SearchBar value={query} onValueChange={setQuery} placeholder="Search by part number, OEM number, vehicle, engine, or equipment" /></div>
      <div className="mt-7 flex flex-col gap-4 border-b border-[#e1e7ed] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#657184]"><strong className="text-[#0b1b31]">{filteredProducts.length}</strong> products found</p>
        <div className="flex gap-2"><button type="button" onClick={() => setDrawerOpen(true)} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[#dbe2ea] bg-white px-5 text-sm font-bold text-[#07172b] lg:hidden"><SlidersHorizontal className="size-4" /> Filters</button><label className="sr-only" htmlFor="sort-products">Sort products</label><select id="sort-products" value={sort} onChange={(event) => setSort(event.target.value)} className="h-12 min-w-48 flex-1 rounded-full border border-[#dbe2ea] bg-white px-4 text-sm font-bold text-[#07172b] outline-none focus:border-[#e52833]"><option value="part">Part number</option><option value="name">Product name</option><option value="category">Category</option></select></div>
      </div>
      <div className="mt-7 grid gap-8 lg:grid-cols-[250px_1fr]">
        <FilterSidebar className="hidden rounded-[22px] border border-[#c9dfda] bg-[#eaf4f1] p-5 lg:block" filters={filters} options={options} onChange={setFilters} onReset={reset} />
        <div>{filteredProducts.length > 0 ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <EmptySearchState onReset={reset} />}</div>
      </div>
      <FilterDrawer open={drawerOpen} filters={filters} options={options} onChange={setFilters} onReset={reset} onClose={() => setDrawerOpen(false)} resultCount={filteredProducts.length} />
    </div>
  );
}
