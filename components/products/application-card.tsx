import Link from "next/link";
import { ArrowUpRight, CarFront, Construction, Factory, Tractor, Truck, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Application } from "@/types";

const icons: Record<string, LucideIcon> = { passenger: CarFront, commercial: Truck, construction: Construction, agriculture: Tractor, generators: Zap, industrial: Factory };

export function ApplicationCard({ application }: { application: Application }) {
  const Icon = icons[application.id] ?? Factory;
  const applicationType = ["Industrial", "Construction", "Agriculture", "Power generation"].includes(application.group) ? "Industrial" : "Automotive";
  const warm = ["commercial", "construction", "generators"].includes(application.id);
  return (
    <Link href={`/products?application=${applicationType}&equipment=${encodeURIComponent(application.equipmentTypes[0])}`} className={`group flex min-h-52 flex-col rounded-[22px] border p-6 shadow-[0_6px_24px_rgba(7,23,43,0.035)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_38px_rgba(7,23,43,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e52833] ${warm ? "border-[#f0dfc1] bg-[#fffaf0] hover:border-[#e5a93f]" : "border-[#cfe3df] bg-[#f7fcfb] hover:border-[#2f8178]"}`}>
      <div className="flex items-start justify-between"><span className={`grid size-12 place-items-center rounded-2xl transition-all group-hover:bg-[#07172b] group-hover:text-white ${warm ? "bg-[#f9e8c8] text-[#9b6515]" : "bg-[#dceeea] text-[#246e66]"}`}><Icon className="size-5" /></span><ArrowUpRight className="size-5 text-[#a0aab6] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#e52833]" /></div>
      <h3 className="mt-6 text-lg font-extrabold tracking-[-0.02em] text-[#07172b]">{application.name}</h3>
      <p className="mt-2 text-sm leading-6 text-[#68768a]">{application.description}</p>
    </Link>
  );
}
