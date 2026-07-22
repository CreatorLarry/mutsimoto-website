export interface AdminProductListItem {
  id: string;
  name: string;
  partNumber: string;
  category: "oil" | "fuel" | "air";
  publicationStatus: "draft" | "review" | "published" | "archived";
  availability: string;
  featured: boolean;
  updatedAt: string;
}

export interface AdminProductFormValues {
  id?: string;
  name: string;
  slug: string;
  partNumber: string;
  category: "oil" | "fuel" | "air";
  shortDescription: string;
  fullDescription: string;
  applicationType: "automotive" | "industrial" | "both";
  availability: string;
  featured: boolean;
  publicationStatus: "draft" | "review" | "published" | "archived";
  seoTitle: string;
  seoDescription: string;
  specifications: string;
  references: string;
  vehicleApplications: string;
  equipmentApplications: string;
  imageAlt: string;
  primaryImagePath: string | null;
}

