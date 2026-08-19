import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import {
  createAttachmentMarker,
  filterRequestAttachmentBucket,
  filterRequestKindLabels,
} from "@/lib/enquiries/filter-request";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured, isSupabaseSecretConfigured } from "@/lib/supabase/env";
import { filterRequestSchema } from "@/lib/validation/filter-request";

const sessionCookie = "mmc_catalogue_session";

function normalizeReference(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function addDetail(lines: string[], label: string, value: string | number | undefined) {
  if (value === undefined || String(value).trim().length === 0) return;
  lines.push(`${label}: ${value}`);
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured() || !isSupabaseSecretConfigured()) {
    return NextResponse.json({ message: "The enquiry service is not connected yet. Please contact Mutsimoto directly." }, { status: 503 });
  }

  const sessionId = request.cookies.get(sessionCookie)?.value ?? randomUUID();
  const limit = checkRateLimit(`filter-request:${sessionId}`, 5, 10 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { message: "Too many requests were submitted. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "The request could not be read." }, { status: 400 });
  }

  const parsed = filterRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Check the request information." }, { status: 400 });
  }
  if (parsed.data.website) return NextResponse.json({ enquiryNumber: "RECEIVED" });

  const admin = createAdminClient();
  let productId: string | null = null;
  let verifiedAttachmentPath = "";

  if (parsed.data.partNumber) {
    const { data: product } = await admin
      .from("products")
      .select("id")
      .eq("part_number_normalized", normalizeReference(parsed.data.partNumber))
      .eq("publication_status", "published")
      .maybeSingle();
    productId = product ? String(product.id) : null;
  }

  if (parsed.data.attachmentPath) {
    const allowedPrefix = `incoming/${sessionId}/`;
    if (!parsed.data.attachmentPath.startsWith(allowedPrefix)) {
      return NextResponse.json({ message: "The attached photo could not be verified." }, { status: 400 });
    }
    const { data: fileInfo, error: fileInfoError } = await admin.storage
      .from(filterRequestAttachmentBucket)
      .info(parsed.data.attachmentPath);
    if (fileInfoError || !fileInfo) {
      return NextResponse.json({ message: "The attached photo did not finish uploading. Please try again." }, { status: 400 });
    }
    verifiedAttachmentPath = parsed.data.attachmentPath;
  }

  const messageLines = [`Request type: ${filterRequestKindLabels[parsed.data.requestKind]}`];
  addDetail(messageLines, "Catalogue search", parsed.data.searchQuery);
  addDetail(messageLines, "Filter category", parsed.data.filterCategory);
  addDetail(messageLines, "Part / OEM / reference", parsed.data.partNumber);
  addDetail(messageLines, "Vehicle or equipment", parsed.data.vehicleOrEquipment);
  addDetail(messageLines, "Engine model", parsed.data.engineModel);
  addDetail(messageLines, "Dimensions or markings", parsed.data.dimensions);
  addDetail(messageLines, "Quantity", parsed.data.quantity);
  if (parsed.data.notes) messageLines.push("", "Customer notes:", parsed.data.notes);
  if (verifiedAttachmentPath) messageLines.push("", createAttachmentMarker(verifiedAttachmentPath));

  const { data, error } = await admin.from("enquiries").insert({
    customer_name: parsed.data.name,
    company_name: parsed.data.company || null,
    email: parsed.data.email,
    phone: parsed.data.phone,
    product_id: productId,
    quantity: parsed.data.quantity ?? null,
    branch_id: null,
    message: messageLines.join("\n"),
    source: `website:filter_request:${parsed.data.requestKind}`,
  }).select("enquiry_number").single();

  if (error || !data) {
    console.error("[api:filter-request-create]", { code: error?.code, message: error?.message });
    if (verifiedAttachmentPath) {
      await admin.storage.from(filterRequestAttachmentBucket).remove([verifiedAttachmentPath]);
    }
    return NextResponse.json({ message: "The request could not be sent. Please contact Mutsimoto directly." }, { status: 500 });
  }

  const response = NextResponse.json({ enquiryNumber: String(data.enquiry_number) }, { status: 201 });
  if (!request.cookies.has(sessionCookie)) {
    response.cookies.set(sessionCookie, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }
  return response;
}
