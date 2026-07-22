import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { AdminProductFormValues, AdminProductListItem } from "@/types/product-admin";

interface ProductListRecord {
  id: string;
  name: string;
  part_number: string;
  category: AdminProductListItem["category"];
  publication_status: AdminProductListItem["publicationStatus"];
  availability: string;
  featured: boolean;
  updated_at: string;
}

interface SpecificationRecord { label: string; value: string; unit: string | null; display_order: number }
interface ReferenceRecord { reference_type: "oem" | "competitor" | "alternative"; manufacturer: string; reference_number: string }
interface ProductImageRecord { storage_path: string; alt_text: string; is_primary: boolean; display_order: number }
interface VehicleApplicationRecord {
  year_from: number | null;
  year_to: number | null;
  notes: string | null;
  vehicle_models: { name: string; vehicle_brands: { name: string } | null } | null;
  engine_models: { model: string } | null;
}
interface EquipmentApplicationRecord {
  manufacturer: string;
  model: string;
  notes: string | null;
  equipment_types: { name: string; industry: string } | null;
  engine_models: { model: string } | null;
}
interface ProductDetailRecord {
  id: string;
  name: string;
  slug: string;
  part_number: string;
  category: AdminProductFormValues["category"];
  short_description: string;
  full_description: string;
  application_type: AdminProductFormValues["applicationType"];
  availability: string;
  featured: boolean;
  publication_status: AdminProductFormValues["publicationStatus"];
  seo_title: string | null;
  seo_description: string | null;
  primary_image_url: string | null;
  specifications: SpecificationRecord[];
  oem_references: ReferenceRecord[];
  product_images: ProductImageRecord[];
  product_vehicle_applications: VehicleApplicationRecord[];
  product_equipment_applications: EquipmentApplicationRecord[];
}

export async function getAdminProducts(options: { query?: string; status?: string } = {}): Promise<AdminProductListItem[]> {
  const supabase = await createClient();
  let request = supabase
    .from("products")
    .select("id, name, part_number, category, publication_status, availability, featured, updated_at")
    .order("updated_at", { ascending: false });

  const query = options.query?.trim().replace(/[,()%]/g, "");
  if (query) request = request.or(`name.ilike.%${query}%,part_number.ilike.%${query}%`);
  if (["draft", "review", "published", "archived"].includes(options.status ?? "")) {
    request = request.eq("publication_status", options.status as "draft" | "review" | "published" | "archived");
  }

  const { data, error } = await request;
  if (error) throw new Error("Unable to load administration products.");
  return ((data ?? []) as ProductListRecord[]).map((product) => ({
    id: product.id,
    name: product.name,
    partNumber: product.part_number,
    category: product.category,
    publicationStatus: product.publication_status,
    availability: product.availability,
    featured: product.featured,
    updatedAt: product.updated_at,
  }));
}

export async function getAdminProduct(id: string): Promise<AdminProductFormValues | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      id, name, slug, part_number, category, short_description, full_description,
      application_type, availability, featured, publication_status, seo_title,
      seo_description, primary_image_url,
      specifications(label, value, unit, display_order),
      oem_references(reference_type, manufacturer, reference_number),
      product_images(storage_path, alt_text, is_primary, display_order),
      product_vehicle_applications(
        year_from, year_to, notes,
        vehicle_models(name, vehicle_brands(name)),
        engine_models(model)
      ),
      product_equipment_applications(
        manufacturer, model, notes,
        equipment_types(name, industry),
        engine_models(model)
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) return null;
  const product = data as unknown as ProductDetailRecord;
  const primaryImage = [...(product.product_images ?? [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.display_order - b.display_order)[0];

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    partNumber: product.part_number,
    category: product.category,
    shortDescription: product.short_description,
    fullDescription: product.full_description,
    applicationType: product.application_type,
    availability: product.availability,
    featured: product.featured,
    publicationStatus: product.publication_status,
    seoTitle: product.seo_title ?? "",
    seoDescription: product.seo_description ?? "",
    specifications: [...(product.specifications ?? [])].sort((a, b) => a.display_order - b.display_order).map((item) => [item.label, item.value, item.unit ?? ""].join(" | ")).join("\n"),
    references: (product.oem_references ?? []).map((item) => [item.reference_type, item.manufacturer, item.reference_number].join(" | ")).join("\n"),
    vehicleApplications: (product.product_vehicle_applications ?? []).map((item) => [item.vehicle_models?.vehicle_brands?.name ?? "", item.vehicle_models?.name ?? "", item.engine_models?.model ?? "", item.year_from ?? "", item.year_to ?? "", item.notes ?? ""].join(" | ")).join("\n"),
    equipmentApplications: (product.product_equipment_applications ?? []).map((item) => [item.equipment_types?.name ?? "", item.equipment_types?.industry ?? "", item.manufacturer, item.model, item.engine_models?.model ?? "", item.notes ?? ""].join(" | ")).join("\n"),
    imageAlt: primaryImage?.alt_text ?? "",
    primaryImagePath: product.primary_image_url ?? primaryImage?.storage_path ?? null,
  };
}

