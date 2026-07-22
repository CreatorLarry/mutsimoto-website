"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { requireStaff } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  branchDeleteSchema,
  branchFormData,
  branchStatusSchema,
  type BranchInput,
} from "@/lib/validation/content";

function actionRedirect(message: string): never {
  redirect(`/admin/branches?message=${encodeURIComponent(message)}`);
}

function readableError(error: unknown): string {
  if (error instanceof ZodError) return error.issues[0]?.message ?? "Check the branch details.";
  if (error instanceof Error) return error.message;
  return "The branch could not be saved.";
}

function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function revalidateBranchViews() {
  revalidatePath("/admin");
  revalidatePath("/admin/branches");
  revalidatePath("/branches");
  revalidatePath("/contact");
}

async function saveBranch(input: BranchInput) {
  const supabase = await createClient();
  const payload = {
    name: input.name,
    slug: input.slug || slugify(input.name),
    address: input.address,
    city: input.city,
    phone: input.phone,
    whatsapp: input.whatsapp || null,
    email: input.email,
    opening_hours: input.openingHours,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    active: input.active,
    updated_at: new Date().toISOString(),
  };

  if (input.branchId) {
    const { error } = await supabase.from("branches").update(payload).eq("id", input.branchId);
    if (error) {
      if (error.code === "23505") throw new Error("That branch name or URL slug is already in use.");
      throw new Error("The branch could not be updated.");
    }
    return;
  }

  const { error } = await supabase.from("branches").insert(payload);
  if (error) {
    if (error.code === "23505") throw new Error("That branch name or URL slug is already in use.");
    throw new Error("The branch could not be created.");
  }
}

export async function createOrUpdateBranch(formData: FormData): Promise<void> {
  await requireStaff("content:manage");
  let input: BranchInput;
  try {
    input = branchFormData(formData);
    await saveBranch(input);
  } catch (error) {
    actionRedirect(readableError(error));
  }
  revalidateBranchViews();
  actionRedirect(input.branchId ? "Branch updated." : "Branch added.");
}

export async function setBranchActive(formData: FormData): Promise<void> {
  await requireStaff("content:manage");
  const parsed = branchStatusSchema.safeParse({ branchId: formData.get("branchId"), active: formData.get("active") });
  if (!parsed.success) actionRedirect("The branch status request was invalid.");
  const supabase = await createClient();
  const { error } = await supabase.from("branches").update({ active: parsed.data.active, updated_at: new Date().toISOString() }).eq("id", parsed.data.branchId);
  if (error) actionRedirect("The branch status could not be updated.");
  revalidateBranchViews();
  actionRedirect(parsed.data.active ? "Branch activated." : "Branch hidden from the public website.");
}

export async function deleteBranch(formData: FormData): Promise<void> {
  const profile = await requireStaff("content:manage");
  if (profile.role !== "super_admin") actionRedirect("Only a super administrator can permanently delete a branch.");
  const parsed = branchDeleteSchema.safeParse({ branchId: formData.get("branchId") });
  if (!parsed.success) actionRedirect("The branch removal request was invalid.");
  const supabase = await createClient();
  const { error } = await supabase.from("branches").delete().eq("id", parsed.data.branchId);
  if (error) actionRedirect(error.code === "23503" ? "This branch is linked to enquiries and cannot be deleted. Deactivate it instead." : "The branch could not be deleted.");
  revalidateBranchViews();
  actionRedirect("Branch permanently deleted.");
}
