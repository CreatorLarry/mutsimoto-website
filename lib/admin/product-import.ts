import "server-only";

import { productCategoryLabels } from "@/types/categories";
import type { StaffProfile } from "@/types/admin";
import type {
  ImportedProduct,
  ParsedProductWorkbook,
  ProductImportCommitResult,
} from "@/types/product-import";
import { createClient } from "@/lib/supabase/server";

type StaffSupabaseClient = Awaited<ReturnType<typeof createClient>>;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function descriptionsFor(product: ImportedProduct) {
  const application =
    product.applicationType === "both"
      ? "automotive and industrial applications"
      : `${product.applicationType} applications`;
  const automaticShortDescription = `${product.name} (${product.partNumber}) is a Mutsimoto ${productCategoryLabels[product.category]} for ${application}.`;
  const shortDescription = product.shortDescription || automaticShortDescription;
  const fullDescription =
    product.fullDescription ||
    `${product.shortDescription || automaticShortDescription} Contact Mutsimoto Motor Company to confirm fitment, technical specifications, and cross-reference compatibility before installation.`;
  return { shortDescription, fullDescription };
}

async function availableSlug(
  client: StaffSupabaseClient,
  preferred: string,
  currentProductId: string | null,
): Promise<string> {
  const base = slugify(preferred) || "mutsimoto-filter";
  for (let suffix = 1; suffix <= 100; suffix += 1) {
    const candidate = suffix === 1 ? base : `${base}-${suffix}`;
    const { data, error } = await client
      .from("products")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (error) throw new Error("The product URL could not be checked.");
    if (!data || String(data.id) === currentProductId) return candidate;
  }
  throw new Error("A unique product URL could not be generated.");
}

async function upsertEngine(
  client: StaffSupabaseClient,
  manufacturer: string,
  model: string | null,
): Promise<string | null> {
  if (!model) return null;
  const slug = slugify(`${manufacturer}-${model}`);
  const { data: existing, error: lookupError } = await client
    .from("engine_models")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (lookupError) throw new Error(`Engine ${manufacturer} ${model} could not be checked.`);
  if (existing) return String(existing.id);

  const { data, error } = await client
    .from("engine_models")
    .insert({ manufacturer, model, slug })
    .select("id")
    .single();
  if (error || !data) {
    const { data: raced } = await client
      .from("engine_models")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (raced) return String(raced.id);
    throw new Error(`Engine ${manufacturer} ${model} could not be saved.`);
  }
  return String(data.id);
}

async function resolveVehicleBrand(
  client: StaffSupabaseClient,
  name: string,
): Promise<string> {
  const slug = slugify(name);
  const { data: existing, error: lookupError } = await client
    .from("vehicle_brands")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (lookupError) throw new Error(`Vehicle brand ${name} could not be checked.`);
  if (existing) return String(existing.id);

  const { data, error } = await client
    .from("vehicle_brands")
    .insert({ name, slug })
    .select("id")
    .single();
  if (!error && data) return String(data.id);

  const { data: raced } = await client
    .from("vehicle_brands")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (raced) return String(raced.id);
  throw new Error(`Vehicle brand ${name} could not be saved.`);
}

async function resolveVehicleModel(
  client: StaffSupabaseClient,
  brandId: string,
  brandName: string,
  modelName: string,
): Promise<string> {
  const slug = slugify(modelName);
  const { data: existing, error: lookupError } = await client
    .from("vehicle_models")
    .select("id")
    .eq("vehicle_brand_id", brandId)
    .eq("slug", slug)
    .maybeSingle();
  if (lookupError) {
    throw new Error(`Vehicle model ${brandName} ${modelName} could not be checked.`);
  }
  if (existing) return String(existing.id);

  const { data, error } = await client
    .from("vehicle_models")
    .insert({ vehicle_brand_id: brandId, name: modelName, slug })
    .select("id")
    .single();
  if (!error && data) return String(data.id);

  const { data: raced } = await client
    .from("vehicle_models")
    .select("id")
    .eq("vehicle_brand_id", brandId)
    .eq("slug", slug)
    .maybeSingle();
  if (raced) return String(raced.id);
  throw new Error(`Vehicle model ${brandName} ${modelName} could not be saved.`);
}

async function resolveEquipmentType(
  client: StaffSupabaseClient,
  name: string,
  industry: string,
): Promise<string> {
  const slug = slugify(name);
  const { data: existing, error: lookupError } = await client
    .from("equipment_types")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (lookupError) throw new Error(`Equipment type ${name} could not be checked.`);
  if (existing) return String(existing.id);

  const { data, error } = await client
    .from("equipment_types")
    .insert({ name, slug, industry })
    .select("id")
    .single();
  if (!error && data) return String(data.id);

  const { data: raced } = await client
    .from("equipment_types")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (raced) return String(raced.id);
  throw new Error(`Equipment type ${name} could not be saved.`);
}

interface ResolvedVehicleApplication {
  vehicleModelId: string;
  engineModelId: string | null;
  yearFrom: number | null;
  yearTo: number | null;
  notes: string | null;
}

interface ResolvedEquipmentApplication {
  equipmentTypeId: string;
  manufacturer: string;
  model: string;
  engineModelId: string | null;
  notes: string | null;
}

async function resolveRelatedData(
  client: StaffSupabaseClient,
  product: ImportedProduct,
): Promise<{
  vehicleApplications: ResolvedVehicleApplication[];
  equipmentApplications: ResolvedEquipmentApplication[];
}> {
  const vehicleApplications: ResolvedVehicleApplication[] = [];
  for (const item of product.vehicleApplications) {
    const brandId = await resolveVehicleBrand(client, item.brand);
    const vehicleModelId = await resolveVehicleModel(
      client,
      brandId,
      item.brand,
      item.model,
    );
    const engineModelId = await upsertEngine(
      client,
      item.engineManufacturer,
      item.engineModel,
    );
    vehicleApplications.push({
      vehicleModelId,
      engineModelId,
      yearFrom: item.yearFrom,
      yearTo: item.yearTo,
      notes: item.notes,
    });
  }

  const equipmentApplications: ResolvedEquipmentApplication[] = [];
  for (const item of product.equipmentApplications) {
    const equipmentTypeId = await resolveEquipmentType(
      client,
      item.equipmentType,
      item.industry,
    );
    const engineModelId = await upsertEngine(
      client,
      item.engineManufacturer,
      item.engineModel,
    );
    equipmentApplications.push({
      equipmentTypeId,
      manufacturer: item.manufacturer,
      model: item.model,
      engineModelId,
      notes: item.notes,
    });
  }

  return { vehicleApplications, equipmentApplications };
}

async function replaceRelatedData(
  client: StaffSupabaseClient,
  productId: string,
  product: ImportedProduct,
  resolved: Awaited<ReturnType<typeof resolveRelatedData>>,
) {
  const relatedTables = [
    "specifications",
    "oem_references",
    "product_vehicle_applications",
    "product_equipment_applications",
  ] as const;
  for (const table of relatedTables) {
    const { error } = await client.from(table).delete().eq("product_id", productId);
    if (error) throw new Error(`Existing ${table.replaceAll("_", " ")} could not be replaced.`);
  }

  if (product.specifications.length > 0) {
    const { error } = await client.from("specifications").insert(
      product.specifications.map((item) => ({
        product_id: productId,
        label: item.label,
        value: item.value,
        unit: item.unit,
        display_order: item.displayOrder,
      })),
    );
    if (error) throw new Error("Technical specifications could not be saved.");
  }

  if (product.references.length > 0) {
    const { error } = await client.from("oem_references").insert(
      product.references.map((item) => ({
        product_id: productId,
        reference_type: item.referenceType,
        manufacturer: item.manufacturer,
        reference_number: item.referenceNumber,
      })),
    );
    if (error) throw new Error("OEM and cross-reference numbers could not be saved.");
  }

  for (const item of resolved.vehicleApplications) {
    const { error } = await client.from("product_vehicle_applications").insert({
      product_id: productId,
      vehicle_model_id: item.vehicleModelId,
      engine_model_id: item.engineModelId,
      year_from: item.yearFrom,
      year_to: item.yearTo,
      notes: item.notes,
    });
    if (error) {
      throw new Error("A vehicle application could not be saved.");
    }
  }

  for (const item of resolved.equipmentApplications) {
    const { error } = await client.from("product_equipment_applications").insert({
      product_id: productId,
      equipment_type_id: item.equipmentTypeId,
      manufacturer: item.manufacturer,
      model: item.model,
      engine_model_id: item.engineModelId,
      notes: item.notes,
    });
    if (error) {
      throw new Error(
        `Equipment application ${item.manufacturer} ${item.model} could not be saved.`,
      );
    }
  }
}

async function saveProduct(
  client: StaffSupabaseClient,
  profile: StaffProfile,
  product: ImportedProduct,
): Promise<{ action: "created" | "updated"; id: string }> {
  const { data: existing, error: lookupError } = await client
    .from("products")
    .select("id, slug")
    .eq("part_number_normalized", product.normalizedPartNumber)
    .maybeSingle();
  if (lookupError) throw new Error("The product could not be checked in the database.");

  const existingId = existing ? String(existing.id) : null;
  const slug = existing?.slug
    ? String(existing.slug)
    : await availableSlug(client, `${product.name}-${product.partNumber}`, existingId);
  const descriptions = descriptionsFor(product);
  const payload = {
    name: product.name,
    slug,
    part_number: product.partNumber,
    category: product.category,
    short_description: descriptions.shortDescription,
    full_description: descriptions.fullDescription,
    application_type: product.applicationType,
    availability: product.availability,
    featured: product.featured,
    seo_title: product.seoTitle || null,
    seo_description: product.seoDescription || null,
    updated_by: profile.id,
  };

  // Resolve shared catalogue dimensions before changing the product or deleting
  // its existing fitment data. This keeps case variants such as HINO/Hino from
  // colliding on the same canonical slug.
  const resolved = await resolveRelatedData(client, product);

  let productId = existingId;
  let action: "created" | "updated" = existingId ? "updated" : "created";
  if (existingId) {
    const { error } = await client.from("products").update(payload).eq("id", existingId);
    if (error) throw new Error("The product record could not be updated.");
  } else {
    const { data, error } = await client
      .from("products")
      .insert({
        ...payload,
        publication_status: "draft" as const,
        published_at: null,
        created_by: profile.id,
      })
      .select("id")
      .single();
    if (!error && data) {
      productId = String(data.id);
    } else if (error?.code === "23505") {
      const { data: raced, error: racedError } = await client
        .from("products")
        .select("id")
        .eq("part_number_normalized", product.normalizedPartNumber)
        .maybeSingle();
      if (racedError || !raced) throw new Error("The product record could not be created.");
      productId = String(raced.id);
      action = "updated";
      const { error: updateError } = await client
        .from("products")
        .update(payload)
        .eq("id", productId);
      if (updateError) throw new Error("The existing product record could not be updated.");
    } else {
      throw new Error("The product record could not be created.");
    }
  }

  if (!productId) throw new Error("The saved product could not be identified.");
  try {
    await replaceRelatedData(client, productId, product, resolved);
  } catch (error) {
    if (action === "created") {
      await client.from("products").delete().eq("id", productId);
    }
    throw error;
  }
  return { action, id: productId };
}

export async function importProductWorkbook(
  parsed: ParsedProductWorkbook,
  profile: StaffProfile,
  options: { offset: number; limit: number },
): Promise<ProductImportCommitResult> {
  const client = await createClient();
  return importProductWorkbookWithClient(client, parsed, profile, options);
}

export async function importProductWorkbookWithClient(
  client: StaffSupabaseClient,
  parsed: ParsedProductWorkbook,
  profile: StaffProfile,
  options: { offset: number; limit: number },
): Promise<ProductImportCommitResult> {
  const products = parsed.products.slice(options.offset, options.offset + options.limit);
  const nextOffset = options.offset + products.length;
  const result: ProductImportCommitResult = {
    created: 0,
    updated: 0,
    failed: [],
    products: [],
    mediaPending: {
      images: parsed.totals.images,
      technicalSheets: parsed.totals.technicalSheets,
    },
    progress: {
      processed: products.length,
      total: parsed.products.length,
      nextOffset: nextOffset < parsed.products.length ? nextOffset : null,
      complete: nextOffset >= parsed.products.length,
    },
  };

  for (const product of products) {
    try {
      const saved = await saveProduct(client, profile, product);
      result[saved.action] += 1;
      result.products.push({
        id: saved.id,
        partNumber: product.partNumber,
        normalizedPartNumber: product.normalizedPartNumber,
        name: product.name,
        action: saved.action,
      });
    } catch (error) {
      result.failed.push({
        partNumber: product.partNumber,
        name: product.name,
        message: error instanceof Error ? error.message : "The product could not be imported.",
      });
    }
  }

  return result;
}
