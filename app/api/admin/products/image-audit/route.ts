import { NextResponse, type NextRequest } from "next/server";
import { getAdminProductImageAudit } from "@/lib/admin/products";
import { hasPermission } from "@/lib/auth/permissions";
import { getCurrentStaff } from "@/lib/auth/session";
import { productCategoryLabels } from "@/types/categories";

export const runtime = "nodejs";

function csvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

export async function GET(request: NextRequest) {
  const profile = await getCurrentStaff();
  if (!profile) {
    return NextResponse.json({ message: "Your staff session has expired." }, { status: 401 });
  }
  if (!hasPermission(profile, "products:read")) {
    return NextResponse.json(
      { message: "You do not have permission to export product reports." },
      { status: 403 },
    );
  }

  const requestedStatus = request.nextUrl.searchParams.get("status") ?? "all";
  const status = ["draft", "review", "published", "archived"].includes(requestedStatus)
    ? requestedStatus
    : "all";
  const audit = await getAdminProductImageAudit();
  const products = audit.products.filter(
    (product) => status === "all" || product.publicationStatus === status,
  );
  const rows = [
    [
      "Part number",
      "Product name",
      "Category",
      "Publication status",
      "Availability",
      "Last updated",
      "Required action",
    ],
    ...products.map((product) => [
      product.partNumber,
      product.name,
      productCategoryLabels[product.category],
      product.publicationStatus,
      product.availability,
      new Date(product.updatedAt).toISOString(),
      "Supply and attach a product image before publishing",
    ]),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mutsimoto-${status}-products-missing-images-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
