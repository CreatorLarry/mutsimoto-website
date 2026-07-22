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

  const partNumbers = productData.match(/partNumber:\s*"[A-Z0-9 -]+"/g) ?? [];
  assert.ok(partNumbers.length >= 12, "expected at least twelve mock products");
});

test("includes the protected dashboard and Supabase handoff", async () => {
  const requiredFiles = [
    "app/admin/(auth)/login/page.tsx",
    "app/admin/(dashboard)/page.tsx",
    "app/admin/(dashboard)/products/page.tsx",
    "app/admin/(dashboard)/products/new/page.tsx",
    "app/admin/(dashboard)/enquiries/page.tsx",
    "app/admin/(dashboard)/branches/actions.ts",
    "app/admin/(dashboard)/branches/page.tsx",
    "app/admin/(dashboard)/downloads/actions.ts",
    "app/admin/(dashboard)/downloads/page.tsx",
    "app/admin/(dashboard)/analytics/page.tsx",
    "app/admin/(dashboard)/users/page.tsx",
    "app/admin/(dashboard)/settings/page.tsx",
    "app/api/catalogue/search/route.ts",
    "app/api/enquiries/route.ts",
    "proxy.ts",
    "supabase/migrations/202607200001_core_schema.sql",
    "supabase/migrations/202607200002_security_storage.sql",
    "supabase/seed.sql",
  ];
  await Promise.all(requiredFiles.map((file) => access(new URL(file, root))));

  const [core, security, seed] = await Promise.all([
    readFile(new URL("supabase/migrations/202607200001_core_schema.sql", root), "utf8"),
    readFile(new URL("supabase/migrations/202607200002_security_storage.sql", root), "utf8"),
    readFile(new URL("supabase/seed.sql", root), "utf8"),
  ]);
  assert.match(core, /create table public\.products/);
  assert.match(core, /create table public\.enquiries/);
  assert.match(security, /alter table public\.products enable row level security/);
  assert.match(security, /storage_published_product_images_read/);
  assert.match(seed, /MAF-468/);
});

test("connects analytics, staff, and company content modules", async () => {
  const [analytics, users, settings, about, productPage, downloads] = await Promise.all([
    readFile(new URL("app/admin/(dashboard)/analytics/page.tsx", root), "utf8"),
    readFile(new URL("app/admin/(dashboard)/users/page.tsx", root), "utf8"),
    readFile(new URL("app/admin/(dashboard)/settings/page.tsx", root), "utf8"),
    readFile(new URL("app/about/page.tsx", root), "utf8"),
    readFile(new URL("app/products/[slug]/page.tsx", root), "utf8"),
    readFile(new URL("lib/downloads.ts", root), "utf8"),
  ]);

  assert.doesNotMatch(analytics, /ModulePlaceholder/);
  assert.doesNotMatch(users, /ModulePlaceholder/);
  assert.doesNotMatch(settings, /ModulePlaceholder/);
  assert.match(about, /getPublicCompanyContent/);
  assert.match(productPage, /ProductViewTracker/);
  assert.match(downloads, /\/api\/downloads\//);
});

test("connects branch and document content management", async () => {
  const [branchesAdmin, downloadsAdmin, publicBranches, publicDownloads, security] = await Promise.all([
    readFile(new URL("app/admin/(dashboard)/branches/page.tsx", root), "utf8"),
    readFile(new URL("app/admin/(dashboard)/downloads/page.tsx", root), "utf8"),
    readFile(new URL("app/branches/page.tsx", root), "utf8"),
    readFile(new URL("app/downloads/page.tsx", root), "utf8"),
    readFile(new URL("supabase/migrations/202607200002_security_storage.sql", root), "utf8"),
  ]);

  assert.doesNotMatch(branchesAdmin, /ModulePlaceholder/);
  assert.doesNotMatch(downloadsAdmin, /ModulePlaceholder/);
  assert.match(publicBranches, /getBranches/);
  assert.match(publicDownloads, /getDownloads/);
  assert.match(security, /'catalogues', 'catalogues', true/);
  assert.match(security, /storage_content_insert/);
});
