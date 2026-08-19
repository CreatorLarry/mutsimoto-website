import "server-only";

import {
  extractAttachmentPath,
  filterRequestAttachmentBucket,
  getFilterRequestKind,
  removeAttachmentMarker,
  type FilterRequestKind,
} from "@/lib/enquiries/filter-request";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const enquiryStatuses = ["new", "contacted", "quoted", "follow_up", "completed", "closed"] as const;
export type EnquiryStatus = (typeof enquiryStatuses)[number];

export interface AdminEnquiry {
  id: string;
  enquiryNumber: string;
  customerName: string;
  companyName: string | null;
  email: string;
  phone: string;
  productName: string | null;
  partNumber: string | null;
  quantity: number | null;
  branchName: string | null;
  message: string;
  status: EnquiryStatus;
  source: string;
  requestKind: FilterRequestKind | null;
  attachmentUrl: string | null;
  createdAt: string;
}

interface EnquiryRecord {
  id: string;
  enquiry_number: string;
  customer_name: string;
  company_name: string | null;
  email: string;
  phone: string;
  quantity: number | null;
  message: string;
  status: EnquiryStatus;
  source: string;
  created_at: string;
  products: { name: string; part_number: string } | null;
  branches: { name: string } | null;
}

export async function getAdminEnquiries(filters: { query?: string; status?: string } = {}): Promise<AdminEnquiry[]> {
  const supabase = await createClient();
  let query = supabase
    .from("enquiries")
    .select("id, enquiry_number, customer_name, company_name, email, phone, quantity, message, status, source, created_at, products(name, part_number), branches(name)")
    .order("created_at", { ascending: false })
    .limit(100);

  const search = filters.query?.trim().slice(0, 100);
  if (search) {
    const safe = search.replaceAll(",", " ").replaceAll("%", "");
    query = query.or(`enquiry_number.ilike.%${safe}%,customer_name.ilike.%${safe}%,company_name.ilike.%${safe}%,email.ilike.%${safe}%,phone.ilike.%${safe}%,message.ilike.%${safe}%`);
  }
  if (filters.status && enquiryStatuses.some((status) => status === filters.status)) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) {
    console.error("[admin:enquiries]", { code: error.code, message: error.message });
    throw new Error("Enquiries could not be loaded.");
  }

  const records = (data ?? []) as unknown as EnquiryRecord[];
  const attachmentPaths = [...new Set(records.map((enquiry) => extractAttachmentPath(enquiry.message)).filter((path): path is string => Boolean(path)))];
  const signedAttachmentUrls = new Map<string, string>();
  if (attachmentPaths.length > 0) {
    const admin = createAdminClient();
    const { data: signedFiles, error: signedFilesError } = await admin.storage
      .from(filterRequestAttachmentBucket)
      .createSignedUrls(attachmentPaths, 60 * 60);
    if (signedFilesError) {
      console.error("[admin:enquiry-attachments]", { message: signedFilesError.message });
    } else {
      for (const file of signedFiles ?? []) {
        if (file.path && file.signedUrl) signedAttachmentUrls.set(file.path, file.signedUrl);
      }
    }
  }

  return records.map((enquiry) => {
    const attachmentPath = extractAttachmentPath(enquiry.message);
    return {
    id: enquiry.id,
    enquiryNumber: enquiry.enquiry_number,
    customerName: enquiry.customer_name,
    companyName: enquiry.company_name,
    email: enquiry.email,
    phone: enquiry.phone,
    productName: enquiry.products?.name ?? null,
    partNumber: enquiry.products?.part_number ?? null,
    quantity: enquiry.quantity,
    branchName: enquiry.branches?.name ?? null,
    message: removeAttachmentMarker(enquiry.message),
    status: enquiry.status,
    source: enquiry.source,
    requestKind: getFilterRequestKind(enquiry.source),
    attachmentUrl: attachmentPath ? signedAttachmentUrls.get(attachmentPath) ?? null : null,
    createdAt: enquiry.created_at,
    };
  });
}
