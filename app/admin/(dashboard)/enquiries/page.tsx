import { Mail, MapPin, PackageSearch, Phone, Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminEnquiries, enquiryStatuses } from "@/lib/admin/enquiries";
import { requireStaff } from "@/lib/auth/session";
import { updateEnquiryStatus } from "./actions";

interface EnquiriesAdminPageProps {
  searchParams: Promise<{ query?: string; status?: string; message?: string }>;
}

const statusLabels: Record<(typeof enquiryStatuses)[number], string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  follow_up: "Follow up",
  completed: "Completed",
  closed: "Closed",
};

export default async function EnquiriesAdminPage({ searchParams }: EnquiriesAdminPageProps) {
  await requireStaff("enquiries:manage");
  const params = await searchParams;
  const enquiries = await getAdminEnquiries({ query: params.query, status: params.status });

  return (
    <>
      <AdminPageHeader title="Enquiries" description="Review website requests, see the product and branch context, and move each lead through the sales follow-up workflow." />
      {params.message && <p className="mt-6 rounded-xl border border-[#d7e1eb] bg-white px-4 py-3 text-sm text-[#526176]" role="status">{params.message}</p>}
      <form className="mt-7 grid gap-3 rounded-[20px] border border-[#e0e6ed] bg-white p-4 shadow-[0_8px_28px_rgba(7,23,43,0.04)] sm:grid-cols-[1fr_220px_auto]" action="/admin/enquiries">
        <label className="relative"><span className="sr-only">Search enquiries</span><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8390a2]" /><input name="query" defaultValue={params.query} placeholder="Reference, customer, email, or phone" className="h-12 w-full rounded-xl border border-[#dbe2ea] pl-11 pr-4 text-sm outline-none focus:border-[#e52833]" /></label>
        <label><span className="sr-only">Filter by status</span><select name="status" defaultValue={params.status ?? ""} className="h-12 w-full rounded-xl border border-[#dbe2ea] bg-white px-4 text-sm font-bold text-[#334257] outline-none focus:border-[#e52833]"><option value="">All statuses</option>{enquiryStatuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label>
        <button type="submit" className="button-dark">Apply filters</button>
      </form>

      <div className="mt-6 space-y-4">
        {enquiries.map((enquiry) => (
          <article key={enquiry.id} className="rounded-[22px] border border-[#e0e6ed] bg-white p-5 shadow-[0_8px_28px_rgba(7,23,43,0.04)] sm:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3"><StatusBadge status={enquiry.status} /><span className="font-mono text-xs font-black text-[#526176]">{enquiry.enquiryNumber}</span><span className="text-xs text-[#8793a4]">{new Date(enquiry.createdAt).toLocaleString("en-KE")}</span></div>
                <h2 className="mt-4 text-xl font-black text-[#07172b]">{enquiry.customerName}{enquiry.companyName ? <span className="font-medium text-[#68768a]"> · {enquiry.companyName}</span> : null}</h2>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[#5f6e82]"><a href={`mailto:${enquiry.email}`} className="inline-flex items-center gap-1.5 hover:text-[#d51f2a]"><Mail className="size-3.5" />{enquiry.email}</a><a href={`tel:${enquiry.phone}`} className="inline-flex items-center gap-1.5 hover:text-[#d51f2a]"><Phone className="size-3.5" />{enquiry.phone}</a>{enquiry.branchName && <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" />{enquiry.branchName}</span>}</div>
                {(enquiry.productName || enquiry.partNumber) && <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#f1f4f7] px-3 py-2 text-xs font-bold text-[#3f4e62]"><PackageSearch className="size-4 text-[#d51f2a]" />{enquiry.productName ?? "Requested filter"}{enquiry.partNumber ? ` · ${enquiry.partNumber}` : ""}{enquiry.quantity ? ` · Qty ${enquiry.quantity}` : ""}</p>}
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#526176]">{enquiry.message}</p>
              </div>
              <form action={updateEnquiryStatus} className="flex shrink-0 items-end gap-2 rounded-2xl bg-[#f5f7f9] p-3">
                <input type="hidden" name="enquiryId" value={enquiry.id} />
                <label className="text-[9px] font-black uppercase tracking-[0.12em] text-[#657184]">Status<select name="status" defaultValue={enquiry.status} className="mt-1 block h-10 min-w-36 rounded-xl border border-[#d7dfe7] bg-white px-3 text-xs font-bold text-[#25364c] outline-none focus:border-[#e52833]">{enquiryStatuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label>
                <button type="submit" className="button-primary min-h-10 px-4 py-2 text-xs">Update</button>
              </form>
            </div>
          </article>
        ))}
        {enquiries.length === 0 && <div className="rounded-[22px] border border-[#e0e6ed] bg-white px-6 py-16 text-center"><h2 className="text-lg font-black text-[#07172b]">No enquiries match this view</h2><p className="mt-2 text-sm text-[#748196]">New website enquiries will appear here as soon as Supabase is connected.</p></div>}
      </div>
    </>
  );
}
