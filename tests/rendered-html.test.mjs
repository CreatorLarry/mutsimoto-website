import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("includes every catalogue route", async () => {
  const routes = [
    "app/page.tsx",
    "app/products/page.tsx",
    "app/products/[slug]/page.tsx",
    "app/applications/page.tsx",
    "app/downloads/page.tsx",
    "app/about/page.tsx",
    "app/branches/page.tsx",
    "app/contact/page.tsx",
  ];

  await Promise.all(routes.map((route) => access(new URL(route, root))));
});

test("ships product-specific content and removes the starter preview", async () => {
  const [home, productData, categoryData, layout] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("data/products.ts", root), "utf8"),
    readFile(new URL("data/categories.ts", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
  ]);

  assert.match(home, /Filtration Solutions Built for Performance/);
  assert.match(categoryData, /Oil Filters/);
  assert.match(categoryData, /Fuel Filters/);
  assert.match(categoryData, /Air Filters/);
  assert.match(layout, /Mutsimoto Motor Company/);
  assert.doesNotMatch(home, /Your site is taking shape|SkeletonPreview/);

  const partNumbers = productData.match(/partNumber:\s*"[A-Z0-9-]+"/g) ?? [];
  assert.ok(partNumbers.length >= 12, "expected at least twelve mock products");
});
