import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { enquirySchema } from "@/lib/validation/enquiry";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured, isSupabaseSecretConfigured } from "@/lib/supabase/env";

const sessionCookie = "mmc_catalogue_session";

function normalizeReference(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured() || !isSupabaseSecretConfigured()) {
    return NextResponse.json({ message: "The enquiry service is not connected yet. Please contact Mutsimoto directly." }, { status: 503 });
  }

  const sessionId = request.cookies.get(sessionCookie)?.value ?? randomUUID();
  const limit = checkRateLimit(`enquiry:${sessionId}`, 5, 10 * 60_000);
  if (!limit.allowed) return NextResponse.json({ message: "Too many enquiries were submitted. Please try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "The enquiry could not be read." }, { status: 400 });
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Check the enquiry information." }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ enquiryNumber: "RECEIVED" });

  const admin = createAdminClient();
  let productId: string | null = null;
  let branchId: string | null = null;

  if (parsed.data.partNumber) {
    const { data: product } = await admin.from("products").select("id").eq("part_number_normalized", normalizeReference(parsed.data.partNumber)).eq("publication_status", "published").maybeSingle();
    productId = product ? String(product.id) : null;
  }
  if (parsed.data.branchSlug) {
    const { data: branch } = await admin.from("branches").select("id").eq("slug", parsed.data.branchSlug).eq("active", true).maybeSingle();
    branchId = branch ? String(branch.id) : null;
  }

  const { data, error } = await admin.from("enquiries").insert({
    customer_name: parsed.data.name,
    company_name: parsed.data.company || null,
    email: parsed.data.email,
    phone: parsed.data.phone,
    product_id: productId,
    quantity: parsed.data.quantity ?? null,
    branch_id: branchId,
    message: `${parsed.data.subject}\n\n${parsed.data.message}`,
    source: `website:${parsed.data.type}`,
  }).select("enquiry_number").single();

  if (error || !data) {
    console.error("[api:enquiry-create]", { code: error?.code, message: error?.message });
    return NextResponse.json({ message: "The enquiry could not be sent. Please contact Mutsimoto directly." }, { status: 500 });
  }

  const response = NextResponse.json({ enquiryNumber: String(data.enquiry_number) }, { status: 201 });
  if (!request.cookies.has(sessionCookie)) response.cookies.set(sessionCookie, sessionId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 365, path: "/" });
  return response;
}

