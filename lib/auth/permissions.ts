import type { AdminPermission, StaffProfile, StaffRole } from "@/types/admin";

const rolePermissions: Record<StaffRole, readonly AdminPermission[]> = {
  super_admin: [
    "dashboard:read",
    "products:read",
    "products:write",
    "products:publish",
    "enquiries:manage",
    "content:manage",
    "analytics:read",
    "users:manage",
    "audit:read",
  ],
  product_manager: [
    "dashboard:read",
    "products:read",
    "products:write",
    "analytics:read",
  ],
  sales: [
    "dashboard:read",
    "products:read",
    "enquiries:manage",
    "analytics:read",
  ],
  content_editor: [
    "dashboard:read",
    "products:read",
    "content:manage",
  ],
  viewer: ["dashboard:read", "products:read", "analytics:read"],
};

export function hasPermission(
  profile: StaffProfile,
  permission: AdminPermission,
): boolean {
  if (!profile.active) return false;
  if (permission === "products:publish" && profile.role === "product_manager") {
    return profile.canPublishProducts;
  }
  return rolePermissions[profile.role].includes(permission);
}

export function roleLabel(role: StaffRole): string {
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

