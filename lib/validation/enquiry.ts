import { z } from "zod";

export const enquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().max(160).optional().default(""),
  email: z.string().trim().email().max(240),
  phone: z.string().trim().min(7).max(40),
  type: z.enum(["general", "product", "technical", "dealer"]),
  partNumber: z.string().trim().max(100).optional().default(""),
  quantity: z.preprocess(
    (value) => value === "" || value === null || value === undefined || (typeof value === "number" && Number.isNaN(value)) ? undefined : Number(value),
    z.number().int().positive().max(100000).optional(),
  ),
  branchSlug: z.string().trim().max(120).optional().default(""),
  subject: z.string().trim().min(3).max(180),
  message: z.string().trim().min(10).max(5000),
  consent: z.literal(true),
  website: z.string().max(0).optional().default(""),
});
