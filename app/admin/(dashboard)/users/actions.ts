"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { requireStaff } from "@/lib/auth/session";
import { getSiteOrigin } from "@/lib/site-origin";
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
  return `${await getSiteOrigin()}/auth/callback?next=/admin/reset-password`;
}

interface InvitationAuthError {
  code?: string;
  message: string;
  status?: number;
}

function invitationErrorMessage(error: InvitationAuthError | null): string {
  if (!error) return "Supabase did not create the staff account. Please try again.";

  const message = error.message.toLowerCase();

  if (error.code === "email_address_not_authorized" || message.includes("not authorized")) {
    return "Supabase's default mailer can only invite members of the Supabase project team. Configure Custom SMTP in Supabase Authentication settings to invite external staff.";
  }

  if (error.code === "over_email_send_rate_limit" || error.status === 429 || message.includes("rate limit")) {
    return "Supabase's email sending limit has been reached. Wait before retrying, or configure Custom SMTP for reliable staff invitations.";
  }

  if (
    error.code === "email_exists"
    || error.code === "user_already_exists"
    || message.includes("already")
    || message.includes("registered")
  ) {
    return "A staff account already exists for that email address. Update the existing account or send a password reset instead.";
  }

  if (error.code === "email_address_invalid" || message.includes("invalid email")) {
    return "Enter a valid email address and try again.";
  }

  if (message.includes("smtp") || message.includes("send email") || message.includes("sending invite")) {
    return "Supabase could not send the invitation through the configured SMTP service. Check the SMTP host, port, username, password, and sender address.";
  }

  return `The invitation could not be sent (Supabase error: ${error.code ?? "unknown"}). Check the Supabase Auth logs for details.`;
}

async function createInvitation(input: StaffInviteInput) {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(input.email, {
    redirectTo: await invitationRedirectUrl(),
    data: { full_name: input.fullName },
  });
  if (error || !data.user) {
    if (error) {
      console.error("Supabase staff invitation failed", {
        code: error.code,
        message: error.message,
        status: error.status,
      });
    }
    throw new Error(invitationErrorMessage(error));
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
