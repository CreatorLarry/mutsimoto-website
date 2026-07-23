import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CarFront, Construction, Factory, Tractor, Truck, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CallToAction } from "@/components/ui/call-to-action";
import { PageHero } from "@/components/ui/page-hero";
import { applications } from "@/data/applications";

export const metadata: Metadata = { title: "Applications", description: "Browse Mutsimoto filters for automotive, commercial, construction, agriculture, industrial, and power generation applications." };

const groupIcons: Record<string, LucideIcon> = { Automotive: CarFront, Commercial: Truck, Construction, Agriculture: Tractor, Industrial: Factory, "Power generation": Zap };

export default function ApplicationsPage() {
  return (
    <>
      <PageHero eyebrow="Application coverage" title="Filtration for every operating environment" description="Browse the catalogue by the vehicle, machinery, or power equipment you need to protect." crumbs={[{ label: "Home", href: "/" }, { label: "Applications" }]} />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((application, index) => {
            const Icon = groupIcons[application.group] ?? Factory;
            const applicationType = ["Industrial", "Construction", "Agriculture", "Power generation"].includes(application.group) ? "Industrial" : "Automotive";
            return (
              <article key={application.id} className="group flex min-h-[330px] flex-col rounded-lg border border-[#353d43] bg-[#14191d] p-7 shadow-[0_12px_32px_rgba(0,0,0,0.25)] transition-all hover:-translate-y-1 hover:border-[#697177] hover:bg-[#171c20] hover:shadow-[0_20px_46px_rgba(0,0,0,0.4)]">
                <div className="flex items-start justify-between"><span className="grid size-12 place-items-center rounded-md border border-[#535b61] bg-[#232a30] text-[#ef3340] transition-colors group-hover:border-[#ef3340]"><Icon className="size-5" /></span><span className="font-mono text-xs font-bold text-[#697177]">0{index + 1}</span></div>
                <p className="mt-8 font-mono text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#ef3340]">{application.group}</p><h2 className="mt-3 text-2xl font-extrabold uppercase tracking-[-0.025em] text-white">{application.name}</h2><p className="mt-3 text-sm leading-6 text-[#b9bec2]">{application.description}</p><p className="mt-5 text-xs font-semibold text-[#c9cdd0]">Typical equipment: {application.equipmentTypes.join(" · ")}</p>
                <Link href={`/products?application=${applicationType}&equipment=${encodeURIComponent(application.equipmentTypes[0])}`} className="mt-auto inline-flex items-center gap-2 pt-7 text-xs font-extrabold uppercase tracking-[0.06em] text-white group-hover:text-[#ef3340]">Browse matching filters <ArrowRight className="size-4" /></Link>
              </article>
            );
          })}
        </div>
      </section>
      <CallToAction title="Your application is not listed?" description="Send the equipment make, model, engine, and any existing filter reference. Our technical team will help identify the right match." />
    </>
  );
}
