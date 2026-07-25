import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseSecretConfigured } from "@/lib/supabase/env";

export const leadershipImageBucket = "leadership-images";
export const leadershipImageMaxSize = 5 * 1024 * 1024;
export const leadershipImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export function leadershipImagePath(leadershipId: string): string {
  return `leadership/${leadershipId}/portrait`;
}

export async function getLeadershipImageUrl(
  storagePath: string | null,
): Promise<string | null> {
  if (!storagePath || !isSupabaseSecretConfigured()) return null;

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(leadershipImageBucket)
    .createSignedUrl(storagePath, 60 * 60);

  if (error || !data?.signedUrl) {
    console.error("[leadership:image-url]", {
      message: error?.message ?? "Signed image URL was not returned.",
    });
    return null;
  }

  return data.signedUrl;
}
