import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { AdminDownload } from "@/types/content-admin";

interface DownloadRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  storage_path: string;
  file_type: string;
  file_size: number | string;
  published: boolean;
  download_count: number | string;
  created_at: string;
  updated_at: string;
}

export async function getAdminDownloads(options: { query?: string; status?: string; category?: string } = {}): Promise<AdminDownload[]> {
  const supabase = await createClient();
  let request = supabase
    .from("downloads")
    .select("id, title, description, category, storage_path, file_type, file_size, published, download_count, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (options.status === "published") request = request.eq("published", true);
  if (options.status === "draft") request = request.eq("published", false);
  const { data, error } = await request;
  if (error) throw new Error("Unable to load download records.");

  const query = options.query?.trim().toLowerCase();
  const category = options.category?.trim().toLowerCase();
  return ((data ?? []) as DownloadRecord[])
    .map((download) => ({
      id: download.id,
      title: download.title,
      description: download.description,
      category: download.category,
      storagePath: download.storage_path,
      publicUrl: supabase.storage.from("catalogues").getPublicUrl(download.storage_path).data.publicUrl,
      fileType: download.file_type,
      fileSize: Number(download.file_size),
      published: download.published,
      downloadCount: Number(download.download_count),
      createdAt: download.created_at,
      updatedAt: download.updated_at,
    }))
    .filter((download) => !category || download.category.toLowerCase() === category)
    .filter((download) => !query || `${download.title} ${download.description} ${download.category} ${download.storagePath}`.toLowerCase().includes(query));
}

export async function getDownloadCategories(): Promise<string[]> {
  const downloads = await getAdminDownloads();
  return [...new Set(downloads.map((download) => download.category))].sort((left, right) => left.localeCompare(right));
}
