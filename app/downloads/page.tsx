import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Download, FileText } from "lucide-react";
import { CallToAction } from "@/components/ui/call-to-action";
import { PageHero } from "@/components/ui/page-hero";
import { downloads } from "@/data/downloads";

export const metadata: Metadata = { title: "Downloads", description: "Request Mutsimoto product catalogues, cross-reference guides, and technical data sheets." };

export default function DownloadsPage() {
  return (
    <>
      <PageHero eyebrow="Technical library" title="Catalogues and product resources" description="Access the latest application guides, cross-references, and technical documents for the Mutsimoto filter range." crumbs={[{ label: "Home", href: "/" }, { label: "Downloads" }]} />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="mb-9 flex items-start gap-3 rounded-2xl border border-[#cfe3df] bg-[#eaf4f1] p-5 text-sm leading-6 text-[#526a68]"><Download className="mt-0.5 size-5 shrink-0 text-[#2f8178]" /><p>These are prototype download entries. Until the final PDFs are uploaded, each action opens a pre-filled request form so customers never reach a broken file.</p></div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{downloads.map((resource, index) => <article key={resource.id} className={`group flex min-h-[290px] flex-col rounded-[24px] border p-7 shadow-[0_8px_30px_rgba(7,23,43,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(7,23,43,0.09)] ${index % 2 === 0 ? "border-[#efddd4] bg-[#fffaf6]" : "border-[#d2e4e0] bg-[#f7fcfb]"}`}><div className="flex items-start justify-between"><span className={`grid size-12 place-items-center rounded-2xl ${index % 2 === 0 ? "bg-[#ffe6df] text-[#d51f2a]" : "bg-[#dceeea] text-[#2f8178]"}`}><FileText className="size-5" /></span><span className="rounded-full border border-[#dce2e9] px-2.5 py-1 font-mono text-[10px] font-bold text-[#667286]">{resource.type}</span></div><h2 className="mt-7 text-xl font-extrabold tracking-[-0.025em] text-[#07172b]">{resource.title}</h2><p className="mt-3 text-sm leading-6 text-[#68768a]">{resource.description}</p><div className="mt-auto flex items-center justify-between border-t border-[#e7ebef] pt-5"><span className="text-[10px] font-bold text-[#87919e]">{resource.fileSize}</span><Link href={resource.requestUrl} className="inline-flex items-center gap-1.5 text-sm font-bold text-[#07172b] group-hover:text-[#d51f2a]">Request PDF <ArrowRight className="size-4" /></Link></div></article>)}</div>
      </section>
      <CallToAction eyebrow="Document support" title="Need a data sheet for a specific part?" description="Tell us the Mutsimoto or OEM part number and our team will send the relevant technical document." primaryLabel="Request a Data Sheet" primaryHref="/contact?subject=Technical%20data%20sheet" />
    </>
  );
}
