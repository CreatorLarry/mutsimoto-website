"use client";

import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FilterDrawer } from "@/components/products/filter-drawer";
import { FilterSidebar, type CatalogueFilters, type FilterOptions } from "@/components/products/filter-sidebar";
import { ProductCard } from "@/components/products/product-card";
import { EmptySearchState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { SearchBar } from "@/components/ui/search-bar";
import type { ApplicationType, FilterCategory, Product } from "@/types";
import { productCategoryOptions } from "@/types/categories";

interface CatalogueExplorerProps {
  products: Product[];
  initialQuery?: string;
  initialCategory?: string;
  initialApplication?: string;
  initialEquipment?: string;
}

const PAGE_SIZE = 12;
const emptyFilters: CatalogueFilters = { category: "", application: "", brand: "", engine: "", equipment: "" };

function unique(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function paginationItems(currentPage: number, pageCount: number): Array<number | string> {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);

  const items: Array<number | string> = [1];
  if (currentPage > 4) items.push("start-ellipsis");
  for (let page = Math.max(2, currentPage - 1); page <= Math.min(pageCount - 1, currentPage + 1); page += 1) {
    items.push(page);
  }
  if (currentPage < pageCount - 3) items.push("end-ellipsis");
  items.push(pageCount);
  return items;
}

export function CatalogueExplorer({
  products,
  initialQuery = "",
  initialCategory = "",
  initialApplication = "",
  initialEquipment = "",
}: CatalogueExplorerProps) {
  const [query, setQuery] = useState(initialQuery);
  const [remoteSearch, setRemoteSearch] = useState<{ query: string; products: Product[]; loading: boolean; error: string } | null>(null);
  const [sort, setSort] = useState("part");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<CatalogueFilters>({
    category: (productCategoryOptions.some((option) => option.label === initialCategory) ? initialCategory : "") as FilterCategory | "",
    application: (["Automotive", "Industrial"].includes(initialApplication) ? initialApplication : "") as ApplicationType | "",
    brand: "",
    engine: "",
    equipment: initialEquipment,
  });

  useEffect(() => {
    const cleanQuery = query.trim();
    if (cleanQuery.length < 2) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setRemoteSearch({ query: cleanQuery, products: [], loading: true, error: "" });
      try {
        const response = await fetch(`/api/catalogue/search?q=${encodeURIComponent(cleanQuery)}`, { signal: controller.signal });
        const payload = await response.json() as { products?: Product[]; message?: string };
        if (!response.ok) throw new Error(payload.message ?? "Search is unavailable.");
        setRemoteSearch({ query: cleanQuery, products: payload.products ?? [], loading: false, error: "" });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setRemoteSearch({ query: cleanQuery, products: [], loading: false, error: error instanceof Error ? error.message : "Search is unavailable." });
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [products, query]);

  const cleanQuery = query.trim();
  const activeRemoteSearch = cleanQuery.length >= 2 && remoteSearch?.query === cleanQuery ? remoteSearch : null;
  const searchProducts = useMemo(
    () => cleanQuery.length >= 2 ? activeRemoteSearch?.products ?? [] : products,
    [activeRemoteSearch, cleanQuery, products],
  );
  const searchLoading = cleanQuery.length >= 2 && (!activeRemoteSearch || activeRemoteSearch.loading);
  const searchError = activeRemoteSearch?.error ?? "";

  const options = useMemo<FilterOptions>(() => ({
    brands: unique(products.flatMap((product) => product.vehicleBrands)),
    engines: unique(products.flatMap((product) => product.engineModels)),
    equipment: unique(products.flatMap((product) => product.equipmentTypes)),
  }), [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = searchProducts.filter((product) => {
      const searchData = [product.name, product.partNumber, product.category, product.shortDescription, ...product.vehicleBrands, ...product.engineModels, ...product.equipmentTypes, ...product.oemNumbers].join(" ").toLowerCase();
      return (!normalizedQuery || normalizedQuery.length >= 2 || searchData.includes(normalizedQuery))
        && (!filters.category || product.category === filters.category)
        && (!filters.application || product.applicationType === filters.application || product.applicationType === "Both")
        && (!filters.brand || product.vehicleBrands.includes(filters.brand))
        && (!filters.engine || product.engineModels.includes(filters.engine))
        && (!filters.equipment || product.equipmentTypes.includes(filters.equipment));
    });
    return result.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "category") return a.category.localeCompare(b.category) || a.partNumber.localeCompare(b.partNumber);
      return a.partNumber.localeCompare(b.partNumber);
    });
  }, [filters, query, searchProducts, sort]);

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = useMemo(
    () => filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredProducts, page],
  );
  const visiblePages = useMemo(() => paginationItems(page, pageCount), [page, pageCount]);

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  function handleFilterChange(nextFilters: CatalogueFilters) {
    setFilters(nextFilters);
    setPage(1);
  }

  function reset() {
    setQuery("");
    setFilters(emptyFilters);
    setPage(1);
  }

  function goToPage(nextPage: number) {
    const safePage = Math.min(Math.max(nextPage, 1), pageCount);
    if (safePage === page) return;
    setPage(safePage);
    window.requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
    });
  }

  const firstVisible = filteredProducts.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastVisible = Math.min(page * PAGE_SIZE, filteredProducts.length);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-16">
      <div className="brushed-metal rounded-lg border border-[#353d43] border-l-[3px] border-l-[#ef3340] bg-[#171c20] p-4 shadow-[0_12px_34px_rgba(0,0,0,0.3)] sm:p-5">
        <SearchBar value={query} onValueChange={handleQueryChange} placeholder="Search by part number, OEM number, vehicle, engine, or equipment" />
      </div>

      <div className="mt-7 flex flex-col gap-4 border-b border-[#353d43] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm uppercase tracking-[0.06em] text-[#aeb4b8]"><strong className="font-mono text-[#ef3340]">{filteredProducts.length}</strong> products found</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setDrawerOpen(true)} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md border border-[#697177] bg-[#171c20] px-5 text-xs font-extrabold uppercase tracking-[0.06em] text-white hover:border-white lg:hidden"><SlidersHorizontal className="size-4" /> Filters</button>
          <label className="sr-only" htmlFor="sort-products">Sort products</label>
          <select
            id="sort-products"
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setPage(1);
            }}
            className="h-12 min-w-48 flex-1 rounded-md border border-[#535b61] bg-[#171c20] px-4 text-xs font-extrabold uppercase tracking-[0.05em] text-white outline-none [color-scheme:dark] focus:border-[#ef3340]"
          >
            <option value="part">Part number</option>
            <option value="name">Product name</option>
            <option value="category">Category</option>
          </select>
        </div>
      </div>

      <div className="mt-7 grid gap-8 lg:grid-cols-[250px_1fr]">
        <FilterSidebar className="hidden rounded-lg border border-[#353d43] bg-[#14191d] p-5 shadow-[0_12px_30px_rgba(0,0,0,0.24)] lg:block" filters={filters} options={options} onChange={handleFilterChange} onReset={reset} />
        <div ref={resultsRef} className="scroll-mt-28">
          {searchError && <p className="mb-5 rounded-md border border-[#8e2d35] bg-[#321418] px-4 py-3 text-sm text-[#ffb8bd]" role="alert">{searchError}</p>}
          {searchLoading ? (
            <LoadingState />
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="mb-4 flex items-center justify-between gap-3 text-xs font-bold text-[#9fa8af]">
                <span>Showing {firstVisible}–{lastVisible} of {filteredProducts.length}</span>
                <span className="font-mono uppercase tracking-[0.08em]">12 per page</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
                {paginatedProducts.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>

              {pageCount > 1 && (
                <nav className="mt-8 flex flex-col gap-3 rounded-lg border border-[#353d43] bg-[#14191d] p-3 sm:flex-row sm:items-center sm:justify-between" aria-label="Catalogue pages">
                  <p className="px-2 text-xs font-bold uppercase tracking-[0.06em] text-[#aeb4b8]">Page <span className="font-mono text-white">{page}</span> of {pageCount}</p>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => goToPage(page - 1)} disabled={page === 1} className="inline-flex size-10 items-center justify-center rounded-md border border-[#535b61] bg-[#171c20] text-white transition hover:border-[#ef3340] disabled:cursor-not-allowed disabled:opacity-35" aria-label="Previous product page"><ChevronLeft className="size-4" /></button>
                    <div className="hidden items-center gap-1.5 sm:flex">
                      {visiblePages.map((item) => typeof item === "number" ? (
                        <button
                          key={item}
                          type="button"
                          onClick={() => goToPage(item)}
                          className={`grid size-10 place-items-center rounded-md border text-xs font-black transition ${item === page ? "border-[#ef3340] bg-[#d92734] text-white" : "border-[#535b61] bg-[#171c20] text-[#c9cdd0] hover:border-[#ef3340] hover:text-white"}`}
                          aria-current={item === page ? "page" : undefined}
                          aria-label={`Product page ${item}`}
                        >
                          {item}
                        </button>
                      ) : <span key={item} className="px-1 text-[#697177]" aria-hidden="true">…</span>)}
                    </div>
                    <span className="min-w-16 text-center font-mono text-xs font-black text-white sm:hidden">{page} / {pageCount}</span>
                    <button type="button" onClick={() => goToPage(page + 1)} disabled={page === pageCount} className="inline-flex size-10 items-center justify-center rounded-md border border-[#535b61] bg-[#171c20] text-white transition hover:border-[#ef3340] disabled:cursor-not-allowed disabled:opacity-35" aria-label="Next product page"><ChevronRight className="size-4" /></button>
                  </div>
                </nav>
              )}
            </>
          ) : (
            <EmptySearchState key={query} onReset={reset} initialQuery={query} />
          )}
        </div>
      </div>

      <FilterDrawer open={drawerOpen} filters={filters} options={options} onChange={handleFilterChange} onReset={reset} onClose={() => setDrawerOpen(false)} resultCount={filteredProducts.length} />
    </div>
  );
}
