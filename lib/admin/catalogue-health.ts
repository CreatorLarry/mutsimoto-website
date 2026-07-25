import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface CatalogueSchemaHealth {
  ready: boolean;
  message?: string;
}

const legacyCategories = new Set(["oil", "fuel", "air"]);

export async function getCatalogueSchemaHealth(): Promise<CatalogueSchemaHealth> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("category").limit(100);

  if (error) {
    console.error("[admin:catalogue-schema-health]", { code: error.code, message: error.message });
    return {
      ready: false,
      message: "The catalogue database connection could not be verified. Refresh the page before saving.",
    };
  }

  const hasLegacyCategory = (data ?? []).some((product) =>
    legacyCategories.has(String(product.category)),
  );

  if (hasLegacyCategory) {
    return {
      ready: false,
      message:
        "The connected database still uses the previous Oil, Fuel, and Air categories. Apply the latest catalogue integration migration in Supabase, then refresh this page.",
    };
  }

  return { ready: true };
}
