"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
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
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setMobileOpen(false);
      menuButtonRef.current?.focus();
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileOpen]);

  return (
    <header className="site-header sticky top-0 z-50 border-b border-[#353d43] bg-[#0d1114]/95 shadow-[0_10px_30px_rgba(0,0,0,0.24)] backdrop-blur-xl">
      <div className="h-1 bg-[#ef3340]" aria-hidden="true" />
      <div className="mx-auto flex h-[82px] max-w-[1480px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10 xl:px-6 2xl:px-8">
        <BrandMark />
        <nav className="site-header__nav hidden shrink-0 items-center gap-0.5 rounded-md border border-[#2e363c] bg-[#171d22] p-1 xl:flex" aria-label="Main navigation">
          {navigation.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("site-header__link whitespace-nowrap rounded px-2.5 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.035em] text-[#aeb4b8] transition-all hover:bg-[#232a30] hover:text-white 2xl:px-3.5 2xl:text-[11px] 2xl:tracking-[0.04em]", active && "site-header__link--active bg-[#2a3035] text-white shadow-[inset_0_-2px_0_#ef3340]")}>{item.label}</Link>
            );
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <Link href="/products" className="site-header__action grid size-11 place-items-center rounded-md border border-[#53565a] bg-[#171d22] text-white transition-all hover:border-[#ef3340] hover:bg-[#232a30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef3340]" aria-label="Search products"><Search className="size-4.5" aria-hidden="true" /></Link>
          <div className="hidden xl:block">
            <ThemeToggle />
          </div>
          <div className="hidden lg:flex">
            <ButtonLink href="/contact?type=product" className="shrink-0 whitespace-nowrap px-4 2xl:px-6">Request a quote</ButtonLink>
          </div>
          <button ref={menuButtonRef} type="button" onClick={() => setMobileOpen((open) => !open)} className="site-header__action grid size-11 place-items-center rounded-md border border-[#53565a] bg-[#171d22] text-white xl:hidden" aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen} aria-controls="mobile-navigation">{mobileOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}</button>
        </div>
      </div>
      {mobileOpen && (
        <div className="site-header__mobile border-t border-[#353d43] bg-[#0d1114] px-5 pb-6 shadow-[0_20px_35px_rgba(0,0,0,0.32)] xl:hidden">
          <nav id="mobile-navigation" className="mx-auto grid max-w-7xl gap-1 pt-4" aria-label="Mobile navigation">
            {navigation.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} onClick={() => setMobileOpen(false)} className={cn("site-header__mobile-link rounded px-4 py-3.5 text-sm font-bold text-[#b9bec2] hover:bg-[#1a2025] hover:text-white", active && "site-header__mobile-link--active border-l-2 border-[#ef3340] bg-[#1a2025] text-white")}>{item.label}</Link>;
            })}
            <div className="site-header__theme-row mt-3 flex items-center justify-between gap-5 rounded-md border border-[#353d43] bg-[#171d22] px-4 py-3">
              <div>
                <p className="site-header__theme-title text-xs font-extrabold uppercase tracking-[0.06em] text-white">Display mode</p>
                <p className="site-header__theme-copy mt-1 text-[11px] font-medium text-[#aeb4b8]">Switch between light and dark</p>
              </div>
              <ThemeToggle />
            </div>
            <ButtonLink href="/contact?type=product" className="mt-3 justify-center">Request a quote</ButtonLink>
          </nav>
        </div>
      )}
    </header>
  );
}
