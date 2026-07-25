import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CarFront, Construction, Factory, Tractor, Truck, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { applicationMedia } from "@/data/application-media";
import type { Application } from "@/types";

const icons: Record<string, LucideIcon> = { passenger: CarFront, commercial: Truck, construction: Construction, agriculture: Tractor, generators: Zap, industrial: Factory };

export function ApplicationCard({ application }: { application: Application }) {
  const Icon = icons[application.id] ?? Factory;
  const applicationType = ["Industrial", "Construction", "Agriculture", "Power generation"].includes(application.group) ? "Industrial" : "Automotive";
  const image = applicationMedia[application.id] ?? applicationMedia.industrial;

  return (
    <Link href={`/products?application=${applicationType}&equipment=${encodeURIComponent(application.equipmentTypes[0])}`} className="group flex min-h-[370px] flex-col overflow-hidden rounded-lg border border-[#353d43] bg-[#171c20] shadow-[0_14px_34px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-1 hover:border-[#697177] hover:shadow-[0_24px_54px_rgba(0,0,0,0.48)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef3340]">
      <div className="relative aspect-[16/9] overflow-hidden border-b border-[#353d43] bg-[#0d1114]">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover saturate-[.72] transition duration-500 ease-out group-hover:scale-[1.035] group-hover:saturate-100"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,11,13,0.04)_20%,rgba(8,11,13,0.7)_100%)]" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,#ef3340,rgba(239,51,64,0.08)_38%,transparent)]" aria-hidden="true" />
        <span className="absolute bottom-4 left-5 grid size-11 place-items-center rounded-md border border-[#697177] bg-[#14191d]/95 text-[#ef3340] shadow-[0_10px_24px_rgba(0,0,0,0.36)] transition-all group-hover:border-[#ef3340] group-hover:bg-[#ef3340] group-hover:text-white"><Icon className="size-5" /></span>
        <span className="absolute right-4 top-4 grid size-10 place-items-center rounded-md border border-white/15 bg-[#0d1114]/80 text-[#c9cdd0] backdrop-blur-sm transition-all group-hover:border-[#ef3340] group-hover:text-white"><ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[#ef3340]">{application.group} application</p>
        <h3 className="mt-3 text-lg font-extrabold uppercase tracking-[-0.015em] text-white">{application.name}</h3>
        <p className="mt-2 text-sm leading-6 text-[#b9bec2]">{application.description}</p>
        <span className="mt-auto pt-5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#c9cdd0] transition-colors group-hover:text-white">View compatible filters</span>
      </div>
    </Link>
  );
}
