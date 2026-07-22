import type { StaffRole } from "@/types/admin";

export interface AdminStaffUser {
  id: string;
  email: string;
  fullName: string;
  role: StaffRole;
  active: boolean;
  canPublishProducts: boolean;
  emailConfirmed: boolean;
  lastSignInAt: string | null;
  createdAt: string;
  updatedAt: string;
}
