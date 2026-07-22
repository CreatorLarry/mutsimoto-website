"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { hasPermission } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  parseEquipmentApplications,
  parseReferences,
  parseSpecifications,
  parseVehicleApplications,
  productFormData,
  type ParsedEquipmentApplication,
  type ParsedReference,
  type ParsedSpecification,
  type ParsedVehicleApplication,
  type ProductFormInput,
} from "@/lib/validation/product";

type StaffSupabaseClient = Awaited<ReturnType<typeof createClient>>;

function actionRedirect(path: string, message: string): never {
  redirect(`${path}${path.includes("?") ? "&" : "?"}message=${encodeURIComponent(message)}`);
}

function readableError(error: unknown): string {
  if (error instanceof ZodError) return error.issues[0]?.message ?? "Check the highlighted product information.";
  if (error instanceof Error) return error.message;
  return "The product could not be saved.";
}

function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function publicationStatus(input: ProductFormInput): "draft" | "review" | "published" {
  if (input.intent === "publish") return "published";
  return input.intent;
}

async function replaceSpecifications(client: StaffSupabaseClient, productId: string, values: ParsedSpecification[]) {
  const { error: deleteError } = await client.from("specifications").delete().eq("product_id", productId);
  if (deleteError) throw new Error("Specifications could not be updated.");
  if (values.length === 0) return;
  const { error } = await client.from("specifications").insert(values.map((value) => ({ ...value, product_id: productId })));
  if (error) throw new Error("Specifications could not be saved.");
}

async function replaceReferences(client: StaffSupabaseClient, productId: string, values: ParsedReference[]) {
  const { error: deleteError } = await client.from("oem_references").delete().eq("product_id", productId);
  if (deleteError) throw new Error("Cross references could not be updated.");
  if (values.length === 0) return;
  const { error } = await client.from("oem_references").insert(values.map((value) => ({ ...value, product_id: productId })));
  if (error) throw new Error("Cross references could not be saved. Check for duplicate reference numbers.");
}

async function upsertEngine(client: StaffSupabaseClient, manufacturer: string, model: string | null): Promise<string | null> {
  if (!model) return null;
  const { data, error } = await client.from("engine_models").upsert({ manufacturer, model, slug: slugify(`${manufacturer}-${model}`) }, { onConflict: "manufacturer,model" }).select("id").single();
  if (error || !data) throw new Error(`Engine ${model} could not be saved.`);
  return String(data.id);
}

async function replaceVehicleApplications(client: StaffSupabaseClient, productId: string, values: ParsedVehicleApplication[]) {
  const { error: deleteError } = await client.from("product_vehicle_applications").delete().eq("product_id", productId);
  if (deleteError) throw new Error("Vehicle applications could not be updated.");

  for (const value of values) {
    const { data: brand, error: brandError } = await client.from("vehicle_brands").upsert({ name: value.brand, slug: slugify(value.brand) }, { onConflict: "name" }).select("id").single();
    if (brandError || !brand) throw new Error(`Vehicle brand ${value.brand} could not be saved.`);
    const { data: model, error: modelError } = await client.from("vehicle_models").upsert({ vehicle_brand_id: brand.id, name: value.model, slug: slugify(value.model) }, { onConflict: "vehicle_brand_id,slug" }).select("id").single();
    if (modelError || !model) throw new Error(`Vehicle model ${value.model} could not be saved.`);
    const engineId = await upsertEngine(client, value.brand, value.engine);
    const { error } = await client.from("product_vehicle_applications").insert({ product_id: productId, vehicle_model_id: model.id, engine_model_id: engineId, year_from: value.yearFrom, year_to: value.yearTo, notes: value.notes });
    if (error) throw new Error(`Vehicle application ${value.brand} ${value.model} could not be saved.`);
  }
}

async function replaceEquipmentApplications(client: StaffSupabaseClient, productId: string, values: ParsedEquipmentApplication[]) {
  const { error: deleteError } = await client.from("product_equipment_applications").delete().eq("product_id", productId);
  if (deleteError) throw new Error("Equipment applications could not be updated.");

  for (const value of values) {
    const { data: equipmentType, error: typeError } = await client.from("equipment_types").upsert({ name: value.equipmentType, slug: slugify(value.equipmentType), industry: value.industry }, { onConflict: "name" }).select("id").single();
    if (typeError || !equipmentType) throw new Error(`Equipment type ${value.equipmentType} could not be saved.`);
    const engineId = await upsertEngine(client, value.manufacturer, value.engine);
    const { error } = await client.from("product_equipment_applications").insert({ product_id: productId, equipment_type_id: equipmentType.id, manufacturer: value.manufacturer, model: value.model, engine_model_id: engineId, notes: value.notes });
    if (error) throw new Error(`Equipment application ${value.manufacturer} ${value.model} could not be saved.`);
  }
}

const imageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

async function uploadPrimaryImage(client: StaffSupabaseClient, productId: string, productName: string, altText: string, file: File) {
  if (file.size === 0) return;
  const extension = imageTypes.get(file.type);
  if (!extension) throw new Error("Product images must be JPEG, PNG, or WebP files.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Product images must be smaller than 5 MB.");
  if (altText.trim().length < 3) throw new Error("Add descriptive alt text for the product image.");

  const storagePath = `${productId}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await client.storage.from("product-images").upload(storagePath, file, { cacheControl: "3600", contentType: file.type, upsert: false });
  if (uploadError) throw new Error("The product image could not be uploaded.");

  const { data: previousPrimary } = await client.from("product_images").select("id").eq("product_id", productId).eq("is_primary", true).maybeSingle();
  if (previousPrimary) await client.from("product_images").update({ is_primary: false }).eq("id", previousPrimary.id);

  const { error: imageError } = await client.from("product_images").insert({ product_id: productId, storage_path: storagePath, alt_text: altText.trim() || `${productName} product image`, display_order: 0, is_primary: true });
  if (imageError) {
    await client.storage.from("product-images").remove([storagePath]);
    if (previousPrimary) await client.from("product_images").update({ is_primary: true }).eq("id", previousPrimary.id);
    throw new Error("The uploaded image metadata could not be saved.");
  }

  const { error: productError } = await client.from("products").update({ primary_image_url: storagePath }).eq("id", productId);
  if (productError) throw new Error("The product image could not be selected as primary.");
}

function parseRelatedData(input: ProductFormInput) {
  return {
    specifications: parseSpecifications(input.specifications),
    references: parseReferences(input.references),
    vehicleApplications: parseVehicleApplications(input.vehicleApplications),
    equipmentApplications: parseEquipmentApplications(input.equipmentApplications),
  };
}

async function saveRelatedData(client: StaffSupabaseClient, productId: string, input: ProductFormInput) {
  const related = parseRelatedData(input);
  await replaceSpecifications(client, productId, related.specifications);
  await replaceReferences(client, productId, related.references);
  await replaceVehicleApplications(client, productId, related.vehicleApplications);
  await replaceEquipmentApplications(client, productId, related.equipmentApplications);
}

export async function createProduct(formData: FormData): Promise<void> {
  const profile = await requireStaff("products:write");
  let input: ProductFormInput;
  try {
    input = productFormData(formData);
    parseRelatedData(input);
  } catch (error) {
    actionRedirect("/admin/products/new", readableError(error));
  }

  if (input.intent === "publish" && !hasPermission(profile, "products:publish")) {
    actionRedirect("/admin/products/new", "You do not have permission to publish products.");
  }

  const client = await createClient();
  const status = publicationStatus(input);
  const { data, error } = await client.from("products").insert({
    name: input.name,
    slug: input.slug,
    part_number: input.partNumber,
    category: input.category,
    short_description: input.shortDescription,
    full_description: input.fullDescription,
    application_type: input.applicationType,
    availability: input.availability,
    featured: input.featured,
    publication_status: status,
    seo_title: input.seoTitle || null,
    seo_description: input.seoDescription || null,
    created_by: profile.id,
    updated_by: profile.id,
    published_at: status === "published" ? new Date().toISOString() : null,
  }).select("id").single();

  if (error || !data) {
    actionRedirect("/admin/products/new", error?.code === "23505" ? "That slug or part number already exists." : "The product could not be created.");
  }

  try {
    await saveRelatedData(client, String(data.id), input);
    const image = formData.get("primaryImage");
    if (image instanceof File) await uploadPrimaryImage(client, String(data.id), input.name, input.imageAlt, image);
  } catch (saveError) {
    actionRedirect(`/admin/products/${data.id}/edit`, readableError(saveError));
  }

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${input.slug}`);
  actionRedirect(`/admin/products/${data.id}/edit`, "Product saved successfully.");
}

export async function updateProduct(productId: string, formData: FormData): Promise<void> {
  const profile = await requireStaff("products:write");
  const editPath = `/admin/products/${productId}/edit`;
  let input: ProductFormInput;
  try {
    input = productFormData(formData);
    parseRelatedData(input);
  } catch (error) {
    actionRedirect(editPath, readableError(error));
  }

  if (input.intent === "publish" && !hasPermission(profile, "products:publish")) {
    actionRedirect(editPath, "You do not have permission to publish products.");
  }

  const client = await createClient();
  const status = publicationStatus(input);
  const { error } = await client.from("products").update({
    name: input.name,
    slug: input.slug,
    part_number: input.partNumber,
    category: input.category,
    short_description: input.shortDescription,
    full_description: input.fullDescription,
    application_type: input.applicationType,
    availability: input.availability,
    featured: input.featured,
    publication_status: status,
    seo_title: input.seoTitle || null,
    seo_description: input.seoDescription || null,
    updated_by: profile.id,
  }).eq("id", productId);

  if (error) actionRedirect(editPath, error.code === "23505" ? "That slug or part number already exists." : "The product could not be updated.");

  try {
    await saveRelatedData(client, productId, input);
    const image = formData.get("primaryImage");
    if (image instanceof File) await uploadPrimaryImage(client, productId, input.name, input.imageAlt, image);
  } catch (saveError) {
    actionRedirect(editPath, readableError(saveError));
  }

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${input.slug}`);
  actionRedirect(editPath, "Product updated successfully.");
}

export async function archiveProduct(formData: FormData): Promise<void> {
  const profile = await requireStaff("products:write");
  if (!hasPermission(profile, "products:publish")) actionRedirect("/admin/products", "You do not have permission to archive products.");
  const productId = String(formData.get("productId") ?? "");
  if (!productId) actionRedirect("/admin/products", "No product was selected.");
  const client = await createClient();
  const { error } = await client.from("products").update({ publication_status: "archived", updated_by: profile.id }).eq("id", productId);
  if (error) actionRedirect("/admin/products", "The product could not be archived.");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  actionRedirect("/admin/products", "Product archived.");
}

