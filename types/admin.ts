export const staffRoles = [
  "super_admin",
  "product_manager",
  "sales",
  "content_editor",
  "viewer",
] as const;

export type StaffRole = (typeof staffRoles)[number];

export interface StaffProfile {
  id: string;
  email: string;
  fullName: string;
  role: StaffRole;
  active: boolean;
  canPublishProducts: boolean;
}

export type AdminPermission =
  | "dashboard:read"
  | "products:read"
  | "products:write"
  | "products:publish"
  | "enquiries:manage"
  | "content:manage"
  | "analytics:read"
  | "users:manage"
  | "audit:read";

