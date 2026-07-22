import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { StaffRole } from "@/types/admin";
import type { AdminStaffUser } from "@/types/user-admin";

interface ProfileRecord {
  id: string;
  full_name: string;
  role: StaffRole;
  active: boolean;
  can_publish_products: boolean;
  created_at: string;
  updated_at: string;
}

export async function getAdminStaffUsers(options: { query?: string; role?: string; status?: string } = {}): Promise<AdminStaffUser[]> {
  const admin = createAdminClient();
  const [profilesResult, authResult] = await Promise.all([
    admin.from("profiles").select("id, full_name, role, active, can_publish_products, created_at, updated_at").order("created_at"),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);
  if (profilesResult.error || authResult.error) throw new Error("Unable to load staff accounts.");

  const authById = new Map(authResult.data.users.map((user) => [user.id, user]));
  const query = options.query?.trim().toLowerCase();
  return ((profilesResult.data ?? []) as ProfileRecord[])
    .map((profile) => {
      const authUser = authById.get(profile.id);
      return {
        id: profile.id,
        email: authUser?.email ?? "Email unavailable",
        fullName: profile.full_name,
        role: profile.role,
        active: profile.active,
        canPublishProducts: profile.can_publish_products,
        emailConfirmed: Boolean(authUser?.email_confirmed_at),
        lastSignInAt: authUser?.last_sign_in_at ?? null,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      };
    })
    .filter((user) => !options.role || user.role === options.role)
    .filter((user) => !options.status || (options.status === "active" ? user.active : options.status === "inactive" ? !user.active : true))
    .filter((user) => !query || `${user.fullName} ${user.email} ${user.role}`.toLowerCase().includes(query))
    .sort((left, right) => left.fullName.localeCompare(right.fullName));
}
