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
      <Search aria-hidden="true" className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-[#aeb4b8]" />
      <input
        type="search"
        name="q"
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        onChange={(event) => onValueChange?.(event.target.value)}
        placeholder={placeholder}
        aria-label="Search the product catalogue"
        className="h-14 w-full rounded-md border border-[#3b444a] bg-[#11161a] pl-13 pr-5 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] outline-none transition placeholder:text-[#777f84] focus:border-[#ef3340] focus:ring-4 focus:ring-[#ef3340]/10"
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
