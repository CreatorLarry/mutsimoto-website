import { NextResponse, type NextRequest } from "next/server";
import { hasPermission } from "@/lib/auth/permissions";
import { getCurrentStaff } from "@/lib/auth/session";
import {
  createProductImportPreview,
  parseProductWorkbook,
  ProductWorkbookError,
} from "@/lib/imports/product-workbook";

export const runtime = "nodejs";

const maximumWorkbookSize = 5 * 1024 * 1024;

function workbookFile(formData: FormData): File | null {
  const value = formData.get("workbook");
  return value instanceof File && value.size > 0 ? value : null;
}

export async function POST(request: NextRequest) {
  const profile = await getCurrentStaff();
  if (!profile) {
    return NextResponse.json({ message: "Your staff session has expired. Sign in again." }, { status: 401 });
  }
  if (!hasPermission(profile, "products:write")) {
    return NextResponse.json({ message: "You do not have permission to import products." }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ message: "The upload could not be read." }, { status: 400 });
  }

  const file = workbookFile(formData);
  if (!file) {
    return NextResponse.json({ message: "Choose an XLSX workbook to continue." }, { status: 400 });
  }
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return NextResponse.json({ message: "Upload an .xlsx workbook." }, { status: 400 });
  }
  if (file.size > maximumWorkbookSize) {
    return NextResponse.json({ message: "The workbook must be smaller than 5 MB." }, { status: 413 });
  }

  try {
    const parsed = parseProductWorkbook(await file.arrayBuffer());
    return NextResponse.json(createProductImportPreview(file.name, parsed));
  } catch (error) {
    const message =
      error instanceof ProductWorkbookError
        ? error.message
        : "The workbook could not be validated.";
    console.error("[admin:product-import-preview]", error);
    return NextResponse.json({ message }, { status: 422 });
  }
}
