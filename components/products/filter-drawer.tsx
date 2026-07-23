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
      <button type="button" className="absolute inset-0 bg-black/80" onClick={onClose} aria-label="Close filter drawer" />
      <div className="absolute inset-y-0 right-0 flex w-[min(92vw,410px)] flex-col border-l border-[#535b61] bg-[#11161a] text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#353d43] px-5 py-4"><span className="font-mono text-xs font-extrabold uppercase tracking-[0.12em] text-[#ef3340]">Refine catalogue</span><button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-md border border-[#535b61] bg-[#232a30] text-white" aria-label="Close filters"><X className="size-5" /></button></div>
        <div className="flex-1 overflow-y-auto p-5"><FilterSidebar filters={filters} options={options} onChange={onChange} onReset={onReset} /></div>
        <div className="border-t border-[#353d43] p-5"><button type="button" onClick={onClose} className="button-primary w-full">Show {resultCount} products</button></div>
      </div>
    </div>
  );
}
