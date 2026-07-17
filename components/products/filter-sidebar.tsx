"use client";

import { RotateCcw } from "lucide-react";
import type { ApplicationType, FilterCategory } from "@/types";

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

const selectClass = "mt-2 h-12 w-full rounded-xl border border-[#dbe2ea] bg-white px-3.5 text-sm text-[#07172b] outline-none transition focus:border-[#e52833] focus:ring-4 focus:ring-[#e52833]/10";

export function FilterSidebar({ filters, options, onChange, onReset, className }: FilterSidebarProps) {
  function update<Key extends keyof CatalogueFilters>(key: Key, value: CatalogueFilters[Key]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <aside className={className} aria-label="Product filters">
      <div className="flex items-center justify-between border-b border-[#e2e7ed] pb-4"><h2 className="text-lg font-extrabold text-[#07172b]">Filter products</h2><button type="button" onClick={onReset} className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold text-[#526176] hover:bg-[#f1f4f7] hover:text-[#d51f2a]"><RotateCcw className="size-3.5" /> Reset</button></div>
      <div className="space-y-5 pt-5">
        <label className="block text-[11px] font-extrabold text-[#435166]">Product category
          <select className={selectClass} value={filters.category} onChange={(event) => update("category", event.target.value as CatalogueFilters["category"])}><option value="">All categories</option><option>Oil Filters</option><option>Fuel Filters</option><option>Air Filters</option></select>
        </label>
        <label className="block text-[11px] font-extrabold text-[#435166]">Application
          <select className={selectClass} value={filters.application} onChange={(event) => update("application", event.target.value as CatalogueFilters["application"])}><option value="">All applications</option><option>Automotive</option><option>Industrial</option></select>
        </label>
        <label className="block text-[11px] font-extrabold text-[#435166]">Vehicle brand
          <select className={selectClass} value={filters.brand} onChange={(event) => update("brand", event.target.value)}><option value="">All brands</option>{options.brands.map((brand) => <option key={brand}>{brand}</option>)}</select>
        </label>
        <label className="block text-[11px] font-extrabold text-[#435166]">Engine model
          <select className={selectClass} value={filters.engine} onChange={(event) => update("engine", event.target.value)}><option value="">All engines</option>{options.engines.map((engine) => <option key={engine}>{engine}</option>)}</select>
        </label>
        <label className="block text-[11px] font-extrabold text-[#435166]">Equipment type
          <select className={selectClass} value={filters.equipment} onChange={(event) => update("equipment", event.target.value)}><option value="">All equipment</option>{options.equipment.map((equipment) => <option key={equipment}>{equipment}</option>)}</select>
        </label>
      </div>
    </aside>
  );
}
