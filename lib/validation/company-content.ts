import { z } from "zod";

const title = z.string().trim().min(3, "Add a section title.").max(180);
const body = z.string().trim().min(20, "Add a little more detail to this section.").max(5000);

export const aboutContentSchema = z.object({
  eyebrow: z.string().trim().min(2).max(100),
  title,
  summary: z.string().trim().min(20).max(500),
  overviewTitle: title,
  overviewBody: body,
  expertiseTitle: title,
  expertiseBody: body,
  oilFilterTitle: title,
  oilFilterBody: body,
  fuelFilterTitle: title,
  fuelFilterBody: body,
  airFilterTitle: title,
  airFilterBody: body,
  missionTitle: title,
  missionBody: body,
  visionTitle: title,
  visionBody: body,
  qualityTitle: title,
  qualityBody: body,
  published: z.boolean(),
});

const displayOrder = z.preprocess(
  (value) => value === "" || value === null || value === undefined ? 0 : Number(value),
  z.number().int().min(0).max(1000),
);

export const leadershipSchema = z.object({
  leadershipId: z.string().uuid().optional(),
  fullName: z.string().trim().min(2, "Enter the leader's name.").max(160),
  title: z.string().trim().min(2, "Enter the leadership title.").max(160),
  biography: z.string().trim().min(30, "Add a more complete biography.").max(5000),
  message: z.string().trim().max(3000),
  displayOrder,
  published: z.boolean(),
});

export const leadershipStatusSchema = z.object({
  leadershipId: z.string().uuid(),
  published: z.enum(["true", "false"]).transform((value) => value === "true"),
});

export const leadershipDeleteSchema = z.object({ leadershipId: z.string().uuid() });

export type AboutContentInput = z.infer<typeof aboutContentSchema>;
export type LeadershipInput = z.infer<typeof leadershipSchema>;

export function aboutContentFormData(formData: FormData): AboutContentInput {
  return aboutContentSchema.parse({
    eyebrow: formData.get("eyebrow"),
    title: formData.get("title"),
    summary: formData.get("summary"),
    overviewTitle: formData.get("overviewTitle"),
    overviewBody: formData.get("overviewBody"),
    expertiseTitle: formData.get("expertiseTitle"),
    expertiseBody: formData.get("expertiseBody"),
    oilFilterTitle: formData.get("oilFilterTitle"),
    oilFilterBody: formData.get("oilFilterBody"),
    fuelFilterTitle: formData.get("fuelFilterTitle"),
    fuelFilterBody: formData.get("fuelFilterBody"),
    airFilterTitle: formData.get("airFilterTitle"),
    airFilterBody: formData.get("airFilterBody"),
    missionTitle: formData.get("missionTitle"),
    missionBody: formData.get("missionBody"),
    visionTitle: formData.get("visionTitle"),
    visionBody: formData.get("visionBody"),
    qualityTitle: formData.get("qualityTitle"),
    qualityBody: formData.get("qualityBody"),
    published: formData.get("published") === "on",
  });
}

export function leadershipFormData(formData: FormData): LeadershipInput {
  return leadershipSchema.parse({
    leadershipId: formData.get("leadershipId") || undefined,
    fullName: formData.get("fullName"),
    title: formData.get("leadershipTitle"),
    biography: formData.get("biography"),
    message: formData.get("message") ?? "",
    displayOrder: formData.get("displayOrder"),
    published: formData.get("published") === "on",
  });
}
