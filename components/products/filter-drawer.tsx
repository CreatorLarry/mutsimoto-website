"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )).filter((element) => !element.hidden);
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedRef.current?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] lg:hidden">
      <button type="button" tabIndex={-1} className="absolute inset-0 bg-black/80" onClick={onClose} aria-label="Close filter drawer" />
      <div ref={dialogRef} id="product-filter-dialog" role="dialog" aria-modal="true" aria-labelledby="product-filter-title" tabIndex={-1} className="absolute inset-y-0 right-0 flex w-[min(92vw,410px)] flex-col border-l border-[#535b61] bg-[#11161a] text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#353d43] px-5 py-4"><h2 id="product-filter-title" className="font-mono text-xs font-extrabold uppercase tracking-[0.12em] text-[#ef3340]">Refine catalogue</h2><button ref={closeButtonRef} type="button" onClick={onClose} className="grid size-10 place-items-center rounded-md border border-[#535b61] bg-[#232a30] text-white" aria-label="Close filters"><X className="size-5" aria-hidden="true" /></button></div>
        <div className="flex-1 overflow-y-auto p-5"><FilterSidebar filters={filters} options={options} onChange={onChange} onReset={onReset} /></div>
        <div className="border-t border-[#353d43] p-5"><button type="button" onClick={onClose} className="button-primary w-full">Show {resultCount} products</button></div>
      </div>
    </div>
  );
}
