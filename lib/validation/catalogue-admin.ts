import { z } from "zod";

export const referenceTypes = ["oem", "competitor", "alternative"] as const;
export const applicationKinds = ["vehicle", "equipment"] as const;

const optionalYear = z.preprocess(
  (value) => value === "" || value === null || value === undefined ? undefined : Number(value),
  z.number().int().min(1900, "Years must be 1900 or later.").max(2200, "Years must be 2200 or earlier.").optional(),
);

export const vehicleApplicationSchema = z.object({
  applicationId: z.string().uuid().optional(),
  productId: z.string().uuid("Select a product."),
  brand: z.string().trim().min(1, "Enter a vehicle brand.").max(100),
  model: z.string().trim().min(1, "Enter a vehicle model.").max(120),
  engine: z.string().trim().max(120),
  yearFrom: optionalYear,
  yearTo: optionalYear,
  notes: z.string().trim().max(1000),
}).refine(
  (value) => !value.yearFrom || !value.yearTo || value.yearFrom <= value.yearTo,
  { path: ["yearTo"], message: "The end year cannot be before the start year." },
);

export const equipmentApplicationSchema = z.object({
  applicationId: z.string().uuid().optional(),
  productId: z.string().uuid("Select a product."),
  equipmentType: z.string().trim().min(1, "Enter an equipment type.").max(120),
  industry: z.string().trim().min(1, "Enter an industry.").max(120),
  manufacturer: z.string().trim().min(1, "Enter a manufacturer.").max(120),
  model: z.string().trim().min(1, "Enter an equipment model.").max(120),
  engine: z.string().trim().max(120),
  notes: z.string().trim().max(1000),
});

export const referenceSchema = z.object({
  referenceId: z.string().uuid().optional(),
  productId: z.string().uuid("Select a product."),
  referenceType: z.enum(referenceTypes),
  manufacturer: z.string().trim().min(1, "Enter a manufacturer.").max(120),
  referenceNumber: z.string().trim().min(1, "Enter a reference number.").max(160),
});

export const applicationDeleteSchema = z.object({
  applicationId: z.string().uuid(),
  kind: z.enum(applicationKinds),
});

export const referenceDeleteSchema = z.object({ referenceId: z.string().uuid() });

export type VehicleApplicationInput = z.infer<typeof vehicleApplicationSchema>;
export type EquipmentApplicationInput = z.infer<typeof equipmentApplicationSchema>;
export type ReferenceInput = z.infer<typeof referenceSchema>;

export function vehicleApplicationFormData(formData: FormData): VehicleApplicationInput {
  return vehicleApplicationSchema.parse({
    applicationId: formData.get("applicationId") || undefined,
    productId: formData.get("productId"),
    brand: formData.get("brand"),
    model: formData.get("model"),
    engine: formData.get("engine") ?? "",
    yearFrom: formData.get("yearFrom"),
    yearTo: formData.get("yearTo"),
    notes: formData.get("notes") ?? "",
  });
}

export function equipmentApplicationFormData(formData: FormData): EquipmentApplicationInput {
  return equipmentApplicationSchema.parse({
    applicationId: formData.get("applicationId") || undefined,
    productId: formData.get("productId"),
    equipmentType: formData.get("equipmentType"),
    industry: formData.get("industry"),
    manufacturer: formData.get("manufacturer"),
    model: formData.get("model"),
    engine: formData.get("engine") ?? "",
    notes: formData.get("notes") ?? "",
  });
}

export function referenceFormData(formData: FormData): ReferenceInput {
  return referenceSchema.parse({
    referenceId: formData.get("referenceId") || undefined,
    productId: formData.get("productId"),
    referenceType: formData.get("referenceType"),
    manufacturer: formData.get("manufacturer"),
    referenceNumber: formData.get("referenceNumber"),
  });
}
