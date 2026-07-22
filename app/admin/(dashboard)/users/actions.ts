"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ZodError } from "zod";
import { requireStaff } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { staffInviteFormData, staffUpdateFormData, type StaffInviteInput, type StaffUpdateInput } from "@/lib/validation/users";

function actionRedirect(message: string): never {
  redirect(`/admin/users?message=${encodeURIComponent(message)}`);
}

function readableError(error: unknown): string {
  if (error instanceof ZodError) return error.issues[0]?.message ?? "Check the staff account details.";
  if (error instanceof Error) return error.message;
  return "The staff account could not be updated.";
}

async function invitationRedirectUrl(): Promise<string> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? `${protocol}://${host}`;
  return `${origin}/auth/callback?next=/admin/reset-password`;
}

async function createInvitation(input: StaffInviteInput) {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(input.email, {
    redirectTo: await invitationRedirectUrl(),
    data: { full_name: input.fullName },
  });
  if (error || !data.user) {
    if (error?.message.toLowerCase().includes("already")) throw new Error("A staff account already exists for that email address.");
    throw new Error("The invitation email could not be sent. Check the Supabase email configuration.");
  }

  const { error: profileError } = await admin.from("profiles").update({
    full_name: input.fullName,
    role: input.role,
    active: true,
    can_publish_products: input.role === "product_manager" && input.canPublishProducts,
  }).eq("id", data.user.id);
  if (profileError) throw new Error("The account was invited, but its staff role could not be assigned.");
}

async function updateProfile(input: StaffUpdateInput, currentUserId: string) {
  if (input.userId === currentUserId && (!input.active || input.role !== "super_admin")) {
    throw new Error("You cannot deactivate your own account or remove your own super-administrator role.");
  }
  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({
    full_name: input.fullName,
    role: input.role,
    active: input.active,
    can_publish_products: input.role === "product_manager" && input.canPublishProducts,
  }).eq("id", input.userId);
  if (error) throw new Error("The staff account could not be updated.");
}

export async function inviteStaffUser(formData: FormData): Promise<void> {
  await requireStaff("users:manage");
  try {
    await createInvitation(staffInviteFormData(formData));
  } catch (error) {
    actionRedirect(readableError(error));
  }
  revalidatePath("/admin/users");
  actionRedirect("Staff invitation sent.");
}

export async function updateStaffUser(formData: FormData): Promise<void> {
  const profile = await requireStaff("users:manage");
  try {
    await updateProfile(staffUpdateFormData(formData), profile.id);
  } catch (error) {
    actionRedirect(readableError(error));
  }
  revalidatePath("/admin/users");
  actionRedirect("Staff account updated.");
}
