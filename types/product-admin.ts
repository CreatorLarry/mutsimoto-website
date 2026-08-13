import type { ProductCategoryKey } from "@/types/categories";

export const productAvailabilityOptions = [
  "In stock",
  "Available to order",
  "Limited stock",
  "Contact for availability",
  "Out of stock",
] as const;

export const productPublicationStatuses = [
  "draft",
  "review",
  "published",
  "archived",
] as const;

export type ProductAvailability = (typeof productAvailabilityOptions)[number];
export type ProductPublicationStatus = (typeof productPublicationStatuses)[number];

export interface AdminProductListItem {
  id: string;
  name: string;
  partNumber: string;
  category: ProductCategoryKey;
  publicationStatus: ProductPublicationStatus;
  availability: string;
  featured: boolean;
  updatedAt: string;
}

export interface AdminProductFormValues {
  id?: string;
  name: string;
  slug: string;
  partNumber: string;
  category: ProductCategoryKey;
  shortDescription: string;
  fullDescription: string;
  applicationType: "automotive" | "industrial" | "both";
  availability: string;
  featured: boolean;
  publicationStatus: ProductPublicationStatus;
  seoTitle: string;
  seoDescription: string;
  specifications: string;
  references: string;
  vehicleApplications: string;
  equipmentApplications: string;
  imageAlt: string;
  primaryImagePath: string | null;
}
