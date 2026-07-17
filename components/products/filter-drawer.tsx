"use client";

import { X } from "lucide-react";
import { FilterSidebar, type CatalogueFilters, type FilterOptions } from "@/components/products/filter-sidebar";

interface FilterDrawerProps {
  open: boolean;
  filters: CatalogueFilters;
  options: FilterOptions;
  onChange: (filters: CatalogueFilters) => void;
  onReset: () => void;
  onClose: () => void;
  resultCount: number;
}

export function FilterDrawer({ open, filters, options, onChange, onReset, onClose, resultCount }: FilterDrawerProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Product filters">
      <button type="button" className="absolute inset-0 bg-[#071426]/70" onClick={onClose} aria-label="Close filter drawer" />
      <div className="absolute inset-y-0 right-0 flex w-[min(92vw,410px)] flex-col rounded-l-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e1e7ed] px-5 py-4"><span className="text-xs font-extrabold text-[#d51f2a]">Refine catalogue</span><button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-full bg-[#f1f4f7]" aria-label="Close filters"><X className="size-5" /></button></div>
        <div className="flex-1 overflow-y-auto p-5"><FilterSidebar filters={filters} options={options} onChange={onChange} onReset={onReset} /></div>
        <div className="border-t border-[#d8dde3] p-5"><button type="button" onClick={onClose} className="button-primary w-full">Show {resultCount} products</button></div>
      </div>
    </div>
  );
}
