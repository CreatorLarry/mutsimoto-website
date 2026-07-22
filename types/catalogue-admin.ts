export type AdminReferenceType = "oem" | "competitor" | "alternative";
export type AdminApplicationKind = "vehicle" | "equipment";

export interface AdminProductOption {
  id: string;
  name: string;
  partNumber: string;
  slug: string;
  publicationStatus: "draft" | "review" | "published" | "archived";
}

export interface AdminVehicleApplication {
  id: string;
  kind: "vehicle";
  product: AdminProductOption;
  brand: string;
  model: string;
  engine: string | null;
  yearFrom: number | null;
  yearTo: number | null;
  notes: string | null;
}

export interface AdminEquipmentApplication {
  id: string;
  kind: "equipment";
  product: AdminProductOption;
  equipmentType: string;
  industry: string;
  manufacturer: string;
  model: string;
  engine: string | null;
  notes: string | null;
}

export type AdminApplication = AdminVehicleApplication | AdminEquipmentApplication;

export interface AdminReference {
  id: string;
  product: AdminProductOption;
  referenceType: AdminReferenceType;
  manufacturer: string;
  referenceNumber: string;
}
