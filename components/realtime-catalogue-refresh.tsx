"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const publicCatalogueTables = [
  "products",
  "product_images",
  "specifications",
  "oem_references",
  "product_vehicle_applications",
  "product_equipment_applications",
  "branches",
  "downloads",
  "content_pages",
  "leadership_profiles",
] as const;

export function RealtimeCatalogueRefresh() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    const supabase = createClient();
    const channel = supabase.channel("public-catalogue-refresh");
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;

    const refresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => router.refresh(), 250);
    };

    publicCatalogueTables.forEach((table) => {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        refresh,
      );
    });

    channel.subscribe();

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      void supabase.removeChannel(channel);
    };
  }, [pathname, router]);

  return null;
}
