export type FilterCategory = "Oil Filters" | "Fuel Filters" | "Air Filters";

export type ApplicationType = "Automotive" | "Industrial";

export type Availability = "In stock" | "Contact for availability";

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  partNumber: string;
  category: FilterCategory;
  shortDescription: string;
  description: string;
  applicationType: ApplicationType;
  vehicleBrands: string[];
  engineModels: string[];
  equipmentTypes: string[];
  oemNumbers: string[];
  image: string;
  images?: string[];
  specifications: ProductSpecification[];
  availability: Availability;
  featured?: boolean;
}

export interface Category {
  id: string;
  name: FilterCategory;
  slug: string;
  description: string;
  image: string;
}

export interface Application {
  id: string;
  name: string;
  group: "Automotive" | "Commercial" | "Construction" | "Agriculture" | "Industrial" | "Power generation";
  description: string;
  equipmentTypes: string[];
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  phone: string;
  email: string;
  openingHours: string;
  directionsUrl: string;
  whatsappUrl: string;
}

export interface DownloadResource {
  id: string;
  title: string;
  description: string;
  type: string;
  fileSize: string;
  requestUrl: string;
}
