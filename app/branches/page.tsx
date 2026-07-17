import type { Metadata } from "next";
import { Building2, Headset, PackageCheck } from "lucide-react";
import { BranchCard } from "@/components/branches/branch-card";
import { CallToAction } from "@/components/ui/call-to-action";
import { PageHero } from "@/components/ui/page-hero";
import { branches } from "@/data/branches";

export const metadata: Metadata = { title: "Branches", description: "Find Mutsimoto branch locations, opening hours, phone numbers, and WhatsApp contacts." };

export default function BranchesPage() {
  return (
    <>
      <PageHero eyebrow="Branch network" title="Product support closer to your operation" description="Contact a Mutsimoto branch for product availability, application support, dealer enquiries, and collection arrangements." crumbs={[{ label: "Home", href: "/" }, { label: "Branches" }]} />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20"><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{branches.map((branch) => <BranchCard key={branch.id} branch={branch} />)}</div></section>
      <section className="bg-[#eaf4f1]"><div className="mx-auto grid max-w-7xl gap-5 px-5 py-14 sm:px-8 md:grid-cols-3 lg:px-10">{[
        { icon: PackageCheck, title: "Availability checks", text: "Confirm stock and lead times before travelling to a branch." },
        { icon: Headset, title: "Application support", text: "Get help with part numbers, fitment, and OEM cross-references." },
        { icon: Building2, title: "Dealer & fleet service", text: "Discuss recurring requirements and multi-location support." },
      ].map(({ icon: Icon, title, text }, index) => <article key={title} className="flex gap-4 rounded-[20px] border border-[#cee2de] bg-[#f8fcfb] p-5"><span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${index === 1 ? "bg-[#ffe5df] text-[#d51f2a]" : "bg-[#dceeea] text-[#2f8178]"}`}><Icon className="size-5" /></span><div><h2 className="font-extrabold text-[#07172b]">{title}</h2><p className="mt-2 text-sm leading-6 text-[#526176]">{text}</p></div></article>)}</div></section>
      <CallToAction title="Not sure which branch to contact?" description="Send one enquiry and our central team will route it to the right branch or technical specialist." />
    </>
  );
}
