"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  submitHref?: string;
  compact?: boolean;
}

export function SearchBar({ value, defaultValue, onValueChange, placeholder = "Search products", submitHref, compact = false }: SearchBarProps) {
  const input = (
    <div className="relative flex-1">
      <Search aria-hidden="true" className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-[#687689]" />
      <input
        type="search"
        name="q"
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        onChange={(event) => onValueChange?.(event.target.value)}
        placeholder={placeholder}
        aria-label="Search the product catalogue"
        className="h-14 w-full rounded-full border border-[#dbe2ea] bg-white pl-13 pr-5 text-sm text-[#07172b] shadow-[0_5px_18px_rgba(7,23,43,0.04)] outline-none transition focus:border-[#e52833] focus:ring-4 focus:ring-[#e52833]/10"
      />
    </div>
  );

  if (!submitHref) return input;

  return (
    <form action={submitHref} className="flex w-full flex-col gap-2.5 sm:flex-row">
      {input}
      <button type="submit" className={compact ? "button-primary min-h-12 px-5" : "button-primary min-h-14 px-7"}>Search catalogue</button>
    </form>
  );
}
