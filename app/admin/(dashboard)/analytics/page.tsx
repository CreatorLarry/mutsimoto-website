import Link from "next/link";
import { BarChart3, Download, Eye, MailQuestion, Search, SearchX } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatCard } from "@/components/admin/stat-card";
import { getCatalogueAnalytics } from "@/lib/admin/analytics";
import { requireStaff } from "@/lib/auth/session";
import type { AnalyticsRankedItem } from "@/types/analytics";

interface AnalyticsAdminPageProps {
  searchParams: Promise<{ range?: string }>;
}

function RankedList({ title, description, items, empty }: { title: string; description: string; items: AnalyticsRankedItem[]; empty: string }) {
  const maximum = Math.max(...items.map((item) => item.value), 1);
  return (
    <article className="overflow-hidden rounded-[22px] border border-[#e0e6ed] bg-white shadow-[0_8px_28px_rgba(7,23,43,0.04)]">
      <div className="border-b border-[#e9edf2] px-6 py-5"><h2 className="font-black text-[#07172b]">{title}</h2><p className="mt-1 text-xs text-[#748196]">{description}</p></div>
      {items.length > 0 ? <ol className="divide-y divide-[#edf0f3]">{items.map((item, index) => <li key={`${item.label}-${index}`} className="px-6 py-4"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="truncate text-sm font-black capitalize text-[#07172b]">{item.label}</p><p className="mt-1 text-[10px] font-bold text-[#7f8b9c]">{item.detail}</p></div><strong className="font-mono text-sm text-[#d51f2a]">{item.value}</strong></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#edf1f4]"><div className="h-full rounded-full bg-[#173d64]" style={{ width: `${Math.max(5, (item.value / maximum) * 100)}%` }} /></div></li>)}</ol> : <p className="px-6 py-10 text-center text-sm text-[#748196]">{empty}</p>}
    </article>
  );
}

export default async function AnalyticsAdminPage({ searchParams }: AnalyticsAdminPageProps) {
  const profile = await requireStaff("analytics:read");
  const params = await searchParams;
  const days = [7, 30, 90].includes(Number(params.range)) ? Number(params.range) : 30;
  const data = await getCatalogueAnalytics(profile, days);
  const peak = Math.max(...data.series.flatMap((point) => [point.searches, point.productViews, point.downloads, point.enquiries]), 1);

  return (
    <>
      <AdminPageHeader title="Catalogue analytics" description="Understand catalogue discovery, product interest, document activity, and customer enquiry movement." actions={<div className="inline-flex rounded-full border border-[#d7dee7] bg-white p-1">{[7, 30, 90].map((range) => <Link key={range} href={`/admin/analytics?range=${range}`} className={`rounded-full px-4 py-2 text-xs font-black ${days === range ? "bg-[#07172b] text-white" : "text-[#657184] hover:bg-[#f0f3f6]"}`}>{range} days</Link>)}</div>} />
      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard label="Catalogue searches" value={data.totals.searches} icon={Search} />
        <StatCard label="No-result searches" value={data.totals.noResultSearches} icon={SearchX} tone="amber" />
        <StatCard label="Product views" value={data.totals.productViews} icon={Eye} tone="green" />
        <StatCard label="PDF downloads" value={data.totals.downloads} icon={Download} />
        {data.canSeeEnquiries && <StatCard label="Enquiries" value={data.totals.enquiries} icon={MailQuestion} tone="red" />}
      </section>

      <section className="mt-7 rounded-[22px] border border-[#e0e6ed] bg-white p-5 shadow-[0_8px_28px_rgba(7,23,43,0.04)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="font-black text-[#07172b]">Activity over time</h2><p className="mt-1 text-xs text-[#748196]">Daily catalogue activity for the selected period</p></div><div className="flex flex-wrap gap-3 text-[9px] font-black uppercase tracking-[0.08em] text-[#6d7a8e]">{[["bg-[#173d64]", "Searches"], ["bg-[#2f8178]", "Views"], ["bg-[#d51f2a]", "Downloads"], ["bg-[#e5a928]", "Enquiries"]].map(([tone, label]) => <span key={label} className="inline-flex items-center gap-1.5"><i className={`size-2 rounded-full ${tone}`} />{label}</span>)}</div></div>
        <div className="mt-7 overflow-x-auto pb-2"><div className="flex h-56 min-w-max items-end gap-2 border-b border-[#dce3eb] px-1" style={{ width: `${Math.max(680, data.series.length * 38)}px` }}>{data.series.map((point, index) => <div key={`${point.label}-${index}`} className="flex h-full flex-1 flex-col justify-end"><div className="flex h-[185px] items-end justify-center gap-0.5"><span className="w-1.5 rounded-t bg-[#173d64]" style={{ height: `${Math.max(point.searches ? 5 : 0, (point.searches / peak) * 100)}%` }} title={`${point.searches} searches`} /><span className="w-1.5 rounded-t bg-[#2f8178]" style={{ height: `${Math.max(point.productViews ? 5 : 0, (point.productViews / peak) * 100)}%` }} title={`${point.productViews} product views`} /><span className="w-1.5 rounded-t bg-[#d51f2a]" style={{ height: `${Math.max(point.downloads ? 5 : 0, (point.downloads / peak) * 100)}%` }} title={`${point.downloads} downloads`} />{data.canSeeEnquiries && <span className="w-1.5 rounded-t bg-[#e5a928]" style={{ height: `${Math.max(point.enquiries ? 5 : 0, (point.enquiries / peak) * 100)}%` }} title={`${point.enquiries} enquiries`} />}</div><span className="mt-2 block truncate text-center text-[8px] font-bold text-[#8793a4]">{days <= 30 || index % 5 === 0 ? point.label : ""}</span></div>)}</div></div>
      </section>

      <section className="mt-7 grid gap-6 xl:grid-cols-2">
        <RankedList title="Top search terms" description="What catalogue visitors are trying to find" items={data.topSearches} empty="Search activity will appear here after visitors use catalogue search." />
        <RankedList title="Most-viewed products" description="Products attracting the most detail-page interest" items={data.topProducts} empty="Product-view activity starts recording with this release." />
        <RankedList title="Most-downloaded documents" description="Published resources used by visitors" items={data.topDownloads} empty="Document downloads will appear after visitors open published PDFs." />
        {data.canSeeEnquiries ? <RankedList title="Enquiry workflow" description="Current enquiry distribution during this period" items={data.enquiryStatuses} empty="No enquiries were received during this period." /> : <article className="flex min-h-64 flex-col items-center justify-center rounded-[22px] border border-[#e0e6ed] bg-white px-6 text-center"><BarChart3 className="size-8 text-[#98a4b4]" /><h2 className="mt-4 font-black text-[#07172b]">Sales analytics are permission-controlled</h2><p className="mt-2 max-w-sm text-sm leading-6 text-[#748196]">Catalogue activity is visible here. Enquiry information remains limited to sales-authorised staff.</p></article>}
      </section>
    </>
  );
}
