import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/metadata";
import { getProducts } from "@/lib/products";

const staticRoutes = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/products", changeFrequency: "weekly", priority: 0.9 },
  { path: "/applications", changeFrequency: "monthly", priority: 0.8 },
  { path: "/downloads", changeFrequency: "monthly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/branches", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products: Awaited<ReturnType<typeof getProducts>> = [];

  try {
    products = await getProducts();
  } catch {
    // Keep the core sitemap available if the live catalogue is temporarily unavailable.
  }

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_ORIGIN}${route.path}`,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...products.map((product) => ({
      url: `${SITE_ORIGIN}/products/${product.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}

