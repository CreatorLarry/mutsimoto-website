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
            const warm = index % 2 === 0;
            return (
              <article key={application.id} className={`group flex min-h-[330px] flex-col rounded-[24px] border p-7 shadow-[0_8px_30px_rgba(7,23,43,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(7,23,43,0.09)] ${warm ? "border-[#f0dfc1] bg-[#fffaf0] hover:border-[#e5a93f]" : "border-[#cfe3df] bg-[#f4fbf9] hover:border-[#2f8178]"}`}>
                <div className="flex items-start justify-between"><span className={`grid size-12 place-items-center rounded-2xl ${warm ? "bg-[#f2d9a9] text-[#8f5d12]" : "bg-[#d8ebe7] text-[#246e66]"}`}><Icon className="size-5" /></span><span className="font-mono text-xs font-bold text-[#9aa3ae]">0{index + 1}</span></div>
                <p className="mt-8 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#d51f2a]">{application.group}</p><h2 className="mt-3 text-2xl font-extrabold tracking-[-0.03em] text-[#07172b]">{application.name}</h2><p className="mt-3 text-sm leading-6 text-[#68768a]">{application.description}</p><p className="mt-5 text-xs font-semibold text-[#526176]">Typical equipment: {application.equipmentTypes.join(" · ")}</p>
                <Link href={`/products?application=${applicationType}&equipment=${encodeURIComponent(application.equipmentTypes[0])}`} className="mt-auto inline-flex items-center gap-2 pt-7 text-sm font-bold text-[#07172b] group-hover:text-[#d51f2a]">Browse matching filters <ArrowRight className="size-4" /></Link>
              </article>
            );
          })}
        </div>
      </section>
      <CallToAction title="Your application is not listed?" description="Send the equipment make, model, engine, and any existing filter reference. Our technical team will help identify the right match." />
    </>
  );
}
