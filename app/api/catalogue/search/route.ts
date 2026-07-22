import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { searchProducts } from "@/lib/products";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured, isSupabaseSecretConfigured } from "@/lib/supabase/env";

const searchSchema = z.string().trim().min(2).max(120);
const sessionCookie = "mmc_catalogue_session";

export async function GET(request: NextRequest) {
  const parsed = searchSchema.safeParse(request.nextUrl.searchParams.get("q") ?? "");
  if (!parsed.success) return NextResponse.json({ products: [], message: "Enter at least two characters." }, { status: 400 });

  const sessionId = request.cookies.get(sessionCookie)?.value ?? randomUUID();
  const rateLimit = checkRateLimit(`search:${sessionId}`, 60, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ products: [], message: "Too many searches. Try again shortly." }, { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } });
  }

  try {
    const products = await searchProducts(parsed.data, 48);
    if (isSupabaseConfigured() && isSupabaseSecretConfigured()) {
      const admin = createAdminClient();
      const { error } = await admin.from("search_events").insert({ query: parsed.data, result_count: products.length, session_id: sessionId });
      if (error) console.error("[analytics:search]", { code: error.code, message: error.message });
    }
    const response = NextResponse.json({ products });
    if (!request.cookies.has(sessionCookie)) response.cookies.set(sessionCookie, sessionId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 365, path: "/" });
    return response;
  } catch (error) {
    console.error("[api:catalogue-search]", error);
    return NextResponse.json({ products: [], message: "Search is temporarily unavailable." }, { status: 503 });
  }
}

