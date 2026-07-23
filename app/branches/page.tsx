import type { Metadata } from "next";
import { Building2, Headset, PackageCheck } from "lucide-react";
import { BranchCard } from "@/components/branches/branch-card";
import { CallToAction } from "@/components/ui/call-to-action";
import { PageHero } from "@/components/ui/page-hero";
import { getBranches } from "@/lib/branches";

export const metadata: Metadata = { title: "Branches", description: "Find Mutsimoto branch locations, opening hours, phone numbers, and WhatsApp contacts." };

export default async function BranchesPage() {
  const branches = await getBranches();
  return (
    <>
      <PageHero eyebrow="Branch network" title="Product support closer to your operation" description="Contact a Mutsimoto branch for product availability, application support, dealer enquiries, and collection arrangements." crumbs={[{ label: "Home", href: "/" }, { label: "Branches" }]} />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20"><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{branches.map((branch) => <BranchCard key={branch.id} branch={branch} />)}</div></section>
      <section className="border-y border-[#353d43] bg-[#0d1114]"><div className="mx-auto grid max-w-7xl gap-5 px-5 py-14 sm:px-8 md:grid-cols-3 lg:px-10">{[
        { icon: PackageCheck, title: "Availability checks", text: "Confirm stock and lead times before travelling to a branch." },
        { icon: Headset, title: "Application support", text: "Get help with part numbers, fitment, and OEM cross-references." },
        { icon: Building2, title: "Dealer & fleet service", text: "Discuss recurring requirements and multi-location support." },
      ].map(({ icon: Icon, title, text }) => <article key={title} className="flex gap-4 rounded-lg border border-[#353d43] bg-[#14191d] p-5"><span className="grid size-11 shrink-0 place-items-center rounded-md border border-[#535b61] bg-[#232a30] text-[#ef3340]"><Icon className="size-5" /></span><div><h2 className="font-extrabold uppercase text-white">{title}</h2><p className="mt-2 text-sm leading-6 text-[#b9bec2]">{text}</p></div></article>)}</div></section>
      <CallToAction title="Not sure which branch to contact?" description="Send one enquiry and our central team will route it to the right branch or technical specialist." />
    </>
  );
}
