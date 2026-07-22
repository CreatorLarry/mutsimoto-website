import "server-only";

import { defaultAboutContent, mapAboutRecord } from "@/lib/company-content";
import { createClient } from "@/lib/supabase/server";
import type { AdminAboutPageContent, LeadershipProfile } from "@/types/company-content";

interface AboutAdminRecord { id: string; eyebrow: string | null; title: string; summary: string | null; sections: unknown; publication_status: AdminAboutPageContent["publicationStatus"]; updated_at: string }
interface LeadershipRecord { id: string; full_name: string; title: string; biography: string; message: string | null; display_order: number; published: boolean; updated_at: string }

export async function getAdminCompanyContent(): Promise<{ about: AdminAboutPageContent; leadership: LeadershipProfile[] }> {
  const supabase = await createClient();
  const [aboutResult, leadershipResult] = await Promise.all([
    supabase.from("content_pages").select("id, eyebrow, title, summary, sections, publication_status, updated_at").eq("slug", "about").maybeSingle(),
    supabase.from("leadership_profiles").select("id, full_name, title, biography, message, display_order, published, updated_at").order("display_order"),
  ]);
  if (aboutResult.error || leadershipResult.error) throw new Error("Unable to load company content settings.");
  const record = aboutResult.data as AboutAdminRecord | null;
  const about = record ? mapAboutRecord(record) : defaultAboutContent;
  return {
    about: { ...about, id: record?.id ?? null, publicationStatus: record?.publication_status ?? "draft", updatedAt: record?.updated_at ?? null },
    leadership: ((leadershipResult.data ?? []) as LeadershipRecord[]).map((leader) => ({ id: leader.id, fullName: leader.full_name, title: leader.title, biography: leader.biography, message: leader.message, displayOrder: leader.display_order, published: leader.published, updatedAt: leader.updated_at })),
  };
}
