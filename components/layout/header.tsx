"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { BrandMark } from "@/components/ui/brand-mark";
import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/cn";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Product Catalogue", href: "/products" },
  { label: "Applications", href: "/applications" },
  { label: "Downloads", href: "/downloads" },
  { label: "About Us", href: "/about" },
  { label: "Branches", href: "/branches" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#353d43] bg-[#0d1114]/95 shadow-[0_10px_30px_rgba(0,0,0,0.24)] backdrop-blur-xl">
      <div className="h-1 bg-[#ef3340]" aria-hidden="true" />
      <div className="mx-auto flex h-[82px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <BrandMark />
        <nav className="hidden items-center gap-1 rounded-md border border-[#2e363c] bg-[#171d22] p-1 xl:flex" aria-label="Main navigation">
          {navigation.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <a key={item.href} href={item.href} className={cn("rounded px-3.5 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.04em] text-[#aeb4b8] transition-all hover:bg-[#232a30] hover:text-white", active && "bg-[#2a3035] text-white shadow-[inset_0_-2px_0_#ef3340]")}>{item.label}</a>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/products" className="grid size-11 place-items-center rounded-md border border-[#53565a] bg-[#171d22] text-white transition-all hover:border-[#ef3340] hover:bg-[#232a30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef3340]" aria-label="Search products"><Search className="size-4.5" /></Link>
          <div className="hidden lg:flex">
            <ButtonLink href="/contact?type=product">Request a quote</ButtonLink>
          </div>
          <button type="button" onClick={() => setMobileOpen((open) => !open)} className="grid size-11 place-items-center rounded-md border border-[#53565a] bg-[#171d22] text-white xl:hidden" aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen}>{mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button>
        </div>
      </div>
      {mobileOpen && (
        <div className="border-t border-[#353d43] bg-[#0d1114] px-5 pb-6 shadow-[0_20px_35px_rgba(0,0,0,0.32)] xl:hidden">
          <nav className="mx-auto grid max-w-7xl gap-1 pt-4" aria-label="Mobile navigation">
            {navigation.map((item) => <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={cn("rounded px-4 py-3.5 text-sm font-bold text-[#b9bec2] hover:bg-[#1a2025] hover:text-white", pathname === item.href && "border-l-2 border-[#ef3340] bg-[#1a2025] text-white")}>{item.label}</a>)}
            <ButtonLink href="/contact?type=product" className="mt-3 justify-center">Request a quote</ButtonLink>
          </nav>
        </div>
      )}
    </header>
  );
}
