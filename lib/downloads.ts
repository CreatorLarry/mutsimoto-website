import "server-only";

import { downloads as mockDownloads } from "@/data/downloads";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { DownloadResource } from "@/types";

interface DownloadRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  storage_path: string;
  file_type: string;
  file_size: number | string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
}

export async function getDownloads(): Promise<DownloadResource[]> {
  if (!isSupabaseConfigured()) return mockDownloads;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("downloads")
    .select("id, title, description, category, storage_path, file_type, file_size")
    .eq("published", true)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[downloads:list]", { code: error.code, message: error.message });
    return mockDownloads;
  }

  return ((data ?? []) as DownloadRecord[]).map((download) => ({
    id: download.id,
    title: download.title,
    description: download.description,
    category: download.category,
    type: download.file_type === "application/pdf" ? "PDF" : download.file_type,
    fileSize: formatFileSize(Number(download.file_size)),
    actionUrl: `/api/downloads/${download.id}`,
    available: true,
  }));
}
