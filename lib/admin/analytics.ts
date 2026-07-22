import "server-only";

import { hasPermission } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import type { StaffProfile } from "@/types/admin";
import type { AnalyticsRankedItem, AnalyticsSeriesPoint, CatalogueAnalytics } from "@/types/analytics";

interface SearchEventRecord { query: string; result_count: number; searched_at: string }
interface ProductViewRecord { viewed_at: string; products: { name: string; part_number: string } | null }
interface DownloadEventRecord { downloaded_at: string; downloads: { title: string; category: string } | null }
interface EnquiryRecord { status: string; created_at: string }

function dateKey(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

function ranked(values: Map<string, { detail: string; value: number }>, limit = 8): AnalyticsRankedItem[] {
  return [...values.entries()]
    .map(([label, value]) => ({ label, detail: value.detail, value: value.value }))
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label))
    .slice(0, limit);
}

function increment(values: Map<string, { detail: string; value: number }>, label: string, detail: string) {
  const current = values.get(label);
  values.set(label, { detail, value: (current?.value ?? 0) + 1 });
}

export async function getCatalogueAnalytics(profile: StaffProfile, days: number): Promise<CatalogueAnalytics> {
  const supabase = await createClient();
  const canSeeEnquiries = hasPermission(profile, "enquiries:manage");
  const sinceDate = new Date();
  sinceDate.setUTCDate(sinceDate.getUTCDate() - days + 1);
  sinceDate.setUTCHours(0, 0, 0, 0);
  const since = sinceDate.toISOString();

  const [searchResult, viewResult, downloadResult, enquiryResult] = await Promise.all([
    supabase.from("search_events").select("query, result_count, searched_at").gte("searched_at", since).order("searched_at", { ascending: false }).limit(5000),
    supabase.from("product_views").select("viewed_at, products(name, part_number)").gte("viewed_at", since).order("viewed_at", { ascending: false }).limit(5000),
    supabase.from("download_events").select("downloaded_at, downloads(title, category)").gte("downloaded_at", since).order("downloaded_at", { ascending: false }).limit(5000),
    canSeeEnquiries ? supabase.from("enquiries").select("status, created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(5000) : Promise.resolve({ data: [], error: null }),
  ]);

  if (searchResult.error || viewResult.error || downloadResult.error || enquiryResult.error) {
    throw new Error("Unable to load catalogue analytics.");
  }

  const searches = (searchResult.data ?? []) as SearchEventRecord[];
  const views = (viewResult.data ?? []) as unknown as ProductViewRecord[];
  const downloads = (downloadResult.data ?? []) as unknown as DownloadEventRecord[];
  const enquiries = (enquiryResult.data ?? []) as EnquiryRecord[];
  const seriesByDate = new Map<string, AnalyticsSeriesPoint>();

  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(sinceDate);
    date.setUTCDate(sinceDate.getUTCDate() + offset);
    const key = dateKey(date);
    seriesByDate.set(key, { label: date.toLocaleDateString("en-KE", { day: "numeric", month: "short", timeZone: "UTC" }), searches: 0, productViews: 0, downloads: 0, enquiries: 0 });
  }

  const topSearches = new Map<string, { detail: string; value: number }>();
  searches.forEach((event) => {
    const point = seriesByDate.get(dateKey(event.searched_at));
    if (point) point.searches += 1;
    increment(topSearches, event.query.trim().toLowerCase(), event.result_count === 0 ? "No results" : `${event.result_count} result${event.result_count === 1 ? "" : "s"}`);
  });

  const topProducts = new Map<string, { detail: string; value: number }>();
  views.forEach((event) => {
    const point = seriesByDate.get(dateKey(event.viewed_at));
    if (point) point.productViews += 1;
    if (event.products) increment(topProducts, event.products.name, event.products.part_number);
  });

  const topDownloads = new Map<string, { detail: string; value: number }>();
  downloads.forEach((event) => {
    const point = seriesByDate.get(dateKey(event.downloaded_at));
    if (point) point.downloads += 1;
    if (event.downloads) increment(topDownloads, event.downloads.title, event.downloads.category);
  });

  const enquiryStatuses = new Map<string, { detail: string; value: number }>();
  enquiries.forEach((event) => {
    const point = seriesByDate.get(dateKey(event.created_at));
    if (point) point.enquiries += 1;
    increment(enquiryStatuses, event.status.replaceAll("_", " "), "Enquiries");
  });

  return {
    days,
    totals: {
      searches: searches.length,
      noResultSearches: searches.filter((event) => event.result_count === 0).length,
      productViews: views.length,
      downloads: downloads.length,
      enquiries: enquiries.length,
    },
    series: [...seriesByDate.values()],
    topSearches: ranked(topSearches),
    topProducts: ranked(topProducts),
    topDownloads: ranked(topDownloads),
    enquiryStatuses: ranked(enquiryStatuses, 10),
    canSeeEnquiries,
  };
}
