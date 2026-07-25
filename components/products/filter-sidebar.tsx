"use client";

import { RotateCcw } from "lucide-react";
import type { ApplicationType, FilterCategory } from "@/types";
import { productCategoryOptions } from "@/types/categories";

export interface CatalogueFilters {
  category: FilterCategory | "";
  application: ApplicationType | "";
  brand: string;
  engine: string;
  equipment: string;
}

export interface FilterOptions {
  brands: string[];
  engines: string[];
  equipment: string[];
}

interface FilterSidebarProps {
  filters: CatalogueFilters;
  options: FilterOptions;
  onChange: (filters: CatalogueFilters) => void;
  onReset: () => void;
  className?: string;
}

const selectClass = "mt-2 h-12 w-full rounded-md border border-[#535b61] bg-[#11161a] px-3.5 text-sm text-white outline-none transition [color-scheme:dark] focus:border-[#ef3340] focus:ring-4 focus:ring-[#ef3340]/10";

export function FilterSidebar({ filters, options, onChange, onReset, className }: FilterSidebarProps) {
  function update<Key extends keyof CatalogueFilters>(key: Key, value: CatalogueFilters[Key]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <aside className={className} aria-label="Product filters">
      <div className="flex items-center justify-between border-b border-[#353d43] pb-4"><h2 className="text-lg font-extrabold uppercase text-white">Filter products</h2><button type="button" onClick={onReset} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-[#aeb4b8] hover:bg-[#232a30] hover:text-[#ef3340]"><RotateCcw className="size-3.5" /> Reset</button></div>
      <div className="space-y-5 pt-5">
        <label className="block text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#c9cdd0]">Product category
          <select className={selectClass} value={filters.category} onChange={(event) => update("category", event.target.value as CatalogueFilters["category"])}><option value="">All categories</option>{productCategoryOptions.map((option) => <option key={option.value} value={option.label}>{option.label}</option>)}</select>
        </label>
        <label className="block text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#c9cdd0]">Application
          <select className={selectClass} value={filters.application} onChange={(event) => update("application", event.target.value as CatalogueFilters["application"])}><option value="">All applications</option><option>Automotive</option><option>Industrial</option></select>
        </label>
        <label className="block text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#c9cdd0]">Vehicle brand
          <select className={selectClass} value={filters.brand} onChange={(event) => update("brand", event.target.value)}><option value="">All brands</option>{options.brands.map((brand) => <option key={brand}>{brand}</option>)}</select>
        </label>
        <label className="block text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#c9cdd0]">Engine model
          <select className={selectClass} value={filters.engine} onChange={(event) => update("engine", event.target.value)}><option value="">All engines</option>{options.engines.map((engine) => <option key={engine}>{engine}</option>)}</select>
        </label>
        <label className="block text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#c9cdd0]">Equipment type
          <select className={selectClass} value={filters.equipment} onChange={(event) => update("equipment", event.target.value)}><option value="">All equipment</option>{options.equipment.map((equipment) => <option key={equipment}>{equipment}</option>)}</select>
        </label>
      </div>
    </aside>
  );
}
