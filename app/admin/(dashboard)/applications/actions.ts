"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { requireStaff } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  applicationDeleteSchema,
  equipmentApplicationFormData,
  vehicleApplicationFormData,
  type EquipmentApplicationInput,
  type VehicleApplicationInput,
} from "@/lib/validation/catalogue-admin";

type StaffSupabaseClient = Awaited<ReturnType<typeof createClient>>;

function actionRedirect(message: string): never {
  redirect(`/admin/applications?message=${encodeURIComponent(message)}`);
}

function readableError(error: unknown): string {
  if (error instanceof ZodError) return error.issues[0]?.message ?? "Check the application details.";
  if (error instanceof Error) return error.message;
  return "The application could not be saved.";
}

function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function upsertEngine(
  client: StaffSupabaseClient,
  manufacturer: string,
  model: string,
): Promise<string | null> {
  if (!model) return null;
  const { data, error } = await client
    .from("engine_models")
    .upsert(
      { manufacturer, model, slug: slugify(`${manufacturer}-${model}`) },
      { onConflict: "manufacturer,model" },
    )
    .select("id")
    .single();
  if (error || !data) throw new Error(`Engine ${model} could not be saved.`);
  return String(data.id);
}

async function upsertVehicleModel(
  client: StaffSupabaseClient,
  brandName: string,
  modelName: string,
): Promise<string> {
  const { data: brand, error: brandError } = await client
    .from("vehicle_brands")
    .upsert({ name: brandName, slug: slugify(brandName) }, { onConflict: "name" })
    .select("id")
    .single();
  if (brandError || !brand) throw new Error(`Vehicle brand ${brandName} could not be saved.`);

  const { data: model, error: modelError } = await client
    .from("vehicle_models")
    .upsert(
      { vehicle_brand_id: brand.id, name: modelName, slug: slugify(modelName) },
      { onConflict: "vehicle_brand_id,slug" },
    )
    .select("id")
    .single();
  if (modelError || !model) throw new Error(`Vehicle model ${modelName} could not be saved.`);
  return String(model.id);
}

async function upsertEquipmentType(
  client: StaffSupabaseClient,
  name: string,
  industry: string,
): Promise<string> {
  const { data, error } = await client
    .from("equipment_types")
    .upsert({ name, slug: slugify(name), industry }, { onConflict: "name" })
    .select("id")
    .single();
  if (error || !data) throw new Error(`Equipment type ${name} could not be saved.`);
  return String(data.id);
}

async function productIdForApplication(
  client: StaffSupabaseClient,
  table: "product_vehicle_applications" | "product_equipment_applications",
  applicationId: string,
): Promise<string | null> {
  const { data } = await client.from(table).select("product_id").eq("id", applicationId).maybeSingle();
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

function revalidateApplicationViews() {
  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/applications");
}

async function saveVehicleApplication(
  client: StaffSupabaseClient,
  input: VehicleApplicationInput,
): Promise<string | null> {
  const vehicleModelId = await upsertVehicleModel(client, input.brand, input.model);
  const engineModelId = await upsertEngine(client, input.brand, input.engine);
  const payload = {
    product_id: input.productId,
    vehicle_model_id: vehicleModelId,
    engine_model_id: engineModelId,
    year_from: input.yearFrom ?? null,
    year_to: input.yearTo ?? null,
    notes: input.notes || null,
  };

  if (input.applicationId) {
    const previousProductId = await productIdForApplication(client, "product_vehicle_applications", input.applicationId);
    const { error } = await client.from("product_vehicle_applications").update(payload).eq("id", input.applicationId);
    if (error) throw new Error("The vehicle application could not be updated.");
    return previousProductId;
  }

  const { error } = await client.from("product_vehicle_applications").insert(payload);
  if (error) throw new Error("The vehicle application could not be created.");
  return null;
}

async function saveEquipmentApplication(
  client: StaffSupabaseClient,
  input: EquipmentApplicationInput,
): Promise<string | null> {
  const equipmentTypeId = await upsertEquipmentType(client, input.equipmentType, input.industry);
  const engineModelId = await upsertEngine(client, input.manufacturer, input.engine);
  const payload = {
    product_id: input.productId,
    equipment_type_id: equipmentTypeId,
    manufacturer: input.manufacturer,
    model: input.model,
    engine_model_id: engineModelId,
    notes: input.notes || null,
  };

  if (input.applicationId) {
    const previousProductId = await productIdForApplication(client, "product_equipment_applications", input.applicationId);
    const { error } = await client.from("product_equipment_applications").update(payload).eq("id", input.applicationId);
    if (error) throw new Error("The equipment application could not be updated.");
    return previousProductId;
  }

  const { error } = await client.from("product_equipment_applications").insert(payload);
  if (error) throw new Error("The equipment application could not be created.");
  return null;
}

export async function createOrUpdateVehicleApplication(formData: FormData): Promise<void> {
  const profile = await requireStaff("products:write");
  let input: VehicleApplicationInput;
  try {
    input = vehicleApplicationFormData(formData);
  } catch (error) {
    actionRedirect(readableError(error));
  }

  const client = await createClient();
  try {
    const previousProductId = await saveVehicleApplication(client, input);
    await touchAndRevalidateProduct(client, input.productId, profile.id);
    if (previousProductId && previousProductId !== input.productId) {
      await touchAndRevalidateProduct(client, previousProductId, profile.id);
    }
  } catch (error) {
    actionRedirect(readableError(error));
  }

  revalidateApplicationViews();
  actionRedirect(input.applicationId ? "Vehicle application updated." : "Vehicle application added.");
}

export async function createOrUpdateEquipmentApplication(formData: FormData): Promise<void> {
  const profile = await requireStaff("products:write");
  let input: EquipmentApplicationInput;
  try {
    input = equipmentApplicationFormData(formData);
  } catch (error) {
    actionRedirect(readableError(error));
  }

  const client = await createClient();
  try {
    const previousProductId = await saveEquipmentApplication(client, input);
    await touchAndRevalidateProduct(client, input.productId, profile.id);
    if (previousProductId && previousProductId !== input.productId) {
      await touchAndRevalidateProduct(client, previousProductId, profile.id);
    }
  } catch (error) {
    actionRedirect(readableError(error));
  }

  revalidateApplicationViews();
  actionRedirect(input.applicationId ? "Equipment application updated." : "Equipment application added.");
}

export async function deleteApplication(formData: FormData): Promise<void> {
  const profile = await requireStaff("products:write");
  let values: { applicationId: string; kind: "vehicle" | "equipment" };
  try {
    values = applicationDeleteSchema.parse({
      applicationId: formData.get("applicationId"),
      kind: formData.get("kind"),
    });
  } catch (error) {
    actionRedirect(readableError(error));
  }

  const client = await createClient();
  const table = values.kind === "vehicle" ? "product_vehicle_applications" : "product_equipment_applications";
  const productId = await productIdForApplication(client, table, values.applicationId);
  if (!productId) actionRedirect("That application no longer exists.");
  const { error } = await client.from(table).delete().eq("id", values.applicationId);
  if (error) actionRedirect("The application could not be removed.");

  try {
    await touchAndRevalidateProduct(client, productId, profile.id);
  } catch (touchError) {
    actionRedirect(readableError(touchError));
  }
  revalidateApplicationViews();
  actionRedirect("Application removed.");
}
