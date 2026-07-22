import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseSecretConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const sessionCookie = "mmc_catalogue_session";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.from("downloads").select("id, storage_path, download_count").eq("id", id).eq("published", true).maybeSingle();
  if (error || !data) return NextResponse.redirect(new URL("/downloads?message=Document%20not%20available", request.url));

  const sessionId = request.cookies.get(sessionCookie)?.value ?? randomUUID();
  if (isSupabaseSecretConfigured()) {
    const admin = createAdminClient();
    const [{ error: eventError }, { error: countError }] = await Promise.all([
      admin.from("download_events").insert({ download_id: id, session_id: sessionId }),
      admin.from("downloads").update({ download_count: Number(data.download_count) + 1 }).eq("id", id),
    ]);
    if (eventError) console.error("[analytics:download]", { code: eventError.code, message: eventError.message });
    if (countError) console.error("[analytics:download-count]", { code: countError.code, message: countError.message });
  }

  const publicUrl = supabase.storage.from("catalogues").getPublicUrl(String(data.storage_path)).data.publicUrl;
  const response = NextResponse.redirect(publicUrl);
  if (!request.cookies.has(sessionCookie)) response.cookies.set(sessionCookie, sessionId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 365, path: "/" });
  return response;
}
