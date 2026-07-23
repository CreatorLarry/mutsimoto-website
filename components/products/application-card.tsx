import Link from "next/link";
import { ArrowUpRight, CarFront, Construction, Factory, Tractor, Truck, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Application } from "@/types";

const icons: Record<string, LucideIcon> = { passenger: CarFront, commercial: Truck, construction: Construction, agriculture: Tractor, generators: Zap, industrial: Factory };

export function ApplicationCard({ application }: { application: Application }) {
  const Icon = icons[application.id] ?? Factory;
  const applicationType = ["Industrial", "Construction", "Agriculture", "Power generation"].includes(application.group) ? "Industrial" : "Automotive";
  return (
    <Link href={`/products?application=${applicationType}&equipment=${encodeURIComponent(application.equipmentTypes[0])}`} className="group flex min-h-52 flex-col rounded-lg border border-[#353d43] bg-[#171c20] p-6 shadow-[0_10px_28px_rgba(0,0,0,0.24)] transition-all hover:-translate-y-1 hover:border-[#697177] hover:bg-[#1d2327] hover:shadow-[0_18px_42px_rgba(0,0,0,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef3340]">
      <div className="flex items-start justify-between"><span className="grid size-12 place-items-center rounded-md border border-[#535b61] bg-[#232a30] text-[#ef3340] transition-all group-hover:border-[#ef3340] group-hover:bg-[#ef3340] group-hover:text-white"><Icon className="size-5" /></span><ArrowUpRight className="size-5 text-[#8f979c] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#ef3340]" /></div>
      <h3 className="mt-6 text-lg font-extrabold uppercase tracking-[-0.015em] text-white">{application.name}</h3>
      <p className="mt-2 text-sm leading-6 text-[#b9bec2]">{application.description}</p>
    </Link>
  );
}
