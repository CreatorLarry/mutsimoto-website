import "server-only";

import { products as mockProducts } from "@/data/products";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationType, FilterCategory, Product } from "@/types";

interface ProductImageRecord {
  storage_path: string;
  alt_text: string;
  display_order: number;
  is_primary: boolean;
}

interface SpecificationRecord {
  label: string;
  value: string;
  unit: string | null;
  display_order: number;
}

interface ReferenceRecord {
  reference_number: string;
}

interface VehicleApplicationRecord {
  vehicle_models: { name: string; vehicle_brands: { name: string } | null } | null;
  engine_models: { model: string } | null;
}

interface EquipmentApplicationRecord {
  manufacturer: string;
  model: string;
  equipment_types: { name: string } | null;
  engine_models: { model: string } | null;
}

interface ProductRecord {
  id: string;
  slug: string;
  name: string;
  part_number: string;
  category: "oil" | "fuel" | "air";
  short_description: string;
  full_description: string;
  application_type: "automotive" | "industrial" | "both";
  availability: string;
  featured: boolean;
  publication_status: "draft" | "review" | "published" | "archived";
  primary_image_url: string | null;
  technical_sheet_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  product_images: ProductImageRecord[];
  specifications: SpecificationRecord[];
  oem_references: ReferenceRecord[];
  product_vehicle_applications: VehicleApplicationRecord[];
  product_equipment_applications: EquipmentApplicationRecord[];
}

const publicProductSelect = `
  id, slug, name, part_number, category, short_description, full_description,
  application_type, availability, featured, publication_status,
  primary_image_url, technical_sheet_url, seo_title, seo_description,
  product_images(storage_path, alt_text, display_order, is_primary),
  specifications(label, value, unit, display_order),
  oem_references(reference_number),
  product_vehicle_applications(
    vehicle_models(name, vehicle_brands(name)),
    engine_models(model)
  ),
  product_equipment_applications(
    manufacturer, model,
    equipment_types(name),
    engine_models(model)
  )
`;

const categoryLabels: Record<ProductRecord["category"], FilterCategory> = {
  oil: "Oil Filters",
  fuel: "Fuel Filters",
  air: "Air Filters",
};

const applicationLabels: Record<ProductRecord["application_type"], ApplicationType> = {
  automotive: "Automotive",
  industrial: "Industrial",
  both: "Both",
};

async function signedPathMap(
  bucket: "product-images" | "technical-sheets",
  paths: string[],
): Promise<Map<string, string>> {
  const uniquePaths = [...new Set(paths.filter((path) => path && !path.startsWith("/") && !path.startsWith("http")))];
  if (uniquePaths.length === 0) return new Map();
  const supabase = await createClient();
  const signed = await Promise.all(uniquePaths.map(async (path) => {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);
    return error || !data ? null : [path, data.signedUrl] as const;
  }));
  return new Map(signed.filter((entry): entry is readonly [string, string] => entry !== null));
}

function directOrSigned(path: string | null, signed: Map<string, string>, fallback: string): string {
  if (!path) return fallback;
  if (path.startsWith("/") || path.startsWith("http")) return path;
  return signed.get(path) ?? fallback;
}

async function mapProductRecords(records: ProductRecord[]): Promise<Product[]> {
  const imagePaths = records.flatMap((record) => [record.primary_image_url ?? "", ...(record.product_images ?? []).map((image) => image.storage_path)]);
  const sheetPaths = records.map((record) => record.technical_sheet_url ?? "");
  const [signedImages, signedSheets] = await Promise.all([
    signedPathMap("product-images", imagePaths),
    signedPathMap("technical-sheets", sheetPaths),
  ]);

  return records.map((record) => {
    const fallbackImage = `${record.category}-filter`;
    const orderedImages = [...(record.product_images ?? [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.display_order - b.display_order);
    const imageUrls = orderedImages.map((image) => directOrSigned(image.storage_path, signedImages, fallbackImage));
    const vehicleBrands = [...new Set((record.product_vehicle_applications ?? []).map((application) => application.vehicle_models?.vehicle_brands?.name).filter((value): value is string => Boolean(value)))];
    const vehicleModels = [...new Set((record.product_vehicle_applications ?? []).map((application) => application.vehicle_models?.name).filter((value): value is string => Boolean(value)))];
    const engineModels = [...new Set([
      ...(record.product_vehicle_applications ?? []).map((application) => application.engine_models?.model),
      ...(record.product_equipment_applications ?? []).map((application) => application.engine_models?.model),
    ].filter((value): value is string => Boolean(value)))];
    const equipmentTypes = [...new Set((record.product_equipment_applications ?? []).flatMap((application) => [application.equipment_types?.name, `${application.manufacturer} ${application.model}`]).filter((value): value is string => Boolean(value)))];

    return {
      id: record.id,
      slug: record.slug,
      name: record.name,
      partNumber: record.part_number,
      category: categoryLabels[record.category],
      shortDescription: record.short_description,
      description: record.full_description,
      applicationType: applicationLabels[record.application_type],
      vehicleBrands: [...new Set([...vehicleBrands, ...vehicleModels])],
      engineModels,
      equipmentTypes,
      oemNumbers: (record.oem_references ?? []).map((reference) => reference.reference_number),
      image: directOrSigned(record.primary_image_url, signedImages, imageUrls[0] ?? fallbackImage),
      images: imageUrls.length > 0 ? imageUrls : undefined,
      specifications: [...(record.specifications ?? [])].sort((a, b) => a.display_order - b.display_order).map((specification) => ({ label: specification.label, value: [specification.value, specification.unit].filter(Boolean).join(" ") })),
      availability: record.availability,
      featured: record.featured,
      publicationStatus: record.publication_status,
      technicalSheetUrl: record.technical_sheet_url ? directOrSigned(record.technical_sheet_url, signedSheets, "") : undefined,
      seoTitle: record.seo_title ?? undefined,
      seoDescription: record.seo_description ?? undefined,
    };
  });
}

function catalogueError(scope: string, error: { message: string; code?: string }): Error {
  console.error(`[catalogue:${scope}]`, { code: error.code, message: error.message });
  return new Error("The live product catalogue is temporarily unavailable.");
}

export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return mockProducts;
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select(publicProductSelect).eq("publication_status", "published").order("part_number");
  if (error) throw catalogueError("list", error);
  return mapProductRecords((data ?? []) as unknown as ProductRecord[]);
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  if (!isSupabaseConfigured()) return mockProducts.filter((product) => product.featured).slice(0, limit);
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select(publicProductSelect).eq("publication_status", "published").eq("featured", true).order("updated_at", { ascending: false }).limit(limit);
  if (error) throw catalogueError("featured", error);
  return mapProductRecords((data ?? []) as unknown as ProductRecord[]);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  if (!isSupabaseConfigured()) return mockProducts.find((product) => product.slug === slug);
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select(publicProductSelect).eq("slug", slug).eq("publication_status", "published").maybeSingle();
  if (error) throw catalogueError("detail", error);
  if (!data) return undefined;
  return (await mapProductRecords([data as unknown as ProductRecord]))[0];
}

export async function getRelatedProducts(product: Product, limit = 3): Promise<Product[]> {
  const allProducts = await getProducts();
  return allProducts.filter((candidate) => candidate.id !== product.id && candidate.category === product.category).slice(0, limit);
}

function normalizedReference(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export async function searchProducts(query: string, limit = 48): Promise<Product[]> {
  const cleanQuery = query.trim().slice(0, 120);
  if (!cleanQuery) return getProducts();

  if (!isSupabaseConfigured()) {
    const normalized = cleanQuery.toLowerCase();
    const reference = normalizedReference(cleanQuery);
    return mockProducts.filter((product) => {
      const textual = [product.name, product.shortDescription, ...product.vehicleBrands, ...product.engineModels, ...product.equipmentTypes].join(" ").toLowerCase();
      const references = [product.partNumber, ...product.oemNumbers].some((value) => normalizedReference(value).includes(reference));
      return textual.includes(normalized) || references;
    }).slice(0, limit);
  }

  const supabase = await createClient();
  const { data: matches, error: searchError } = await supabase.rpc("search_published_products", {
    search_term: cleanQuery,
    result_limit: Math.min(Math.max(limit, 1), 100),
    result_offset: 0,
  });
  if (searchError) throw catalogueError("search", searchError);
  const ids = ((matches ?? []) as { product_id: string }[]).map((match) => match.product_id);
  if (ids.length === 0) return [];

  const { data, error } = await supabase.from("products").select(publicProductSelect).in("id", ids).eq("publication_status", "published");
  if (error) throw catalogueError("search-results", error);
  const products = await mapProductRecords((data ?? []) as unknown as ProductRecord[]);
  const rank = new Map(ids.map((id, index) => [id, index]));
  return products.sort((a, b) => (rank.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (rank.get(b.id) ?? Number.MAX_SAFE_INTEGER));
}
