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
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

