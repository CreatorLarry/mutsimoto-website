import type { Metadata } from "next";
import { ArrowRight, Download, FileText } from "lucide-react";
import { CallToAction } from "@/components/ui/call-to-action";
import { PageHero } from "@/components/ui/page-hero";
import { getDownloads } from "@/lib/downloads";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Filter Catalogues & Downloads",
  description: "Download Mutsimoto product catalogues, cross-reference guides, and technical resources.",
  path: "/downloads",
});

export default async function DownloadsPage() {
  const downloads = await getDownloads();
  const hasPublishedFiles = downloads.some((resource) => resource.available);

  return (
    <>
      <PageHero eyebrow="Technical library" title="Catalogues and product resources" description="Access the latest application guides, cross-references, and technical documents for the Mutsimoto filter range." crumbs={[{ label: "Home", href: "/" }, { label: "Downloads" }]} />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="mb-9 flex items-start gap-3 rounded-lg border border-[#353d43] border-l-[3px] border-l-[#ef3340] bg-[#171c20] p-5 text-sm leading-6 text-[#c9cdd0]"><Download className="mt-0.5 size-5 shrink-0 text-[#ef3340]" /><p>{hasPublishedFiles ? "Published resources are available as PDF files. Document editions are maintained by the Mutsimoto technical and catalogue teams." : "Catalogue files are being prepared. Request the latest edition and our team will send the correct document."}</p></div>
        {downloads.length > 0 ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{downloads.map((resource) => <article key={resource.id} className="group flex min-h-[290px] flex-col rounded-lg border border-[#353d43] bg-[#14191d] p-7 shadow-[0_12px_32px_rgba(0,0,0,0.25)] transition-all hover:-translate-y-1 hover:border-[#697177] hover:bg-[#171c20] hover:shadow-[0_20px_46px_rgba(0,0,0,0.4)]"><div className="flex items-start justify-between"><span className="grid size-12 place-items-center rounded-md border border-[#535b61] bg-[#232a30] text-[#ef3340]"><FileText className="size-5" /></span><div className="text-right"><span className="rounded-md border border-[#535b61] bg-[#11161a] px-2.5 py-1 font-mono text-[10px] font-bold text-[#d7dadd]">{resource.type}</span><p className="mt-2 text-[9px] font-black uppercase tracking-[0.1em] text-[#8f979c]">{resource.category}</p></div></div><h2 className="mt-7 text-xl font-extrabold uppercase tracking-[-0.02em] text-white">{resource.title}</h2><p className="mt-3 text-sm leading-6 text-[#b9bec2]">{resource.description}</p><div className="mt-auto flex items-center justify-between border-t border-[#353d43] pt-5"><span className="text-[10px] font-bold text-[#8f979c]">{resource.fileSize}</span><a href={resource.actionUrl} target={resource.available ? "_blank" : undefined} rel={resource.available ? "noopener noreferrer" : undefined} className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.05em] text-white group-hover:text-[#ef3340]">{resource.available ? "Download PDF" : "Request PDF"} <ArrowRight className="size-4" /></a></div></article>)}</div> : <div className="rounded-lg border border-[#353d43] bg-[#14191d] px-6 py-16 text-center"><h2 className="text-xl font-black uppercase text-white">The technical library is being prepared</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#b9bec2]">Contact the team with a part number or document request and we will provide the most appropriate current resource.</p><a href="/contact?subject=Catalogue%20or%20technical%20document" className="button-primary mt-6">Request a document</a></div>}
      </section>
      <CallToAction eyebrow="Document support" title="Need a data sheet for a specific part?" description="Tell us the Mutsimoto or OEM part number and our team will send the relevant technical document." primaryLabel="Request a Data Sheet" primaryHref="/contact?subject=Technical%20data%20sheet" />
    </>
  );
}
