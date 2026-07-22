import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  AdminApplication,
  AdminApplicationKind,
  AdminEquipmentApplication,
  AdminProductOption,
  AdminVehicleApplication,
} from "@/types/catalogue-admin";

interface RelatedProductRecord {
  id: string;
  name: string;
  part_number: string;
  slug: string;
  publication_status: AdminProductOption["publicationStatus"];
}

interface VehicleApplicationRecord {
  id: string;
  year_from: number | null;
  year_to: number | null;
  notes: string | null;
  products: RelatedProductRecord | null;
  vehicle_models: { name: string; vehicle_brands: { name: string } | null } | null;
  engine_models: { model: string } | null;
}

interface EquipmentApplicationRecord {
  id: string;
  manufacturer: string;
  model: string;
  notes: string | null;
  products: RelatedProductRecord | null;
  equipment_types: { name: string; industry: string } | null;
  engine_models: { model: string } | null;
}

function productOption(product: RelatedProductRecord): AdminProductOption {
  return {
    id: product.id,
    name: product.name,
    partNumber: product.part_number,
    slug: product.slug,
    publicationStatus: product.publication_status,
  };
}

function searchable(application: AdminApplication): string {
  const shared = `${application.product.name} ${application.product.partNumber}`;
  if (application.kind === "vehicle") {
    return `${shared} ${application.brand} ${application.model} ${application.engine ?? ""} ${application.notes ?? ""}`.toLowerCase();
  }
  return `${shared} ${application.equipmentType} ${application.industry} ${application.manufacturer} ${application.model} ${application.engine ?? ""} ${application.notes ?? ""}`.toLowerCase();
}

export async function getAdminApplications(options: {
  query?: string;
  kind?: string;
  productId?: string;
} = {}): Promise<AdminApplication[]> {
  const supabase = await createClient();
  const [vehicleResult, equipmentResult] = await Promise.all([
    supabase.from("product_vehicle_applications").select(`
      id, year_from, year_to, notes,
      products(id, name, part_number, slug, publication_status),
      vehicle_models(name, vehicle_brands(name)),
      engine_models(model)
    `).limit(500),
    supabase.from("product_equipment_applications").select(`
      id, manufacturer, model, notes,
      products(id, name, part_number, slug, publication_status),
      equipment_types(name, industry),
      engine_models(model)
    `).limit(500),
  ]);

  if (vehicleResult.error || equipmentResult.error) throw new Error("Unable to load product applications.");

  const vehicles = (vehicleResult.data as unknown as VehicleApplicationRecord[] ?? [])
    .filter((item): item is VehicleApplicationRecord & { products: RelatedProductRecord } => Boolean(item.products))
    .map<AdminVehicleApplication>((item) => ({
      id: item.id,
      kind: "vehicle",
      product: productOption(item.products),
      brand: item.vehicle_models?.vehicle_brands?.name ?? "Unknown brand",
      model: item.vehicle_models?.name ?? "Unknown model",
      engine: item.engine_models?.model ?? null,
      yearFrom: item.year_from,
      yearTo: item.year_to,
      notes: item.notes,
    }));

  const equipment = (equipmentResult.data as unknown as EquipmentApplicationRecord[] ?? [])
    .filter((item): item is EquipmentApplicationRecord & { products: RelatedProductRecord } => Boolean(item.products))
    .map<AdminEquipmentApplication>((item) => ({
      id: item.id,
      kind: "equipment",
      product: productOption(item.products),
      equipmentType: item.equipment_types?.name ?? "General equipment",
      industry: item.equipment_types?.industry ?? "General",
      manufacturer: item.manufacturer,
      model: item.model,
      engine: item.engine_models?.model ?? null,
      notes: item.notes,
    }));

  const kind = (["vehicle", "equipment"] as AdminApplicationKind[]).includes(options.kind as AdminApplicationKind)
    ? options.kind as AdminApplicationKind
    : null;
  const query = options.query?.trim().toLowerCase();

  return [...vehicles, ...equipment]
    .filter((item) => !kind || item.kind === kind)
    .filter((item) => !options.productId || item.product.id === options.productId)
    .filter((item) => !query || searchable(item).includes(query))
    .sort((left, right) => left.product.name.localeCompare(right.product.name));
}
