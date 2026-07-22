import { z } from "zod";
import { staffRoles } from "@/types/admin";

export const staffInviteSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid staff email address.").max(240),
  fullName: z.string().trim().min(2, "Enter the staff member's name.").max(160),
  role: z.enum(staffRoles),
  canPublishProducts: z.boolean(),
});

export const staffUpdateSchema = z.object({
  userId: z.string().uuid(),
  fullName: z.string().trim().min(2, "Enter the staff member's name.").max(160),
  role: z.enum(staffRoles),
  active: z.boolean(),
  canPublishProducts: z.boolean(),
});

export type StaffInviteInput = z.infer<typeof staffInviteSchema>;
export type StaffUpdateInput = z.infer<typeof staffUpdateSchema>;

export function staffInviteFormData(formData: FormData): StaffInviteInput {
  return staffInviteSchema.parse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    role: formData.get("role"),
    canPublishProducts: formData.get("canPublishProducts") === "on",
  });
}

export function staffUpdateFormData(formData: FormData): StaffUpdateInput {
  return staffUpdateSchema.parse({
    userId: formData.get("userId"),
    fullName: formData.get("fullName"),
    role: formData.get("role"),
    active: formData.get("active") === "on",
    canPublishProducts: formData.get("canPublishProducts") === "on",
  });
}
