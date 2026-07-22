import { z } from "zod";

const optionalCoordinate = (minimum: number, maximum: number, label: string) => z.preprocess(
  (value) => value === "" || value === null || value === undefined ? undefined : Number(value),
  z.number().min(minimum, `${label} is outside its valid range.`).max(maximum, `${label} is outside its valid range.`).optional(),
);

export const branchSchema = z.object({
  branchId: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Enter the branch name.").max(140),
  slug: z.string().trim().max(160).refine((value) => !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value), "Use lowercase letters, numbers, and hyphens for the slug."),
  address: z.string().trim().min(3, "Enter the street address.").max(240),
  city: z.string().trim().min(2, "Enter the city.").max(100),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(40),
  whatsapp: z.string().trim().max(40),
  email: z.string().trim().email("Enter a valid email address.").max(180),
  openingHours: z.string().trim().min(3, "Enter the opening hours.").max(500),
  latitude: optionalCoordinate(-90, 90, "Latitude"),
  longitude: optionalCoordinate(-180, 180, "Longitude"),
  active: z.boolean(),
});

export const branchStatusSchema = z.object({
  branchId: z.string().uuid(),
  active: z.enum(["true", "false"]).transform((value) => value === "true"),
});

export const branchDeleteSchema = z.object({ branchId: z.string().uuid() });

export const downloadSchema = z.object({
  downloadId: z.string().uuid().optional(),
  title: z.string().trim().min(3, "Enter the document title.").max(180),
  description: z.string().trim().min(10, "Add a short document description.").max(1000),
  category: z.string().trim().min(2, "Enter a document category.").max(100),
  published: z.boolean(),
});

export const downloadStatusSchema = z.object({
  downloadId: z.string().uuid(),
  published: z.enum(["true", "false"]).transform((value) => value === "true"),
});

export const downloadDeleteSchema = z.object({ downloadId: z.string().uuid() });

export type BranchInput = z.infer<typeof branchSchema>;
export type DownloadInput = z.infer<typeof downloadSchema>;

export function branchFormData(formData: FormData): BranchInput {
  return branchSchema.parse({
    branchId: formData.get("branchId") || undefined,
    name: formData.get("name"),
    slug: formData.get("slug") ?? "",
    address: formData.get("address"),
    city: formData.get("city"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp") ?? "",
    email: formData.get("email"),
    openingHours: formData.get("openingHours"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    active: formData.get("active") === "on",
  });
}

export function downloadFormData(formData: FormData): DownloadInput {
  return downloadSchema.parse({
    downloadId: formData.get("downloadId") || undefined,
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    published: formData.get("published") === "on",
  });
}
