import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { AdminProductOption, AdminReference, AdminReferenceType } from "@/types/catalogue-admin";

interface ReferenceRecord {
  id: string;
  reference_type: AdminReferenceType;
  manufacturer: string;
  reference_number: string;
  products: {
    id: string;
    name: string;
    part_number: string;
    slug: string;
    publication_status: AdminProductOption["publicationStatus"];
  } | null;
}

export async function getAdminReferences(options: {
  query?: string;
  type?: string;
  productId?: string;
} = {}): Promise<AdminReference[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("oem_references").select(`
    id, reference_type, manufacturer, reference_number,
    products(id, name, part_number, slug, publication_status)
  `).limit(750);

  if (error) throw new Error("Unable to load cross-reference records.");
  const references = ((data ?? []) as unknown as ReferenceRecord[])
    .filter((item): item is ReferenceRecord & { products: NonNullable<ReferenceRecord["products"]> } => Boolean(item.products))
    .map<AdminReference>((item) => ({
      id: item.id,
      referenceType: item.reference_type,
      manufacturer: item.manufacturer,
      referenceNumber: item.reference_number,
      product: {
        id: item.products.id,
        name: item.products.name,
        partNumber: item.products.part_number,
        slug: item.products.slug,
        publicationStatus: item.products.publication_status,
      },
    }));

  const validTypes: AdminReferenceType[] = ["oem", "competitor", "alternative"];
  const type = validTypes.includes(options.type as AdminReferenceType) ? options.type as AdminReferenceType : null;
  const query = options.query?.trim().toLowerCase();

  return references
    .filter((item) => !type || item.referenceType === type)
    .filter((item) => !options.productId || item.product.id === options.productId)
    .filter((item) => !query || `${item.referenceNumber} ${item.manufacturer} ${item.product.name} ${item.product.partNumber}`.toLowerCase().includes(query))
    .sort((left, right) => left.referenceNumber.localeCompare(right.referenceNumber, undefined, { numeric: true }));
}
