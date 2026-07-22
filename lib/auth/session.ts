import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { AdminPermission, StaffProfile, StaffRole } from "@/types/admin";
import { staffRoles } from "@/types/admin";

interface ProfileRecord {
  id: string;
  full_name: string;
  role: string;
  active: boolean;
  can_publish_products: boolean;
}

function isStaffRole(value: string): value is StaffRole {
  return staffRoles.some((role) => role === value);
}

export const getCurrentStaff = cache(async (): Promise<StaffProfile | null> => {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, active, can_publish_products")
    .eq("id", authData.user.id)
    .single();

  if (error || !data) return null;
  const profile = data as ProfileRecord;
  if (!profile.active || !isStaffRole(profile.role)) return null;

  return {
    id: profile.id,
    email: authData.user.email ?? "",
    fullName: profile.full_name || authData.user.email?.split("@")[0] || "Staff user",
    role: profile.role,
    active: profile.active,
    canPublishProducts: profile.can_publish_products,
  };
});

export async function requireStaff(
  permission: AdminPermission = "dashboard:read",
): Promise<StaffProfile> {
  const profile = await getCurrentStaff();
  if (!profile) redirect("/admin/login");
  if (!hasPermission(profile, permission)) redirect("/admin?error=permission");
  return profile;
}

