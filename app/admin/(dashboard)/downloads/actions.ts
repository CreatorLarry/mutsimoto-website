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

interface UploadedDocument {
  storagePath: string;
  fileSize: number;
}

function actionRedirect(message: string): never {
  redirect(`/admin/downloads?message=${encodeURIComponent(message)}`);
}

function readableError(error: unknown): string {
  if (error instanceof ZodError) return error.issues[0]?.message ?? "Check the document details.";
  if (error instanceof Error) return error.message;
  return "The document could not be saved.";
}

function uploadedDocument(formData: FormData, required: boolean): UploadedDocument | null {
  const storagePath = formData.get("uploadedStoragePath");
  const fileSizeValue = formData.get("uploadedFileSize");
  const fileType = formData.get("uploadedFileType");

  if (typeof storagePath !== "string" || storagePath.length === 0) {
    if (required) throw new Error("Choose a PDF document to upload.");
    return null;
  }

  const fileSize = Number(fileSizeValue);
  const validStoragePath = /^documents\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}-[a-z0-9]+(?:-[a-z0-9]+)*\.pdf$/i.test(storagePath);
  if (!validStoragePath || fileType !== "application/pdf") throw new Error("The uploaded catalogue document is invalid.");
  if (!Number.isInteger(fileSize) || fileSize <= 0 || fileSize > maxPdfSize) throw new Error("PDF documents must be 25 MB or smaller.");

  return { storagePath, fileSize };
}

function revalidateDownloadViews() {
  revalidatePath("/admin");
  revalidatePath("/admin/downloads");
  revalidatePath("/downloads");
}

async function verifiedDocument(
  client: StaffSupabaseClient,
  uploaded: UploadedDocument | null,
): Promise<UploadedDocument | null> {
  if (!uploaded) return null;

  const { data, error } = await client.storage.from("catalogues").info(uploaded.storagePath);
  const actualSize = Number(data?.size);
  if (
    error
    || !data
    || data.contentType !== "application/pdf"
    || !Number.isInteger(actualSize)
    || actualSize <= 0
    || actualSize > maxPdfSize
  ) {
    await client.storage.from("catalogues").remove([uploaded.storagePath]);
    throw new Error("The uploaded PDF could not be verified. Please select the file and try again.");
  }

  return { storagePath: uploaded.storagePath, fileSize: actualSize };
}

async function saveDownload(
  client: StaffSupabaseClient,
  input: DownloadInput,
  uploaded: UploadedDocument | null,
) {
  const document = await verifiedDocument(client, uploaded);

  if (input.downloadId) {
    const { data: existing, error: existingError } = await client.from("downloads").select("storage_path, file_type, file_size").eq("id", input.downloadId).single();
    if (existingError || !existing) {
      if (document) await client.storage.from("catalogues").remove([document.storagePath]);
      throw new Error("That document no longer exists.");
    }
    const newStoragePath = document?.storagePath ?? null;
    const { error } = await client.from("downloads").update({
      title: input.title,
      description: input.description,
      category: input.category,
      storage_path: newStoragePath ?? existing.storage_path,
      file_type: document ? "application/pdf" : existing.file_type,
      file_size: document?.fileSize ?? existing.file_size,
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

  if (!document) throw new Error("Choose a PDF document to upload.");
  const storagePath = document.storagePath;
  const { error } = await client.from("downloads").insert({
    title: input.title,
    description: input.description,
    category: input.category,
    storage_path: storagePath,
    file_type: "application/pdf",
    file_size: document.fileSize,
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
    const document = uploadedDocument(formData, !input.downloadId);
    const supabase = await createClient();
    await saveDownload(supabase, input, document);
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
