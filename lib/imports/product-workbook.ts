import * as XLSX from "@e965/xlsx";
import {
  productCategoryOptions,
  type ProductCategoryKey,
} from "@/types/categories";
import type {
  ImportedEquipmentApplication,
  ImportedImageManifestItem,
  ImportedProduct,
  ImportedReference,
  ImportedSpecification,
  ImportedVehicleApplication,
  ParsedProductWorkbook,
  ProductImportIssue,
  ProductImportPreview,
  ProductImportTotals,
} from "@/types/product-import";

const expectedSheets = [
  "Products",
  "Specifications",
  "References",
  "Vehicle Applications",
  "Equipment Applications",
  "Images",
] as const;

type ExpectedSheet = (typeof expectedSheets)[number];
type RowRecord = Record<string, unknown>;

interface SheetRow {
  rowNumber: number;
  values: RowRecord;
}

const requiredHeaders: Record<ExpectedSheet, readonly string[]> = {
  Products: ["part_number", "name", "category", "application_type"],
  Specifications: ["part_number", "label", "value"],
  References: ["part_number", "reference_type", "reference_number"],
  "Vehicle Applications": ["part_number", "vehicle_brand", "vehicle_model"],
  "Equipment Applications": ["part_number", "equipment_type", "manufacturer", "model"],
  Images: ["part_number", "image_filename", "alt_text"],
};

const categoryByInput = new Map<string, ProductCategoryKey>(
  productCategoryOptions.flatMap((option) => [
    [normalizeChoice(option.value), option.value] as const,
    [normalizeChoice(option.label), option.value] as const,
  ]),
);

export class ProductWorkbookError extends Error {}

function normalizeChoice(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function normalizePartNumber(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function normalizeHeader(value: unknown): string {
  return cellText(value)
    .replace(/\*+$/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function cellText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value).trim();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && "text" in value && typeof value.text === "string") {
    return value.text.trim();
  }
  return String(value).trim();
}

function isBlankRow(row: readonly unknown[]): boolean {
  return row.every((value) => cellText(value) === "");
}

function issue(
  issues: ProductImportIssue[],
  severity: ProductImportIssue["severity"],
  sheet: string,
  row: number | null,
  field: string | null,
  message: string,
  partNumber?: string,
) {
  issues.push({ severity, sheet, row, field, message, ...(partNumber ? { partNumber } : {}) });
}

function workbookRows(
  workbook: XLSX.WorkBook,
  sheetName: ExpectedSheet,
  issues: ProductImportIssue[],
): SheetRow[] {
  const actualName = workbook.SheetNames.find(
    (name) => name.toLowerCase() === sheetName.toLowerCase(),
  );
  if (!actualName) {
    const severity = sheetName === "Products" ? "error" : "warning";
    issue(
      issues,
      severity,
      sheetName,
      null,
      null,
      severity === "error"
        ? "The Products worksheet is missing."
        : `The ${sheetName} worksheet is missing. Its related data will be skipped.`,
    );
    return [];
  }

  const worksheet = workbook.Sheets[actualName];
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    defval: "",
    raw: true,
  }) as unknown[][];
  const headerIndex = matrix
    .slice(0, 12)
    .findIndex((row) => row.some((value) => normalizeHeader(value) === "part_number"));

  if (headerIndex < 0) {
    issue(issues, "error", sheetName, null, null, "No part_number header was found in the first 12 rows.");
    return [];
  }

  const headers = matrix[headerIndex].map(normalizeHeader);
  for (const required of requiredHeaders[sheetName]) {
    if (!headers.includes(required)) {
      issue(
        issues,
        "error",
        sheetName,
        headerIndex + 1,
        required,
        `The required ${required} column is missing.`,
      );
    }
  }

  return matrix
    .slice(headerIndex + 1)
    .map((row, index) => ({ row, rowNumber: headerIndex + index + 2 }))
    .filter(({ row }) => !isBlankRow(row))
    .map(({ row, rowNumber }) => ({
      rowNumber,
      values: Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])),
    }));
}

function requiredText(
  row: SheetRow,
  field: string,
  sheet: string,
  issues: ProductImportIssue[],
  options: { min?: number; max?: number; label?: string; partNumber?: string } = {},
): string {
  const value = cellText(row.values[field]);
  const label = options.label ?? field.replaceAll("_", " ");
  const min = options.min ?? 1;
  const max = options.max ?? 240;
  if (value.length < min) {
    issue(issues, "error", sheet, row.rowNumber, field, `${label} is required.`, options.partNumber);
  } else if (value.length > max) {
    issue(
      issues,
      "error",
      sheet,
      row.rowNumber,
      field,
      `${label} must be ${max} characters or fewer.`,
      options.partNumber,
    );
  }
  return value;
}

function optionalText(
  row: SheetRow,
  field: string,
  sheet: string,
  issues: ProductImportIssue[],
  max: number,
  partNumber?: string,
): string {
  const value = cellText(row.values[field]);
  if (value.length > max) {
    issue(
      issues,
      "error",
      sheet,
      row.rowNumber,
      field,
      `${field.replaceAll("_", " ")} must be ${max} characters or fewer.`,
      partNumber,
    );
  }
  return value;
}

function yesNo(
  row: SheetRow,
  field: string,
  sheet: string,
  issues: ProductImportIssue[],
  defaultValue: boolean,
  partNumber?: string,
): boolean {
  const value = normalizeChoice(cellText(row.values[field]));
  if (!value) return defaultValue;
  if (["yes", "true", "1", "y"].includes(value)) return true;
  if (["no", "false", "0", "n"].includes(value)) return false;
  issue(
    issues,
    "error",
    sheet,
    row.rowNumber,
    field,
    "Use Yes or No.",
    partNumber,
  );
  return defaultValue;
}

function optionalInteger(
  row: SheetRow,
  field: string,
  sheet: string,
  issues: ProductImportIssue[],
  options: {
    min: number;
    max: number;
    defaultValue: number | null;
    partNumber?: string;
  },
): number | null {
  const raw = cellText(row.values[field]);
  if (!raw) return options.defaultValue;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < options.min || value > options.max) {
    issue(
      issues,
      "error",
      sheet,
      row.rowNumber,
      field,
      `Use a whole number from ${options.min} to ${options.max}.`,
      options.partNumber,
    );
    return options.defaultValue;
  }
  return value;
}

function productForRelatedRow(
  row: SheetRow,
  sheet: ExpectedSheet,
  products: Map<string, ImportedProduct>,
  issues: ProductImportIssue[],
): ImportedProduct | null {
  const partNumber = requiredText(row, "part_number", sheet, issues, {
    min: 2,
    max: 100,
    label: "Part number",
  });
  const normalized = normalizePartNumber(partNumber);
  const product = products.get(normalized);
  if (partNumber && !product) {
    issue(
      issues,
      "error",
      sheet,
      row.rowNumber,
      "part_number",
      "This part number does not have a matching row in the Products worksheet.",
      partNumber,
    );
  }
  return product ?? null;
}

function parseProducts(rows: SheetRow[], issues: ProductImportIssue[]): Map<string, ImportedProduct> {
  const products = new Map<string, ImportedProduct>();

  for (const row of rows) {
    const partNumber = requiredText(row, "part_number", "Products", issues, {
      min: 2,
      max: 100,
      label: "Part number",
    });
    const normalizedPartNumber = normalizePartNumber(partNumber);
    const name = requiredText(row, "name", "Products", issues, {
      min: 2,
      max: 160,
      label: "Product name",
      partNumber,
    });
    if (partNumber && !normalizedPartNumber) {
      issue(
        issues,
        "error",
        "Products",
        row.rowNumber,
        "part_number",
        "Part number must contain at least one letter or number.",
        partNumber,
      );
    }

    const categoryInput = requiredText(row, "category", "Products", issues, {
      label: "Category",
      partNumber,
    });
    const category = categoryByInput.get(normalizeChoice(categoryInput));
    if (categoryInput && !category) {
      issue(
        issues,
        "error",
        "Products",
        row.rowNumber,
        "category",
        `Use one of: ${productCategoryOptions.map((option) => option.label).join(", ")}.`,
        partNumber,
      );
    }

    const applicationInput = requiredText(
      row,
      "application_type",
      "Products",
      issues,
      { label: "Application type", partNumber },
    );
    const applicationChoice = normalizeChoice(applicationInput);
    const applicationType =
      applicationChoice === "automotive" ||
      applicationChoice === "industrial" ||
      applicationChoice === "both"
        ? applicationChoice
        : null;
    if (applicationInput && !applicationType) {
      issue(
        issues,
        "error",
        "Products",
        row.rowNumber,
        "application_type",
        "Use Automotive, Industrial, or Both.",
        partNumber,
      );
    }

    const availability =
      optionalText(row, "availability", "Products", issues, 100, partNumber) ||
      "Contact for availability";
    const shortDescription = optionalText(
      row,
      "short_description",
      "Products",
      issues,
      320,
      partNumber,
    );
    if (shortDescription && shortDescription.length < 10) {
      issue(
        issues,
        "error",
        "Products",
        row.rowNumber,
        "short_description",
        "Short description must use at least 10 characters or be left blank.",
        partNumber,
      );
    }
    const fullDescription = optionalText(
      row,
      "full_description",
      "Products",
      issues,
      5000,
      partNumber,
    );
    if (fullDescription && fullDescription.length < 20) {
      issue(
        issues,
        "error",
        "Products",
        row.rowNumber,
        "full_description",
        "Full description must use at least 20 characters or be left blank.",
        partNumber,
      );
    }

    const technicalSheetFilename = optionalText(
      row,
      "technical_sheet_filename",
      "Products",
      issues,
      240,
      partNumber,
    );
    if (technicalSheetFilename && !technicalSheetFilename.toLowerCase().endsWith(".pdf")) {
      issue(
        issues,
        "error",
        "Products",
        row.rowNumber,
        "technical_sheet_filename",
        "Technical sheet filenames must end in .pdf.",
        partNumber,
      );
    }

    if (normalizedPartNumber && products.has(normalizedPartNumber)) {
      issue(
        issues,
        "error",
        "Products",
        row.rowNumber,
        "part_number",
        "This part number is duplicated. Spaces and punctuation do not make it unique.",
        partNumber,
      );
      continue;
    }

    if (!partNumber || !normalizedPartNumber || !name || !category || !applicationType) continue;
    products.set(normalizedPartNumber, {
      sourceRow: row.rowNumber,
      partNumber,
      normalizedPartNumber,
      name,
      category,
      applicationType,
      availability,
      featured: yesNo(row, "featured", "Products", issues, false, partNumber),
      shortDescription,
      fullDescription,
      seoTitle: optionalText(row, "seo_title", "Products", issues, 160, partNumber),
      seoDescription: optionalText(
        row,
        "seo_description",
        "Products",
        issues,
        320,
        partNumber,
      ),
      technicalSheetFilename: technicalSheetFilename || null,
      specifications: [],
      references: [],
      vehicleApplications: [],
      equipmentApplications: [],
      images: [],
    });
  }

  return products;
}

function parseSpecifications(
  rows: SheetRow[],
  products: Map<string, ImportedProduct>,
  issues: ProductImportIssue[],
) {
  const seen = new Set<string>();
  rows.forEach((row, index) => {
    const product = productForRelatedRow(row, "Specifications", products, issues);
    if (!product) return;
    const label = requiredText(row, "label", "Specifications", issues, {
      max: 120,
      partNumber: product.partNumber,
    });
    const value = requiredText(row, "value", "Specifications", issues, {
      max: 240,
      partNumber: product.partNumber,
    });
    const unit = optionalText(
      row,
      "unit",
      "Specifications",
      issues,
      60,
      product.partNumber,
    );
    const displayOrder =
      optionalInteger(row, "display_order", "Specifications", issues, {
        min: 0,
        max: 10000,
        defaultValue: index,
        partNumber: product.partNumber,
      }) ?? index;
    const key = `${product.normalizedPartNumber}:${normalizeChoice(label)}`;
    if (label && seen.has(key)) {
      issue(
        issues,
        "error",
        "Specifications",
        row.rowNumber,
        "label",
        "This specification label is duplicated for the product.",
        product.partNumber,
      );
      return;
    }
    if (label) seen.add(key);
    if (label && value) {
      const specification: ImportedSpecification = {
        label,
        value,
        unit: unit || null,
        displayOrder,
      };
      product.specifications.push(specification);
    }
  });
}

function parseReferences(
  rows: SheetRow[],
  products: Map<string, ImportedProduct>,
  issues: ProductImportIssue[],
) {
  const seen = new Set<string>();
  rows.forEach((row) => {
    const product = productForRelatedRow(row, "References", products, issues);
    if (!product) return;
    const input = requiredText(row, "reference_type", "References", issues, {
      label: "Reference type",
      partNumber: product.partNumber,
    });
    const choice = normalizeChoice(input);
    const referenceType =
      choice === "oem" || choice === "competitor" || choice === "alternative"
        ? choice
        : null;
    if (input && !referenceType) {
      issue(
        issues,
        "error",
        "References",
        row.rowNumber,
        "reference_type",
        "Use OEM, Competitor, or Alternative.",
        product.partNumber,
      );
    }
    const manufacturer =
      optionalText(row, "manufacturer", "References", issues, 160, product.partNumber) ||
      "Unspecified";
    const referenceNumber = requiredText(row, "reference_number", "References", issues, {
      max: 160,
      label: "Reference number",
      partNumber: product.partNumber,
    });
    const key = `${product.normalizedPartNumber}:${referenceType}:${normalizePartNumber(referenceNumber)}`;
    if (referenceNumber && seen.has(key)) {
      issue(
        issues,
        "error",
        "References",
        row.rowNumber,
        "reference_number",
        "This reference number and type are duplicated for the product.",
        product.partNumber,
      );
      return;
    }
    if (referenceNumber) seen.add(key);
    if (referenceType && referenceNumber) {
      const reference: ImportedReference = {
        referenceType,
        manufacturer,
        referenceNumber,
      };
      product.references.push(reference);
    }
  });
}

function parseVehicleApplications(
  rows: SheetRow[],
  products: Map<string, ImportedProduct>,
  issues: ProductImportIssue[],
) {
  rows.forEach((row) => {
    const product = productForRelatedRow(row, "Vehicle Applications", products, issues);
    if (!product) return;
    const brand = requiredText(row, "vehicle_brand", "Vehicle Applications", issues, {
      max: 160,
      label: "Vehicle brand",
      partNumber: product.partNumber,
    });
    const model = requiredText(row, "vehicle_model", "Vehicle Applications", issues, {
      max: 160,
      label: "Vehicle model",
      partNumber: product.partNumber,
    });
    const engineManufacturer =
      optionalText(
        row,
        "engine_manufacturer",
        "Vehicle Applications",
        issues,
        160,
        product.partNumber,
      ) || brand;
    const engineModel =
      optionalText(
        row,
        "engine_model",
        "Vehicle Applications",
        issues,
        160,
        product.partNumber,
      ) || null;
    const yearFrom = optionalInteger(row, "year_from", "Vehicle Applications", issues, {
      min: 1900,
      max: 2200,
      defaultValue: null,
      partNumber: product.partNumber,
    });
    const yearTo = optionalInteger(row, "year_to", "Vehicle Applications", issues, {
      min: 1900,
      max: 2200,
      defaultValue: null,
      partNumber: product.partNumber,
    });
    if (yearFrom && yearTo && yearFrom > yearTo) {
      issue(
        issues,
        "error",
        "Vehicle Applications",
        row.rowNumber,
        "year_to",
        "End year cannot be before start year.",
        product.partNumber,
      );
    }
    if (brand && model) {
      const application: ImportedVehicleApplication = {
        brand,
        model,
        engineManufacturer,
        engineModel,
        yearFrom,
        yearTo,
        notes:
          optionalText(
            row,
            "notes",
            "Vehicle Applications",
            issues,
            1000,
            product.partNumber,
          ) || null,
      };
      product.vehicleApplications.push(application);
    }
  });
}

function parseEquipmentApplications(
  rows: SheetRow[],
  products: Map<string, ImportedProduct>,
  issues: ProductImportIssue[],
) {
  rows.forEach((row) => {
    const product = productForRelatedRow(row, "Equipment Applications", products, issues);
    if (!product) return;
    const equipmentType = requiredText(
      row,
      "equipment_type",
      "Equipment Applications",
      issues,
      { max: 160, label: "Equipment type", partNumber: product.partNumber },
    );
    const manufacturer = requiredText(
      row,
      "manufacturer",
      "Equipment Applications",
      issues,
      { max: 160, partNumber: product.partNumber },
    );
    const model = requiredText(row, "model", "Equipment Applications", issues, {
      max: 160,
      partNumber: product.partNumber,
    });
    const industry =
      optionalText(
        row,
        "industry",
        "Equipment Applications",
        issues,
        160,
        product.partNumber,
      ) || "General";
    const engineManufacturer =
      optionalText(
        row,
        "engine_manufacturer",
        "Equipment Applications",
        issues,
        160,
        product.partNumber,
      ) || manufacturer;
    const engineModel =
      optionalText(
        row,
        "engine_model",
        "Equipment Applications",
        issues,
        160,
        product.partNumber,
      ) || null;
    if (equipmentType && manufacturer && model) {
      const application: ImportedEquipmentApplication = {
        equipmentType,
        industry,
        manufacturer,
        model,
        engineManufacturer,
        engineModel,
        notes:
          optionalText(
            row,
            "notes",
            "Equipment Applications",
            issues,
            1000,
            product.partNumber,
          ) || null,
      };
      product.equipmentApplications.push(application);
    }
  });
}

function parseImages(
  rows: SheetRow[],
  products: Map<string, ImportedProduct>,
  issues: ProductImportIssue[],
) {
  const filenames = new Set<string>();
  rows.forEach((row, index) => {
    const product = productForRelatedRow(row, "Images", products, issues);
    if (!product) return;
    const filename = requiredText(row, "image_filename", "Images", issues, {
      max: 240,
      label: "Image filename",
      partNumber: product.partNumber,
    });
    const extension = filename.split(".").pop()?.toLowerCase() ?? "";
    if (filename && !["jpg", "jpeg", "png", "webp"].includes(extension)) {
      issue(
        issues,
        "error",
        "Images",
        row.rowNumber,
        "image_filename",
        "Use a JPEG, PNG, or WebP filename.",
        product.partNumber,
      );
    }
    const filenameKey = filename.toLowerCase();
    if (filename && filenames.has(filenameKey)) {
      issue(
        issues,
        "error",
        "Images",
        row.rowNumber,
        "image_filename",
        "This image filename is duplicated in the workbook.",
        product.partNumber,
      );
    }
    if (filename) filenames.add(filenameKey);
    const altText = requiredText(row, "alt_text", "Images", issues, {
      min: 3,
      max: 240,
      label: "Alt text",
      partNumber: product.partNumber,
    });
    const displayOrder =
      optionalInteger(row, "display_order", "Images", issues, {
        min: 0,
        max: 10000,
        defaultValue: index,
        partNumber: product.partNumber,
      }) ?? index;
    if (filename && altText) {
      const image: ImportedImageManifestItem = {
        filename,
        altText,
        displayOrder,
        isPrimary: yesNo(row, "is_primary", "Images", issues, false, product.partNumber),
      };
      product.images.push(image);
    }
  });

  for (const product of products.values()) {
    if (product.images.filter((image) => image.isPrimary).length > 1) {
      issue(
        issues,
        "error",
        "Images",
        null,
        "is_primary",
        "Only one image can be marked primary for a product.",
        product.partNumber,
      );
    }
  }
}

function totalsFor(products: ImportedProduct[]): ProductImportTotals {
  return {
    products: products.length,
    specifications: products.reduce((total, product) => total + product.specifications.length, 0),
    references: products.reduce((total, product) => total + product.references.length, 0),
    vehicleApplications: products.reduce(
      (total, product) => total + product.vehicleApplications.length,
      0,
    ),
    equipmentApplications: products.reduce(
      (total, product) => total + product.equipmentApplications.length,
      0,
    ),
    images: products.reduce((total, product) => total + product.images.length, 0),
    technicalSheets: products.filter((product) => product.technicalSheetFilename).length,
  };
}

export function parseProductWorkbook(data: ArrayBuffer): ParsedProductWorkbook {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(new Uint8Array(data), { type: "array" });
  } catch {
    throw new ProductWorkbookError(
      "The workbook could not be opened. Upload a valid .xlsx copy of the Mutsimoto template.",
    );
  }

  const issues: ProductImportIssue[] = [];
  const rows = Object.fromEntries(
    expectedSheets.map((sheetName) => [
      sheetName,
      workbookRows(workbook, sheetName, issues),
    ]),
  ) as Record<ExpectedSheet, SheetRow[]>;
  const productMap = parseProducts(rows.Products, issues);

  if (productMap.size > 2000) {
    issue(
      issues,
      "error",
      "Products",
      null,
      null,
      "A single workbook can contain at most 2,000 products.",
    );
  }

  parseSpecifications(rows.Specifications, productMap, issues);
  parseReferences(rows.References, productMap, issues);
  parseVehicleApplications(rows["Vehicle Applications"], productMap, issues);
  parseEquipmentApplications(rows["Equipment Applications"], productMap, issues);
  parseImages(rows.Images, productMap, issues);

  const products = [...productMap.values()];
  return { products, issues, totals: totalsFor(products) };
}

export function createProductImportPreview(
  fileName: string,
  parsed: ParsedProductWorkbook,
): ProductImportPreview {
  const maxVisibleIssues = 200;
  const errorCount = parsed.issues.filter((item) => item.severity === "error").length;
  const warningCount = parsed.issues.length - errorCount;
  const visibleIssues = parsed.issues.slice(0, maxVisibleIssues);

  return {
    fileName,
    valid: parsed.products.length > 0 && errorCount === 0,
    totals: parsed.totals,
    errorCount,
    warningCount,
    issues: visibleIssues,
    hiddenIssueCount: Math.max(0, parsed.issues.length - visibleIssues.length),
    imageManifest: parsed.products.flatMap((product) =>
      product.images.map((image) => ({
        ...image,
        partNumber: product.partNumber,
        normalizedPartNumber: product.normalizedPartNumber,
        productName: product.name,
      })),
    ),
    sampleProducts: parsed.products.slice(0, 10).map((product) => ({
      partNumber: product.partNumber,
      name: product.name,
      category: product.category,
      applicationType: product.applicationType,
      specifications: product.specifications.length,
      references: product.references.length,
      applications:
        product.vehicleApplications.length + product.equipmentApplications.length,
      mediaFiles: product.images.length + Number(Boolean(product.technicalSheetFilename)),
    })),
  };
}
