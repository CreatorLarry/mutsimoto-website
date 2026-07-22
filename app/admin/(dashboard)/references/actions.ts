"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { requireStaff } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  referenceDeleteSchema,
  referenceFormData,
  type ReferenceInput,
} from "@/lib/validation/catalogue-admin";

type StaffSupabaseClient = Awaited<ReturnType<typeof createClient>>;

function actionRedirect(message: string): never {
  redirect(`/admin/references?message=${encodeURIComponent(message)}`);
}

function readableError(error: unknown): string {
  if (error instanceof ZodError) return error.issues[0]?.message ?? "Check the reference details.";
  if (error instanceof Error) return error.message;
  return "The cross-reference could not be saved.";
}

async function productIdForReference(client: StaffSupabaseClient, referenceId: string): Promise<string | null> {
  const { data } = await client.from("oem_references").select("product_id").eq("id", referenceId).maybeSingle();
  return data ? String(data.product_id) : null;
}

async function touchAndRevalidateProduct(client: StaffSupabaseClient, productId: string, staffId: string) {
  const { data, error } = await client
    .from("products")
    .update({ updated_by: staffId })
    .eq("id", productId)
    .select("slug")
    .single();
  if (error || !data) throw new Error("The related product could not be updated.");
  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath(`/products/${data.slug}`);
}

function revalidateReferenceViews() {
  revalidatePath("/admin");
  revalidatePath("/admin/references");
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

async function saveReference(client: StaffSupabaseClient, input: ReferenceInput): Promise<string | null> {
  const payload = {
    product_id: input.productId,
    reference_type: input.referenceType,
    manufacturer: input.manufacturer,
    reference_number: input.referenceNumber,
  };
  if (input.referenceId) {
    const previousProductId = await productIdForReference(client, input.referenceId);
    const { error } = await client.from("oem_references").update(payload).eq("id", input.referenceId);
    if (error) {
      if (error.code === "23505") throw new Error("That reference number already exists for this product and type.");
      throw new Error("The cross-reference could not be updated.");
    }
    return previousProductId;
  }

  const { error } = await client.from("oem_references").insert(payload);
  if (error) {
    if (error.code === "23505") throw new Error("That reference number already exists for this product and type.");
    throw new Error("The cross-reference could not be created.");
  }
  return null;
}

export async function createOrUpdateReference(formData: FormData): Promise<void> {
  const profile = await requireStaff("products:write");
  let input: ReferenceInput;
  try {
    input = referenceFormData(formData);
  } catch (error) {
    actionRedirect(readableError(error));
  }

  const client = await createClient();
  try {
    const previousProductId = await saveReference(client, input);
    await touchAndRevalidateProduct(client, input.productId, profile.id);
    if (previousProductId && previousProductId !== input.productId) {
      await touchAndRevalidateProduct(client, previousProductId, profile.id);
    }
  } catch (error) {
    actionRedirect(readableError(error));
  }

  revalidateReferenceViews();
  actionRedirect(input.referenceId ? "Cross-reference updated." : "Cross-reference added.");
}

export async function deleteReference(formData: FormData): Promise<void> {
  const profile = await requireStaff("products:write");
  let referenceId: string;
  try {
    referenceId = referenceDeleteSchema.parse({ referenceId: formData.get("referenceId") }).referenceId;
  } catch (error) {
    actionRedirect(readableError(error));
  }

  const client = await createClient();
  const productId = await productIdForReference(client, referenceId);
  if (!productId) actionRedirect("That cross-reference no longer exists.");
  const { error } = await client.from("oem_references").delete().eq("id", referenceId);
  if (error) actionRedirect("The cross-reference could not be removed.");

  try {
    await touchAndRevalidateProduct(client, productId, profile.id);
  } catch (touchError) {
    actionRedirect(readableError(touchError));
  }
  revalidateReferenceViews();
  actionRedirect("Cross-reference removed.");
}
