import { z } from "zod";

export const productCategories = ["oil", "fuel", "air"] as const;
export const productApplicationTypes = ["automotive", "industrial", "both"] as const;
export const productPublicationStatuses = ["draft", "review", "published", "archived"] as const;

export const productFormSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  partNumber: z.string().trim().min(2).max(100),
  category: z.enum(productCategories),
  shortDescription: z.string().trim().min(10).max(320),
  fullDescription: z.string().trim().min(20).max(5000),
  applicationType: z.enum(productApplicationTypes),
  availability: z.string().trim().min(2).max(100),
  featured: z.boolean(),
  seoTitle: z.string().trim().max(160),
  seoDescription: z.string().trim().max(320),
  specifications: z.string().max(8000),
  references: z.string().max(8000),
  vehicleApplications: z.string().max(12000),
  equipmentApplications: z.string().max(12000),
  imageAlt: z.string().trim().max(240),
  intent: z.enum(["draft", "review", "publish"]),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;

export interface ParsedSpecification {
  label: string;
  value: string;
  unit: string | null;
  display_order: number;
}

export interface ParsedReference {
  reference_type: "oem" | "competitor" | "alternative";
  manufacturer: string;
  reference_number: string;
}

export interface ParsedVehicleApplication {
  brand: string;
  model: string;
  engine: string | null;
  yearFrom: number | null;
  yearTo: number | null;
  notes: string | null;
}

export interface ParsedEquipmentApplication {
  equipmentType: string;
  industry: string;
  manufacturer: string;
  model: string;
  engine: string | null;
  notes: string | null;
}

function meaningfulLines(value: string): string[] {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

export function parseSpecifications(value: string): ParsedSpecification[] {
  return meaningfulLines(value).map((line, index) => {
    const [label = "", specificationValue = "", unit = ""] = line.split("|").map((part) => part.trim());
    if (!label || !specificationValue) throw new Error(`Specification line ${index + 1} must include a label and value.`);
    return { label, value: specificationValue, unit: unit || null, display_order: index };
  });
}

export function parseReferences(value: string): ParsedReference[] {
  return meaningfulLines(value).map((line, index) => {
    const [type = "", manufacturer = "", referenceNumber = ""] = line.split("|").map((part) => part.trim());
    if (!(["oem", "competitor", "alternative"] as string[]).includes(type) || !referenceNumber) {
      throw new Error(`Reference line ${index + 1} must use: oem, competitor, or alternative | manufacturer | number.`);
    }
    return { reference_type: type as ParsedReference["reference_type"], manufacturer: manufacturer || "Unspecified", reference_number: referenceNumber };
  });
}

function optionalYear(value: string, line: number, label: string): number | null {
  if (!value) return null;
  const year = Number(value);
  if (!Number.isInteger(year) || year < 1900 || year > 2200) throw new Error(`${label} on application line ${line} is invalid.`);
  return year;
}

export function parseVehicleApplications(value: string): ParsedVehicleApplication[] {
  return meaningfulLines(value).map((line, index) => {
    const [brand = "", model = "", engine = "", from = "", to = "", notes = ""] = line.split("|").map((part) => part.trim());
    if (!brand || !model) throw new Error(`Vehicle application line ${index + 1} must include a brand and model.`);
    const yearFrom = optionalYear(from, index + 1, "Start year");
    const yearTo = optionalYear(to, index + 1, "End year");
    if (yearFrom && yearTo && yearFrom > yearTo) throw new Error(`Vehicle application line ${index + 1} has an end year before its start year.`);
    return { brand, model, engine: engine || null, yearFrom, yearTo, notes: notes || null };
  });
}

export function parseEquipmentApplications(value: string): ParsedEquipmentApplication[] {
  return meaningfulLines(value).map((line, index) => {
    const [equipmentType = "", industry = "", manufacturer = "", model = "", engine = "", notes = ""] = line.split("|").map((part) => part.trim());
    if (!equipmentType || !manufacturer || !model) throw new Error(`Equipment application line ${index + 1} must include type, manufacturer, and model.`);
    return { equipmentType, industry: industry || "General", manufacturer, model, engine: engine || null, notes: notes || null };
  });
}

export function productFormData(formData: FormData): ProductFormInput {
  return productFormSchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    partNumber: formData.get("partNumber"),
    category: formData.get("category"),
    shortDescription: formData.get("shortDescription"),
    fullDescription: formData.get("fullDescription"),
    applicationType: formData.get("applicationType"),
    availability: formData.get("availability"),
    featured: formData.get("featured") === "on",
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
    specifications: formData.get("specifications") ?? "",
    references: formData.get("references") ?? "",
    vehicleApplications: formData.get("vehicleApplications") ?? "",
    equipmentApplications: formData.get("equipmentApplications") ?? "",
    imageAlt: formData.get("imageAlt") ?? "",
    intent: formData.get("intent"),
  });
}

