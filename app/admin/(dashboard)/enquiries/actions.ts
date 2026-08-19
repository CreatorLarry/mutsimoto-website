"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/auth/session";
import { enquiryStatuses } from "@/lib/admin/enquiries";
import { extractAttachmentPath, filterRequestAttachmentBucket } from "@/lib/enquiries/filter-request";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const statusUpdate = z.object({
  enquiryId: z.string().uuid(),
  status: z.enum(enquiryStatuses),
});

const enquiryDelete = z.object({
  enquiryId: z.string().uuid(),
});

export async function updateEnquiryStatus(formData: FormData): Promise<never> {
  const profile = await requireStaff("enquiries:manage");
  const parsed = statusUpdate.safeParse({
    enquiryId: formData.get("enquiryId"),
    status: formData.get("status"),
  });
  if (!parsed.success) redirect("/admin/enquiries?message=Invalid%20status%20update");

  const supabase = await createClient();
  const { error } = await supabase
    .from("enquiries")
    .update({
      status: parsed.data.status,
      assigned_to: ["completed", "closed"].includes(parsed.data.status) ? null : profile.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.enquiryId);

  if (error) {
    console.error("[admin:enquiry-status]", { code: error.code, message: error.message });
    redirect("/admin/enquiries?message=The%20enquiry%20could%20not%20be%20updated");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/enquiries");
  redirect("/admin/enquiries?message=Enquiry%20status%20updated");
}

export async function deleteEnquiry(formData: FormData): Promise<never> {
  const profile = await requireStaff("enquiries:manage");
  if (profile.role !== "super_admin") {
    redirect("/admin/enquiries?message=Only%20a%20super%20administrator%20can%20delete%20enquiries");
  }

  const parsed = enquiryDelete.safeParse({ enquiryId: formData.get("enquiryId") });
  if (!parsed.success) redirect("/admin/enquiries?message=No%20valid%20enquiry%20was%20selected");

  const supabase = await createClient();
  const { data: enquiry, error: findError } = await supabase
    .from("enquiries")
    .select("enquiry_number, customer_name, message")
    .eq("id", parsed.data.enquiryId)
    .maybeSingle();
  if (findError || !enquiry) redirect("/admin/enquiries?message=The%20selected%20enquiry%20could%20not%20be%20found");

  const { data: deleted, error } = await supabase
    .from("enquiries")
    .delete()
    .eq("id", parsed.data.enquiryId)
    .select("id")
    .maybeSingle();
  if (error || !deleted) {
    console.error("[admin:enquiry-delete]", { code: error?.code, message: error?.message });
    redirect("/admin/enquiries?message=The%20enquiry%20could%20not%20be%20deleted");
  }

  const admin = createAdminClient();
  const attachmentPath = extractAttachmentPath(String(enquiry.message));
  if (attachmentPath) {
    const { error: attachmentError } = await admin.storage.from(filterRequestAttachmentBucket).remove([attachmentPath]);
    if (attachmentError) console.error("[admin:enquiry-attachment-delete]", { message: attachmentError.message });
  }
  const { error: auditError } = await admin.from("audit_logs").insert({
    user_id: profile.id,
    action: "enquiries_delete",
    entity_type: "enquiries",
    entity_id: parsed.data.enquiryId,
    metadata: {
      operation: "DELETE",
      entity_label: enquiry.enquiry_number,
      customer_name: enquiry.customer_name,
      actor_name: profile.fullName,
      actor_email: profile.email,
    },
  });
  if (auditError) console.error("[admin:enquiry-delete-audit]", { code: auditError.code, message: auditError.message });

  revalidatePath("/admin");
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin/logs");
  redirect(`/admin/enquiries?message=${encodeURIComponent(`${enquiry.enquiry_number} was permanently deleted.`)}`);
}
