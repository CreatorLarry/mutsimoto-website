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
  { label: "Products", href: "/products" },
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
    <header className="sticky top-0 z-50 border-b border-[#e8ded5] bg-[#fffdf9]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[82px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <BrandMark />
        <nav className="hidden items-center gap-1 rounded-full bg-[#edf4f2] p-1.5 xl:flex" aria-label="Main navigation">
          {navigation.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <a key={item.href} href={item.href} className={cn("rounded-full px-3.5 py-2.5 text-[12px] font-bold text-[#536174] transition-all hover:bg-[#fffdf9] hover:text-[#07172b]", active && "bg-[#fffdf9] text-[#d51f2a] shadow-[0_2px_10px_rgba(7,23,43,0.08)]")}>{item.label}</a>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/products" className="grid size-11 place-items-center rounded-full border border-[#e0e6ed] text-[#07172b] transition-all hover:border-[#b5c0cd] hover:bg-[#f4f6f9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e52833]" aria-label="Search products"><Search className="size-4.5" /></Link>
          <div className="hidden lg:flex">
            <ButtonLink href="/contact?type=product">Request a quote</ButtonLink>
          </div>
          <button type="button" onClick={() => setMobileOpen((open) => !open)} className="grid size-11 place-items-center rounded-full bg-[#07172b] text-white xl:hidden" aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen}>{mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button>
        </div>
      </div>
      {mobileOpen && (
        <div className="border-t border-[#e8ded5] bg-[#fffdf9] px-5 pb-6 shadow-[0_20px_35px_rgba(7,23,43,0.1)] xl:hidden">
          <nav className="mx-auto grid max-w-7xl gap-1 pt-4" aria-label="Mobile navigation">
            {navigation.map((item) => <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={cn("rounded-xl px-4 py-3.5 text-sm font-bold text-[#334257] hover:bg-[#f2f5f8]", pathname === item.href && "bg-[#f2f5f8] text-[#e52833]")}>{item.label}</a>)}
            <ButtonLink href="/contact?type=product" className="mt-3 justify-center">Request a quote</ButtonLink>
          </nav>
        </div>
      )}
    </header>
  );
}
