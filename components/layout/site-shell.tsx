"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdministration = pathname.startsWith("/admin") || pathname.startsWith("/auth");

  if (isAdministration) return children;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only z-[100] rounded-md bg-white px-4 py-3 font-bold text-[#11161a] shadow-xl focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" tabIndex={-1}>{children}</main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
