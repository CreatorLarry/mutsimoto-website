import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { hasPermission } from "@/lib/auth/permissions";
import { getCurrentStaff } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

interface FinalizeItem {
  id: string;
  primaryImagePath: string | null;
  publish: boolean;
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function finalizeItems(value: unknown): FinalizeItem[] | null {
  if (
    typeof value !== "object" ||
    value === null ||
    !("items" in value) ||
    !Array.isArray(value.items) ||
    value.items.length < 1 ||
    value.items.length > 25
  ) {
    return null;
  }

  const items: FinalizeItem[] = [];
  for (const item of value.items) {
    if (
      typeof item !== "object" ||
      item === null ||
      !("id" in item) ||
      typeof item.id !== "string" ||
      !uuidPattern.test(item.id) ||
      !("publish" in item) ||
      typeof item.publish !== "boolean"
    ) {
      return null;
    }
    const primaryImagePath =
      "primaryImagePath" in item && typeof item.primaryImagePath === "string"
        ? item.primaryImagePath
        : null;
    if (
      primaryImagePath &&
      (primaryImagePath.length > 500 || !primaryImagePath.startsWith(`${item.id}/`))
    ) {
      return null;
    }
    items.push({ id: item.id, primaryImagePath, publish: item.publish });
  }
  return items;
}

export async function POST(request: NextRequest) {
  const profile = await getCurrentStaff();
  if (!profile) {
    return NextResponse.json(
      { message: "Your staff session has expired. Sign in again." },
      { status: 401 },
    );
  }
  if (!hasPermission(profile, "products:write")) {
    return NextResponse.json(
      { message: "You do not have permission to finish product imports." },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "The final import request could not be read." }, { status: 400 });
  }
  const items = finalizeItems(body);
  if (!items) {
    return NextResponse.json({ message: "The final import request is invalid." }, { status: 400 });
  }
  if (items.some((item) => item.publish) && !hasPermission(profile, "products:publish")) {
    return NextResponse.json(
      { message: "You do not have permission to publish imported products." },
      { status: 403 },
    );
  }

  const client = await createClient();
  const now = new Date().toISOString();
  let updated = 0;
  let published = 0;
  const failed: Array<{ id: string; message: string }> = [];

  for (const item of items) {
    if (item.publish) {
      const { data: imageState, error: imageStateError } = await client
        .from("products")
        .select("primary_image_url, product_images(id)")
        .eq("id", item.id)
        .maybeSingle();
      if (imageStateError || !imageState) {
        failed.push({ id: item.id, message: "The product image status could not be checked." });
        continue;
      }
      const hasAttachedImage = Boolean(
        item.primaryImagePath ||
          imageState.primary_image_url ||
          imageState.product_images?.length,
      );
      if (!hasAttachedImage) {
        failed.push({
          id: item.id,
          message: "The product remains a draft because no product image is attached.",
        });
        continue;
      }
    }

    const payload: {
      updated_by: string;
      primary_image_url?: string;
      publication_status?: "published";
      published_at?: string;
    } = { updated_by: profile.id };
    if (item.primaryImagePath) payload.primary_image_url = item.primaryImagePath;
    if (item.publish) {
      payload.publication_status = "published";
      payload.published_at = now;
    }

    const { data, error } = await client
      .from("products")
      .update(payload)
      .eq("id", item.id)
      .select("id")
      .maybeSingle();
    if (error || !data) {
      failed.push({ id: item.id, message: "The product could not be finalized." });
    } else {
      updated += 1;
      if (item.publish) published += 1;
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  return NextResponse.json(
    { updated, published, failed },
    { status: failed.length > 0 ? 207 : 200 },
  );
}
