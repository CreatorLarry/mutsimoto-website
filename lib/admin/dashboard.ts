import "server-only";

import { hasPermission } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import type { StaffProfile } from "@/types/admin";

interface RecentProduct {
  id: string;
  name: string;
  partNumber: string;
  status: string;
  updatedAt: string;
}

interface RecentEnquiry {
  id: string;
  enquiryNumber: string;
  customerName: string;
  status: string;
  createdAt: string;
}

export interface DashboardData {
  counts: {
    totalProducts: number;
    publishedProducts: number;
    draftProducts: number;
    reviewProducts: number;
    newEnquiries: number;
    followUpEnquiries: number;
  };
  recentProducts: RecentProduct[];
  recentEnquiries: RecentEnquiry[];
}

interface ProductRecord {
  id: string;
  name: string;
  part_number: string;
  publication_status: string;
  updated_at: string;
}

interface EnquiryRecord {
  id: string;
  enquiry_number: string;
  customer_name: string;
  status: string;
  created_at: string;
}

export async function getDashboardData(profile: StaffProfile): Promise<DashboardData> {
  const supabase = await createClient();
  const canSeeEnquiries = hasPermission(profile, "enquiries:manage");

  const [total, published, drafts, review, productsResult, newEnquiries, followUps, enquiriesResult] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("publication_status", "published"),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("publication_status", "draft"),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("publication_status", "review"),
    supabase.from("products").select("id, name, part_number, publication_status, updated_at").order("updated_at", { ascending: false }).limit(6),
    canSeeEnquiries ? supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "new") : Promise.resolve({ count: 0 }),
    canSeeEnquiries ? supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "follow_up") : Promise.resolve({ count: 0 }),
    canSeeEnquiries ? supabase.from("enquiries").select("id, enquiry_number, customer_name, status, created_at").order("created_at", { ascending: false }).limit(6) : Promise.resolve({ data: [] }),
  ]);

  const productRows = (productsResult.data ?? []) as ProductRecord[];
  const enquiryRows = ("data" in enquiriesResult ? enquiriesResult.data ?? [] : []) as EnquiryRecord[];

  return {
    counts: {
      totalProducts: total.count ?? 0,
      publishedProducts: published.count ?? 0,
      draftProducts: drafts.count ?? 0,
      reviewProducts: review.count ?? 0,
      newEnquiries: newEnquiries.count ?? 0,
      followUpEnquiries: followUps.count ?? 0,
    },
    recentProducts: productRows.map((product) => ({ id: product.id, name: product.name, partNumber: product.part_number, status: product.publication_status, updatedAt: product.updated_at })),
    recentEnquiries: enquiryRows.map((enquiry) => ({ id: enquiry.id, enquiryNumber: enquiry.enquiry_number, customerName: enquiry.customer_name, status: enquiry.status, createdAt: enquiry.created_at })),
  };
}

