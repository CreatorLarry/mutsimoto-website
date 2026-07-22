import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured, isSupabaseSecretConfigured } from "@/lib/supabase/env";
import { checkRateLimit } from "@/lib/security/rate-limit";

const viewSchema = z.object({ productId: z.string().uuid() });
const sessionCookie = "mmc_catalogue_session";

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured() || !isSupabaseSecretConfigured()) return new NextResponse(null, { status: 204 });
  const parsed = viewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Invalid product view." }, { status: 400 });

  const sessionId = request.cookies.get(sessionCookie)?.value ?? randomUUID();
  const limit = checkRateLimit(`product-view:${sessionId}:${parsed.data.productId}`, 1, 30_000);
  if (!limit.allowed) return new NextResponse(null, { status: 204 });

  const admin = createAdminClient();
  const { data: product } = await admin.from("products").select("id").eq("id", parsed.data.productId).eq("publication_status", "published").maybeSingle();
  if (!product) return new NextResponse(null, { status: 204 });
  const { error } = await admin.from("product_views").insert({ product_id: parsed.data.productId, session_id: sessionId });
  if (error) console.error("[analytics:product-view]", { code: error.code, message: error.message });

  const response = new NextResponse(null, { status: 204 });
  if (!request.cookies.has(sessionCookie)) response.cookies.set(sessionCookie, sessionId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 365, path: "/" });
  return response;
}
