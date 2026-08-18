import type { ProductCategoryKey } from "@/types/categories";

export type ProductImportIssueSeverity = "error" | "warning";

export interface ProductImportIssue {
  severity: ProductImportIssueSeverity;
  sheet: string;
  row: number | null;
  field: string | null;
  message: string;
  partNumber?: string;
}

export interface ImportedSpecification {
  label: string;
  value: string;
  unit: string | null;
  displayOrder: number;
}

export interface ImportedReference {
  referenceType: "oem" | "competitor" | "alternative";
  manufacturer: string;
  referenceNumber: string;
}

export interface ImportedVehicleApplication {
  brand: string;
  model: string;
  engineManufacturer: string;
  engineModel: string | null;
  yearFrom: number | null;
  yearTo: number | null;
  notes: string | null;
}

export interface ImportedEquipmentApplication {
  equipmentType: string;
  industry: string;
  manufacturer: string;
  model: string;
  engineManufacturer: string;
  engineModel: string | null;
  notes: string | null;
}

export interface ImportedImageManifestItem {
  filename: string;
  altText: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface ImportedProduct {
  sourceRow: number;
  partNumber: string;
  normalizedPartNumber: string;
  name: string;
  category: ProductCategoryKey;
  applicationType: "automotive" | "industrial" | "both";
  availability: string;
  featured: boolean;
  shortDescription: string;
  fullDescription: string;
  seoTitle: string;
  seoDescription: string;
  technicalSheetFilename: string | null;
  specifications: ImportedSpecification[];
  references: ImportedReference[];
  vehicleApplications: ImportedVehicleApplication[];
  equipmentApplications: ImportedEquipmentApplication[];
  images: ImportedImageManifestItem[];
}

export interface ProductImportTotals {
  products: number;
  specifications: number;
  references: number;
  vehicleApplications: number;
  equipmentApplications: number;
  images: number;
  technicalSheets: number;
}

export interface ParsedProductWorkbook {
  products: ImportedProduct[];
  issues: ProductImportIssue[];
  totals: ProductImportTotals;
}

export interface ProductImportSample {
  partNumber: string;
  name: string;
  category: ProductCategoryKey;
  applicationType: ImportedProduct["applicationType"];
  specifications: number;
  references: number;
  applications: number;
  mediaFiles: number;
}

export interface ProductImportPreview {
  fileName: string;
  valid: boolean;
  totals: ProductImportTotals;
  errorCount: number;
  warningCount: number;
  issues: ProductImportIssue[];
  hiddenIssueCount: number;
  sampleProducts: ProductImportSample[];
}

export interface ProductImportFailure {
  partNumber: string;
  name: string;
  message: string;
}

export interface ProductImportCommitResult {
  created: number;
  updated: number;
  failed: ProductImportFailure[];
  mediaPending: {
    images: number;
    technicalSheets: number;
  };
  progress: {
    processed: number;
    total: number;
    nextOffset: number | null;
    complete: boolean;
  };
}
