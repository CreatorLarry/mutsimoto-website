import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { AdminProductOption } from "@/types/catalogue-admin";

interface ProductOptionRecord {
  id: string;
  name: string;
  part_number: string;
  slug: string;
  publication_status: AdminProductOption["publicationStatus"];
}

export async function getAdminProductOptions(): Promise<AdminProductOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, part_number, slug, publication_status")
    .order("name");

  if (error) throw new Error("Unable to load the product list.");
  return ((data ?? []) as ProductOptionRecord[]).map((product) => ({
    id: product.id,
    name: product.name,
    partNumber: product.part_number,
    slug: product.slug,
    publicationStatus: product.publication_status,
  }));
}
