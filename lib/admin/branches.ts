import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { AdminBranch } from "@/types/content-admin";

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
  active: boolean;
  updated_at: string;
}

export async function getAdminBranches(options: { query?: string; status?: string } = {}): Promise<AdminBranch[]> {
  const supabase = await createClient();
  let request = supabase
    .from("branches")
    .select("id, name, slug, address, city, phone, whatsapp, email, opening_hours, latitude, longitude, active, updated_at")
    .order("name");

  if (options.status === "active") request = request.eq("active", true);
  if (options.status === "inactive") request = request.eq("active", false);
  const { data, error } = await request;
  if (error) throw new Error("Unable to load branch records.");

  const query = options.query?.trim().toLowerCase();
  return ((data ?? []) as BranchRecord[])
    .map((branch) => ({
      id: branch.id,
      name: branch.name,
      slug: branch.slug,
      address: branch.address,
      city: branch.city,
      phone: branch.phone,
      whatsapp: branch.whatsapp ?? "",
      email: branch.email,
      openingHours: branch.opening_hours,
      latitude: branch.latitude === null ? null : Number(branch.latitude),
      longitude: branch.longitude === null ? null : Number(branch.longitude),
      active: branch.active,
      updatedAt: branch.updated_at,
    }))
    .filter((branch) => !query || `${branch.name} ${branch.slug} ${branch.address} ${branch.city} ${branch.phone} ${branch.email}`.toLowerCase().includes(query));
}
