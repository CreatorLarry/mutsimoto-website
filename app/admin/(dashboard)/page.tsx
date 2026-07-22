import Link from "next/link";
import { Boxes, CheckCircle2, ClipboardClock, FileEdit, MailQuestion, RefreshCw } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatCard } from "@/components/admin/stat-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { hasPermission } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/admin/dashboard";

export default async function AdminDashboardPage() {
  const profile = await requireStaff();
  const data = await getDashboardData(profile);
  const canSeeEnquiries = hasPermission(profile, "enquiries:manage");
  const canCreateProducts = hasPermission(profile, "products:write");

  return (
    <>
      <AdminPageHeader eyebrow="Control centre" title={`Welcome, ${profile.fullName.split(" ")[0]}`} description="A live operational view of catalogue publication and customer enquiry activity." actions={<><Link href="/" className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d7dee7] bg-white px-5 text-sm font-bold text-[#07172b] hover:border-[#a8b4c2]">View website</Link>{canCreateProducts && <Link href="/admin/products/new" className="button-primary">Add product</Link>}</>} />
      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard label="Total products" value={data.counts.totalProducts} icon={Boxes} />
        <StatCard label="Published" value={data.counts.publishedProducts} icon={CheckCircle2} tone="green" />
        <StatCard label="Drafts" value={data.counts.draftProducts} icon={FileEdit} />
        <StatCard label="Under review" value={data.counts.reviewProducts} icon={ClipboardClock} tone="amber" />
        {canSeeEnquiries && <StatCard label="New enquiries" value={data.counts.newEnquiries} icon={MailQuestion} tone="red" />}
        {canSeeEnquiries && <StatCard label="Awaiting follow-up" value={data.counts.followUpEnquiries} icon={RefreshCw} tone="amber" />}
      </section>
      <section className={`mt-8 grid gap-6 ${canSeeEnquiries ? "xl:grid-cols-2" : ""}`}>
        <article className="overflow-hidden rounded-[22px] border border-[#e0e6ed] bg-white shadow-[0_8px_28px_rgba(7,23,43,0.04)]"><div className="flex items-center justify-between border-b border-[#e9edf2] px-6 py-5"><div><h2 className="font-black text-[#07172b]">Recent product updates</h2><p className="mt-1 text-xs text-[#748196]">Latest catalogue changes</p></div><Link href="/admin/products" className="text-xs font-black text-[#d51f2a]">View all</Link></div>{data.recentProducts.length > 0 ? <ul className="divide-y divide-[#edf0f3]">{data.recentProducts.map((product) => <li key={product.id} className="flex items-center justify-between gap-4 px-6 py-4"><div><Link href={`/admin/products/${product.id}/edit`} className="text-sm font-black text-[#07172b] hover:text-[#d51f2a]">{product.name}</Link><p className="mt-1 font-mono text-[11px] text-[#758298]">{product.partNumber}</p></div><div className="text-right"><StatusBadge status={product.status} /><p className="mt-1.5 text-[10px] text-[#8c98a9]">{new Date(product.updatedAt).toLocaleDateString("en-KE")}</p></div></li>)}</ul> : <p className="px-6 py-10 text-center text-sm text-[#748196]">No products have been added yet.</p>}</article>
        {canSeeEnquiries && <article className="overflow-hidden rounded-[22px] border border-[#e0e6ed] bg-white shadow-[0_8px_28px_rgba(7,23,43,0.04)]"><div className="flex items-center justify-between border-b border-[#e9edf2] px-6 py-5"><div><h2 className="font-black text-[#07172b]">Recent enquiries</h2><p className="mt-1 text-xs text-[#748196]">Latest website requests</p></div><Link href="/admin/enquiries" className="text-xs font-black text-[#d51f2a]">View all</Link></div>{data.recentEnquiries.length > 0 ? <ul className="divide-y divide-[#edf0f3]">{data.recentEnquiries.map((enquiry) => <li key={enquiry.id} className="flex items-center justify-between gap-4 px-6 py-4"><div><p className="text-sm font-black text-[#07172b]">{enquiry.customerName}</p><p className="mt-1 font-mono text-[11px] text-[#758298]">{enquiry.enquiryNumber}</p></div><div className="text-right"><StatusBadge status={enquiry.status} /><p className="mt-1.5 text-[10px] text-[#8c98a9]">{new Date(enquiry.createdAt).toLocaleDateString("en-KE")}</p></div></li>)}</ul> : <p className="px-6 py-10 text-center text-sm text-[#748196]">No enquiries have been received yet.</p>}</article>}
      </section>
    </>
  );
}

