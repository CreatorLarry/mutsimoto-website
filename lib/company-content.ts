import "server-only";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { AboutPageContent, LeadershipProfile } from "@/types/company-content";

interface ContentSection { key?: unknown; title?: unknown; body?: unknown }
interface AboutPageRecord { eyebrow: string | null; title: string; summary: string | null; sections: unknown }
interface LeadershipRecord { id: string; full_name: string; title: string; biography: string; message: string | null; display_order: number; published: boolean; updated_at: string }

export const defaultAboutContent: AboutPageContent = {
  eyebrow: "About Mutsimoto",
  title: "A specialist filtration company",
  summary: "We focus only on oil, fuel, and air filtration—bringing automotive and industrial buyers a clear range backed by practical application knowledge.",
  overviewTitle: "Focused expertise. Broader equipment coverage.",
  overviewBody: "Mutsimoto Motor Company supplies filtration products for passenger vehicles, commercial fleets, construction machinery, agriculture, generators, and industrial equipment.\n\nOur catalogue is deliberately focused. By specialising in oil, fuel, and air filters, we make product selection clearer and provide more useful technical support.",
  expertiseTitle: "Application knowledge behind every part number",
  expertiseBody: "Every product family is organised around real application data: Mutsimoto part numbers, OEM cross-references, engines, vehicles, equipment types, dimensions, and service information. This helps workshops, dealers, fleets, and industrial teams identify the right filter with greater confidence.",
  oilFilterTitle: "Oil filters: protecting lubrication systems",
  oilFilterBody: "Oil filters capture wear metals, combustion residue, dust, and other contaminants circulating through engine or hydraulic oil. Reliable filtration helps protect bearings, journals, pumps, and other precision surfaces while supporting stable oil flow throughout the service interval.",
  fuelFilterTitle: "Fuel filters: protecting injection equipment",
  fuelFilterBody: "Fuel filters remove damaging particles and, where designed, separate water before fuel reaches pumps and injectors. This is particularly important for modern diesel systems, where tight tolerances make clean, consistent fuel delivery essential.",
  airFilterTitle: "Air filters: protecting combustion and airflow",
  airFilterBody: "Air filters prevent airborne dust, grit, and debris from entering engines, compressors, and other intake systems. Correct media capacity and sealing help balance engine protection with the airflow required for dependable performance.",
  missionTitle: "Protect the systems that keep business moving",
  missionBody: "To supply reliable filtration products and clear application support for automotive and industrial customers.",
  visionTitle: "Be the region’s most trusted filtration specialist",
  visionBody: "To be a recognised source for confident filter selection, dependable coverage, and responsive technical service.",
  qualityTitle: "Fit, flow, and filtration first",
  qualityBody: "We prioritise product consistency, application accuracy, and specifications that serve real equipment needs.",
};

function sectionMap(value: unknown): Map<string, { title: string; body: string }> {
  if (!Array.isArray(value)) return new Map();
  return new Map(value.flatMap((item): [string, { title: string; body: string }][] => {
    if (!item || typeof item !== "object") return [];
    const section = item as ContentSection;
    if (typeof section.key !== "string" || typeof section.title !== "string" || typeof section.body !== "string") return [];
    return [[section.key, { title: section.title, body: section.body }]];
  }));
}

export function mapAboutRecord(record: AboutPageRecord): AboutPageContent {
  const sections = sectionMap(record.sections);
  const value = (key: keyof AboutPageContent, sectionKey: string, field: "title" | "body") => sections.get(sectionKey)?.[field] ?? defaultAboutContent[key];
  return {
    eyebrow: record.eyebrow ?? defaultAboutContent.eyebrow,
    title: record.title || defaultAboutContent.title,
    summary: record.summary ?? defaultAboutContent.summary,
    overviewTitle: value("overviewTitle", "overview", "title"),
    overviewBody: value("overviewBody", "overview", "body"),
    expertiseTitle: value("expertiseTitle", "expertise", "title"),
    expertiseBody: value("expertiseBody", "expertise", "body"),
    oilFilterTitle: value("oilFilterTitle", "oil_filter", "title"),
    oilFilterBody: value("oilFilterBody", "oil_filter", "body"),
    fuelFilterTitle: value("fuelFilterTitle", "fuel_filter", "title"),
    fuelFilterBody: value("fuelFilterBody", "fuel_filter", "body"),
    airFilterTitle: value("airFilterTitle", "air_filter", "title"),
    airFilterBody: value("airFilterBody", "air_filter", "body"),
    missionTitle: value("missionTitle", "mission", "title"),
    missionBody: value("missionBody", "mission", "body"),
    visionTitle: value("visionTitle", "vision", "title"),
    visionBody: value("visionBody", "vision", "body"),
    qualityTitle: value("qualityTitle", "quality", "title"),
    qualityBody: value("qualityBody", "quality", "body"),
  };
}

function mapLeadership(record: LeadershipRecord): LeadershipProfile {
  return { id: record.id, fullName: record.full_name, title: record.title, biography: record.biography, message: record.message, displayOrder: record.display_order, published: record.published, updatedAt: record.updated_at };
}

export async function getPublicCompanyContent(): Promise<{ about: AboutPageContent; leadership: LeadershipProfile[] }> {
  if (!isSupabaseConfigured()) return { about: defaultAboutContent, leadership: [] };
  const supabase = await createClient();
  const [aboutResult, leadershipResult] = await Promise.all([
    supabase.from("content_pages").select("eyebrow, title, summary, sections").eq("slug", "about").eq("publication_status", "published").maybeSingle(),
    supabase.from("leadership_profiles").select("id, full_name, title, biography, message, display_order, published, updated_at").eq("published", true).order("display_order"),
  ]);
  if (aboutResult.error) console.error("[company:about]", { code: aboutResult.error.code, message: aboutResult.error.message });
  if (leadershipResult.error) console.error("[company:leadership]", { code: leadershipResult.error.code, message: leadershipResult.error.message });
  return {
    about: aboutResult.data ? mapAboutRecord(aboutResult.data as AboutPageRecord) : defaultAboutContent,
    leadership: leadershipResult.error ? [] : ((leadershipResult.data ?? []) as LeadershipRecord[]).map(mapLeadership),
  };
}
