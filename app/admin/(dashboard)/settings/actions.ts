"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { requireStaff } from "@/lib/auth/session";
import {
  leadershipImageBucket,
  leadershipImageMaxSize,
  leadershipImagePath,
  leadershipImageTypes,
} from "@/lib/leadership-images";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  aboutContentFormData,
  leadershipDeleteSchema,
  leadershipFormData,
  leadershipStatusSchema,
  type AboutContentInput,
  type LeadershipInput,
} from "@/lib/validation/company-content";

function actionRedirect(message: string): never {
  redirect(`/admin/settings?message=${encodeURIComponent(message)}`);
}

function readableError(error: unknown): string {
  if (error instanceof ZodError) return error.issues[0]?.message ?? "Check the company content.";
  if (error instanceof Error) return error.message;
  return "The company content could not be saved.";
}

function contentSections(input: AboutContentInput) {
  return [
    { key: "overview", title: input.overviewTitle, body: input.overviewBody },
    { key: "expertise", title: input.expertiseTitle, body: input.expertiseBody },
    { key: "oil_filter", title: input.oilFilterTitle, body: input.oilFilterBody },
    { key: "fuel_filter", title: input.fuelFilterTitle, body: input.fuelFilterBody },
    { key: "air_filter", title: input.airFilterTitle, body: input.airFilterBody },
    { key: "mission", title: input.missionTitle, body: input.missionBody },
    { key: "vision", title: input.visionTitle, body: input.visionBody },
    { key: "quality", title: input.qualityTitle, body: input.qualityBody },
  ];
}

function revalidateCompanyViews() {
  revalidatePath("/admin/settings");
  revalidatePath("/about");
}

async function saveAboutContent(input: AboutContentInput, staffId: string) {
  const supabase = await createClient();
  const { data: existing } = await supabase.from("content_pages").select("id").eq("slug", "about").maybeSingle();
  const payload = { eyebrow: input.eyebrow, title: input.title, summary: input.summary, sections: contentSections(input), publication_status: input.published ? "published" : "draft", updated_by: staffId };
  if (existing) {
    const { error } = await supabase.from("content_pages").update(payload).eq("id", existing.id);
    if (error) throw new Error("The About page content could not be updated.");
    return;
  }
  const { error } = await supabase.from("content_pages").insert({ ...payload, slug: "about", created_by: staffId });
  if (error) throw new Error("The About page content could not be created.");
}

function leadershipPhotoFrom(formData: FormData): File | null {
  const value = formData.get("leadershipPhoto");
  if (!(value instanceof File) || value.size === 0) return null;
  if (!leadershipImageTypes.has(value.type)) {
    throw new Error("Choose a JPEG, PNG, or WebP leadership portrait.");
  }
  if (value.size > leadershipImageMaxSize) {
    throw new Error("The leadership portrait must be 5 MB or smaller.");
  }
  return value;
}

async function uploadLeadershipPhoto(leadershipId: string, photo: File): Promise<string> {
  const storagePath = leadershipImagePath(leadershipId);
  const admin = createAdminClient();
  const { error } = await admin.storage
    .from(leadershipImageBucket)
    .upload(storagePath, await photo.arrayBuffer(), {
      contentType: photo.type,
      cacheControl: "3600",
      upsert: true,
    });

  if (error) throw new Error("The leadership portrait could not be uploaded.");
  return storagePath;
}

async function removeLeadershipPhoto(storagePath: string | null): Promise<void> {
  if (!storagePath) return;
  const admin = createAdminClient();
  const { error } = await admin.storage.from(leadershipImageBucket).remove([storagePath]);
  if (error) {
    console.error("[leadership:image-remove]", { message: error.message });
  }
}

async function saveLeadership(
  input: LeadershipInput,
  photo: File | null,
  removePhoto: boolean,
) {
  const supabase = await createClient();
  const leadershipId = input.leadershipId ?? crypto.randomUUID();
  const uploadedPath = photo ? await uploadLeadershipPhoto(leadershipId, photo) : undefined;
  const payload = {
    full_name: input.fullName,
    title: input.title,
    biography: input.biography,
    message: input.message || null,
    display_order: input.displayOrder,
    published: input.published,
    ...(uploadedPath !== undefined
      ? { photo_storage_path: uploadedPath }
      : removePhoto
        ? { photo_storage_path: null }
        : {}),
  };

  if (input.leadershipId) {
    const { error } = await supabase.from("leadership_profiles").update(payload).eq("id", input.leadershipId);
    if (error) throw new Error("The leadership profile could not be updated.");
    if (removePhoto && !uploadedPath) {
      await removeLeadershipPhoto(leadershipImagePath(input.leadershipId));
    }
    return;
  }

  const { error } = await supabase
    .from("leadership_profiles")
    .insert({ id: leadershipId, ...payload });
  if (error) {
    if (uploadedPath) await removeLeadershipPhoto(uploadedPath);
    throw new Error("The leadership profile could not be created.");
  }
}

export async function updateAboutContent(formData: FormData): Promise<void> {
  const profile = await requireStaff("content:manage");
  try {
    await saveAboutContent(aboutContentFormData(formData), profile.id);
  } catch (error) {
    actionRedirect(readableError(error));
  }
  revalidateCompanyViews();
  actionRedirect("Company and About page content updated.");
}

export async function createOrUpdateLeadership(formData: FormData): Promise<void> {
  await requireStaff("content:manage");
  let input: LeadershipInput;
  try {
    input = leadershipFormData(formData);
    const photo = leadershipPhotoFrom(formData);
    const removePhoto = formData.get("removeLeadershipPhoto") === "on" && !photo;
    await saveLeadership(input, photo, removePhoto);
  } catch (error) {
    actionRedirect(readableError(error));
  }
  revalidateCompanyViews();
  actionRedirect(input.leadershipId ? "Leadership profile updated." : "Leadership profile added.");
}

export async function setLeadershipPublished(formData: FormData): Promise<void> {
  await requireStaff("content:manage");
  const parsed = leadershipStatusSchema.safeParse({ leadershipId: formData.get("leadershipId"), published: formData.get("published") });
  if (!parsed.success) actionRedirect("The leadership publication request was invalid.");
  const supabase = await createClient();
  const { error } = await supabase.from("leadership_profiles").update({ published: parsed.data.published }).eq("id", parsed.data.leadershipId);
  if (error) actionRedirect("The leadership profile status could not be changed.");
  revalidateCompanyViews();
  actionRedirect(parsed.data.published ? "Leadership profile published." : "Leadership profile hidden.");
}

export async function deleteLeadership(formData: FormData): Promise<void> {
  const profile = await requireStaff("content:manage");
  if (profile.role !== "super_admin") actionRedirect("Only a super administrator can permanently delete leadership content.");
  const parsed = leadershipDeleteSchema.safeParse({ leadershipId: formData.get("leadershipId") });
  if (!parsed.success) actionRedirect("The leadership removal request was invalid.");
  const supabase = await createClient();
  const { data: leadership } = await supabase
    .from("leadership_profiles")
    .select("photo_storage_path")
    .eq("id", parsed.data.leadershipId)
    .maybeSingle();
  const { error } = await supabase.from("leadership_profiles").delete().eq("id", parsed.data.leadershipId);
  if (error) actionRedirect("The leadership profile could not be deleted.");
  await removeLeadershipPhoto(leadership?.photo_storage_path ?? null);
  revalidateCompanyViews();
  actionRedirect("Leadership profile permanently deleted.");
}
