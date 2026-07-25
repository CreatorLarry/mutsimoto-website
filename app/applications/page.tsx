import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CarFront, Construction, Factory, Tractor, Truck, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CallToAction } from "@/components/ui/call-to-action";
import { PageHero } from "@/components/ui/page-hero";
import { applicationMedia } from "@/data/application-media";
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
            const image = applicationMedia[application.id] ?? applicationMedia.industrial;
            return (
              <article key={application.id} className="group flex min-h-[500px] flex-col overflow-hidden rounded-lg border border-[#353d43] bg-[#14191d] shadow-[0_14px_36px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-1 hover:border-[#697177] hover:shadow-[0_24px_56px_rgba(0,0,0,0.48)]">
                <div className="relative aspect-[16/9] overflow-hidden border-b border-[#353d43] bg-[#0d1114]">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                    className="object-cover saturate-[.72] transition duration-500 ease-out group-hover:scale-[1.035] group-hover:saturate-100"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,11,13,0.02)_18%,rgba(8,11,13,0.74)_100%)]" aria-hidden="true" />
                  <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,#ef3340,rgba(239,51,64,0.08)_38%,transparent)]" aria-hidden="true" />
                  <span className="absolute bottom-4 left-5 grid size-12 place-items-center rounded-md border border-[#697177] bg-[#14191d]/95 text-[#ef3340] shadow-[0_10px_24px_rgba(0,0,0,0.36)] transition-colors group-hover:border-[#ef3340] group-hover:bg-[#ef3340] group-hover:text-white"><Icon className="size-5" /></span>
                  <span className="absolute right-4 top-4 rounded-md border border-white/15 bg-[#0d1114]/85 px-3 py-2 font-mono text-[10px] font-bold tracking-[0.12em] text-[#c9cdd0] backdrop-blur-sm">0{index + 1}</span>
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <p className="font-mono text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#ef3340]">{application.group} application</p>
                  <h2 className="mt-3 text-2xl font-extrabold uppercase tracking-[-0.025em] text-white">{application.name}</h2>
                  <p className="mt-3 text-sm leading-6 text-[#b9bec2]">{application.description}</p>
                  <p className="mt-5 border-l-2 border-[#535b61] pl-4 text-xs font-semibold leading-5 text-[#c9cdd0]"><span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#8f979c]">Typical equipment</span><br />{application.equipmentTypes.join(" · ")}</p>
                  <Link href={`/products?application=${applicationType}&equipment=${encodeURIComponent(application.equipmentTypes[0])}`} className="mt-auto inline-flex items-center gap-2 pt-7 text-xs font-extrabold uppercase tracking-[0.06em] text-white transition-colors group-hover:text-[#ef3340] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef3340]">Browse matching filters <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <CallToAction title="Your application is not listed?" description="Send the equipment make, model, engine, and any existing filter reference. Our technical team will help identify the right match." />
    </>
  );
}
