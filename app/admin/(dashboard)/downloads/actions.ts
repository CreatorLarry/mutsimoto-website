"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { requireStaff } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  downloadDeleteSchema,
  downloadFormData,
  downloadStatusSchema,
  type DownloadInput,
} from "@/lib/validation/content";

type StaffSupabaseClient = Awaited<ReturnType<typeof createClient>>;
const maxPdfSize = 25 * 1024 * 1024;

function actionRedirect(message: string): never {
  redirect(`/admin/downloads?message=${encodeURIComponent(message)}`);
}

function readableError(error: unknown): string {
  if (error instanceof ZodError) return error.issues[0]?.message ?? "Check the document details.";
  if (error instanceof Error) return error.message;
  return "The document could not be saved.";
}

function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function documentFile(formData: FormData, required: boolean): File | null {
  const value = formData.get("document");
  if (!(value instanceof File) || value.size === 0) {
    if (required) throw new Error("Choose a PDF document to upload.");
    return null;
  }
  if (value.type !== "application/pdf" || !value.name.toLowerCase().endsWith(".pdf")) throw new Error("Catalogue documents must be PDF files.");
  if (value.size > maxPdfSize) throw new Error("PDF documents must be 25 MB or smaller.");
  return value;
}

function revalidateDownloadViews() {
  revalidatePath("/admin");
  revalidatePath("/admin/downloads");
  revalidatePath("/downloads");
}

async function uploadPdf(client: StaffSupabaseClient, title: string, file: File): Promise<string> {
  const storagePath = `documents/${crypto.randomUUID()}-${slugify(title).slice(0, 80) || "catalogue"}.pdf`;
  const { error } = await client.storage.from("catalogues").upload(storagePath, file, {
    cacheControl: "3600",
    contentType: "application/pdf",
    upsert: false,
  });
  if (error) throw new Error("The PDF could not be uploaded to document storage.");
  return storagePath;
}

async function saveDownload(
  client: StaffSupabaseClient,
  input: DownloadInput,
  file: File | null,
) {
  if (input.downloadId) {
    const { data: existing, error: existingError } = await client.from("downloads").select("storage_path, file_type, file_size").eq("id", input.downloadId).single();
    if (existingError || !existing) throw new Error("That document no longer exists.");
    const newStoragePath = file ? await uploadPdf(client, input.title, file) : null;
    const { error } = await client.from("downloads").update({
      title: input.title,
      description: input.description,
      category: input.category,
      storage_path: newStoragePath ?? existing.storage_path,
      file_type: file ? "application/pdf" : existing.file_type,
      file_size: file ? file.size : existing.file_size,
      published: input.published,
      updated_at: new Date().toISOString(),
    }).eq("id", input.downloadId);
    if (error) {
      if (newStoragePath) await client.storage.from("catalogues").remove([newStoragePath]);
      throw new Error("The document details could not be updated.");
    }
    if (newStoragePath && existing.storage_path !== newStoragePath) {
      const { error: removalError } = await client.storage.from("catalogues").remove([String(existing.storage_path)]);
      if (removalError) console.error("[admin:download-old-file-remove]", { message: removalError.message });
    }
    return;
  }

  if (!file) throw new Error("Choose a PDF document to upload.");
  const storagePath = await uploadPdf(client, input.title, file);
  const { error } = await client.from("downloads").insert({
    title: input.title,
    description: input.description,
    category: input.category,
    storage_path: storagePath,
    file_type: "application/pdf",
    file_size: file.size,
    published: input.published,
  });
  if (error) {
    await client.storage.from("catalogues").remove([storagePath]);
    throw new Error("The document record could not be created.");
  }
}

export async function createOrUpdateDownload(formData: FormData): Promise<void> {
  await requireStaff("content:manage");
  let input: DownloadInput;
  try {
    input = downloadFormData(formData);
    const file = documentFile(formData, !input.downloadId);
    const supabase = await createClient();
    await saveDownload(supabase, input, file);
  } catch (error) {
    actionRedirect(readableError(error));
  }
  revalidateDownloadViews();
  actionRedirect(input.downloadId ? "Document updated." : "Document uploaded.");
}

export async function setDownloadPublished(formData: FormData): Promise<void> {
  await requireStaff("content:manage");
  const parsed = downloadStatusSchema.safeParse({ downloadId: formData.get("downloadId"), published: formData.get("published") });
  if (!parsed.success) actionRedirect("The publication request was invalid.");
  const supabase = await createClient();
  const { error } = await supabase.from("downloads").update({ published: parsed.data.published, updated_at: new Date().toISOString() }).eq("id", parsed.data.downloadId);
  if (error) actionRedirect("The document publication status could not be updated.");
  revalidateDownloadViews();
  actionRedirect(parsed.data.published ? "Document published." : "Document removed from the public library.");
}

export async function deleteDownload(formData: FormData): Promise<void> {
  const profile = await requireStaff("content:manage");
  if (profile.role !== "super_admin") actionRedirect("Only a super administrator can permanently delete a document.");
  const parsed = downloadDeleteSchema.safeParse({ downloadId: formData.get("downloadId") });
  if (!parsed.success) actionRedirect("The document removal request was invalid.");
  const supabase = await createClient();
  const { data, error: findError } = await supabase.from("downloads").select("storage_path").eq("id", parsed.data.downloadId).single();
  if (findError || !data) actionRedirect("That document no longer exists.");
  const { error } = await supabase.from("downloads").delete().eq("id", parsed.data.downloadId);
  if (error) actionRedirect("The document could not be deleted.");
  const { error: storageError } = await supabase.storage.from("catalogues").remove([String(data.storage_path)]);
  if (storageError) console.error("[admin:download-file-remove]", { message: storageError.message });
  revalidateDownloadViews();
  actionRedirect("Document permanently deleted.");
}
