import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { filterRequestAttachmentBucket } from "@/lib/enquiries/filter-request";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured, isSupabaseSecretConfigured } from "@/lib/supabase/env";
import { filterRequestUploadSchema } from "@/lib/validation/filter-request";

const sessionCookie = "mmc_catalogue_session";
const extensions: Record<"image/jpeg" | "image/png" | "image/webp", string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured() || !isSupabaseSecretConfigured()) {
    return NextResponse.json({ message: "Photo uploads are not connected yet." }, { status: 503 });
  }

  const sessionId = request.cookies.get(sessionCookie)?.value ?? randomUUID();
  const limit = checkRateLimit(`filter-request-photo:${sessionId}`, 6, 10 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { message: "Too many photos were prepared. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "The photo information could not be read." }, { status: 400 });
  }

  const parsed = filterRequestUploadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Use a JPG, PNG, or WebP photo smaller than 5 MB." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error: bucketLookupError } = await admin.storage.getBucket(filterRequestAttachmentBucket);
  if (bucketLookupError) {
    const { error: bucketCreateError } = await admin.storage.createBucket(filterRequestAttachmentBucket, {
      public: false,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    });
    if (bucketCreateError && !bucketCreateError.message.toLowerCase().includes("already exists")) {
      console.error("[api:filter-request-bucket]", { message: bucketCreateError.message });
      return NextResponse.json({ message: "The photo service could not be prepared." }, { status: 500 });
    }
  }

  const extension = extensions[parsed.data.contentType];
  const path = `incoming/${sessionId}/${randomUUID()}.${extension}`;
  const { data, error } = await admin.storage.from(filterRequestAttachmentBucket).createSignedUploadUrl(path);
  if (error || !data) {
    console.error("[api:filter-request-upload-url]", { message: error?.message });
    return NextResponse.json({ message: "The photo could not be prepared for upload." }, { status: 500 });
  }

  const response = NextResponse.json({ path, token: data.token });
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
