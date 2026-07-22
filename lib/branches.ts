import "server-only";

import { branches as mockBranches } from "@/data/branches";
import { isSupabaseConfigured } from "@/lib/supabase/env";
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

function whatsappUrl(number: string): string {
  return `https://wa.me/${number.replace(/\D/g, "")}`;
}

function mapBranch(record: BranchRecord): Branch {
  const location = [record.address, record.city, "Kenya"].filter(Boolean).join(", ");
  const hasCoordinates = record.latitude !== null && record.longitude !== null;
  const mapQuery = hasCoordinates ? `${record.latitude},${record.longitude}` : location;
  return {
    id: record.slug,
    name: record.name,
    location,
    phone: record.phone,
    email: record.email,
    openingHours: record.opening_hours,
    directionsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`,
    whatsappUrl: whatsappUrl(record.whatsapp || record.phone),
  };
}

export async function getBranches(): Promise<Branch[]> {
  if (!isSupabaseConfigured()) return mockBranches;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("branches")
    .select("id, name, slug, address, city, phone, whatsapp, email, opening_hours, latitude, longitude")
    .eq("active", true)
    .order("name");

  if (error) {
    console.error("[branches:list]", { code: error.code, message: error.message });
    return mockBranches;
  }
  return ((data ?? []) as BranchRecord[]).map(mapBranch);
}
