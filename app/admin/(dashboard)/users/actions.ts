"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { requireStaff } from "@/lib/auth/session";
import { getSiteOrigin } from "@/lib/site-origin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  staffDeleteSchema,
  staffInviteFormData,
  staffUpdateFormData,
  type StaffInviteInput,
  type StaffUpdateInput,
} from "@/lib/validation/users";

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

export async function deleteStaffUser(formData: FormData): Promise<void> {
  const currentProfile = await requireStaff("users:manage");
  const parsed = staffDeleteSchema.safeParse({ userId: formData.get("userId") });
  if (!parsed.success) actionRedirect("No valid staff account was selected.");
  if (parsed.data.userId === currentProfile.id) {
    actionRedirect("You cannot delete your own staff account.");
  }

  const admin = createAdminClient();
  const { data: target, error: targetError } = await admin
    .from("profiles")
    .select("id, full_name, role, active")
    .eq("id", parsed.data.userId)
    .maybeSingle();
  if (targetError || !target) actionRedirect("The selected staff account could not be found.");

  if (target.role === "super_admin" && target.active) {
    const { count, error } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "super_admin")
      .eq("active", true);
    if (error) actionRedirect("The super-administrator safeguards could not be checked.");
    if ((count ?? 0) <= 1) actionRedirect("The final active super-administrator account cannot be deleted.");
  }

  const { count: noteCount, error: noteError } = await admin
    .from("enquiry_notes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", parsed.data.userId);
  if (noteError) actionRedirect("The staff account history could not be checked.");
  if ((noteCount ?? 0) > 0) {
    actionRedirect("This account has enquiry notes that must be retained. Disable the account instead of deleting it.");
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(parsed.data.userId);
  if (deleteError) {
    console.error("[admin:staff-delete]", { code: deleteError.code, message: deleteError.message });
    actionRedirect("The staff account could not be permanently deleted. Disable it and review the Supabase Auth logs.");
  }

  const { error: auditError } = await admin.from("audit_logs").insert({
    user_id: currentProfile.id,
    action: "staff_user_deleted",
    entity_type: "profiles",
    entity_id: parsed.data.userId,
    metadata: {
      operation: "DELETE",
      entity_label: target.full_name,
      actor_name: currentProfile.fullName,
      actor_email: currentProfile.email,
      deleted_role: target.role,
    },
  });
  if (auditError) console.error("[admin:staff-delete-audit]", { code: auditError.code, message: auditError.message });

  revalidatePath("/admin/users");
  revalidatePath("/admin/logs");
  actionRedirect(`${target.full_name}'s staff account was permanently deleted.`);
}
