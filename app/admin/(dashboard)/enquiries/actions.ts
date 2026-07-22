"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/auth/session";
import { enquiryStatuses } from "@/lib/admin/enquiries";
import { createClient } from "@/lib/supabase/server";

const statusUpdate = z.object({
  enquiryId: z.string().uuid(),
  status: z.enum(enquiryStatuses),
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
