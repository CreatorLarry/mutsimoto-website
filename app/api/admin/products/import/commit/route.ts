import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { importProductWorkbook } from "@/lib/admin/product-import";
import { hasPermission } from "@/lib/auth/permissions";
import { getCurrentStaff } from "@/lib/auth/session";
import {
  parseProductWorkbook,
  ProductWorkbookError,
} from "@/lib/imports/product-workbook";

export const runtime = "nodejs";

const maximumWorkbookSize = 5 * 1024 * 1024;

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
  const value = formData.get("workbook");
  if (!(value instanceof File) || value.size === 0) {
    return NextResponse.json({ message: "Choose an XLSX workbook to continue." }, { status: 400 });
  }
  if (!value.name.toLowerCase().endsWith(".xlsx")) {
    return NextResponse.json({ message: "Upload an .xlsx workbook." }, { status: 400 });
  }
  if (value.size > maximumWorkbookSize) {
    return NextResponse.json({ message: "The workbook must be smaller than 5 MB." }, { status: 413 });
  }

  try {
    const parsed = parseProductWorkbook(await value.arrayBuffer());
    const errors = parsed.issues.filter((issue) => issue.severity === "error");
    if (errors.length > 0 || parsed.products.length === 0) {
      return NextResponse.json(
        {
          message:
            parsed.products.length === 0
              ? "The workbook does not contain any valid products."
              : "The workbook changed or still contains validation errors. Preview it again.",
        },
        { status: 422 },
      );
    }

    const result = await importProductWorkbook(parsed, profile);
    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");
    return NextResponse.json(result, {
      status: result.failed.length > 0 ? 207 : 201,
    });
  } catch (error) {
    const message =
      error instanceof ProductWorkbookError
        ? error.message
        : "The import could not be completed.";
    console.error("[admin:product-import-commit]", error);
    return NextResponse.json({ message }, { status: 422 });
  }
}
