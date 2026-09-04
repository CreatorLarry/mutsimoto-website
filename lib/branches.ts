import "server-only";

import { branches as mockBranches } from "@/data/branches";
import { COMPANY_CONTACT } from "@/data/company-contact";
import { isSupabaseConfigured, shouldUseMockData } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Branch } from "@/types";

interface BranchRecord {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  phone: string;
  whatsapp: string | null;
  email: string;
  opening_hours: string;
  latitude: number | string | null;
  longitude: number | string | null;
}

function mapBranch(record: BranchRecord): Branch {
  const location = [record.address, record.city, "Kenya"].filter(Boolean).join(", ");
  const hasCoordinates = record.latitude !== null && record.longitude !== null;
  const mapQuery = hasCoordinates ? `${record.latitude},${record.longitude}` : location;
  return {
    id: record.slug,
    name: record.name,
    location,
    phone: record.slug === "nakuru" ? COMPANY_CONTACT.phone.label : record.phone,
    email: record.email.replace(/@mutsimoto\.co\.ke$/i, "@mutsimoto.com"),
    openingHours: record.opening_hours,
    directionsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`,
    whatsappUrl: COMPANY_CONTACT.whatsapp.href,
  };
}

export async function getBranches(): Promise<Branch[]> {
  if (!isSupabaseConfigured()) return shouldUseMockData() ? mockBranches : [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("branches")
    .select("id, name, slug, address, city, phone, whatsapp, email, opening_hours, latitude, longitude")
    .eq("active", true)
    .order("name");

  if (error) {
    console.error("[branches:list]", { code: error.code, message: error.message });
    return shouldUseMockData() ? mockBranches : [];
  }
  return ((data ?? []) as BranchRecord[]).map(mapBranch);
}
