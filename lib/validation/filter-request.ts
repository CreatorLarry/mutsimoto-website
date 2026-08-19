import { z } from "zod";
import { filterRequestKinds } from "@/lib/enquiries/filter-request";

const optionalText = (maximum: number) => z.string().trim().max(maximum).optional().default("");

export const filterRequestSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(120),
  company: optionalText(160),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email address").max(240)]).optional().default(""),
  phone: optionalText(40),
  requestKind: z.enum(filterRequestKinds),
  filterCategory: optionalText(80),
  partNumber: optionalText(120),
  vehicleOrEquipment: optionalText(240),
  engineModel: optionalText(160),
  dimensions: optionalText(500),
  quantity: z.preprocess(
    (value) => value === "" || value === null || value === undefined || (typeof value === "number" && Number.isNaN(value)) ? undefined : Number(value),
    z.number().int().positive().max(100000).optional(),
  ),
  notes: optionalText(4000),
  searchQuery: optionalText(240),
  attachmentPath: optionalText(500),
  consent: z.literal(true),
  website: z.string().max(0).optional().default(""),
}).superRefine((value, context) => {
  if (!value.email && value.phone.trim().length < 7) {
    context.addIssue({ code: "custom", path: ["phone"], message: "Add either a phone number or email address" });
  }
});

export const filterRequestUploadSchema = z.object({
  filename: z.string().trim().min(1).max(240),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  size: z.number().int().positive().max(5 * 1024 * 1024),
});
