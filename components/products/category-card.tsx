import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/types";

const imageClasses: Record<string, string> = {
  "oil-element": "object-cover object-[67%_center] group-hover:scale-[1.035]",
  "oil-spin-on": "object-cover object-center group-hover:scale-[1.035]",
  "fuel-elements": "object-cover object-[62%_center] group-hover:scale-[1.035]",
  "fuel-spin-on": "object-cover object-center group-hover:scale-[1.035]",
  "air-cleaners": "object-contain scale-[1.55] group-hover:scale-[1.61]",
};

export function CategoryCard({ category }: { category: Category }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-t-[3px] border-[#353d43] border-t-[#ef3340] bg-[#14191d] shadow-[0_14px_34px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-[#697177] hover:border-t-[#ef3340] hover:shadow-[0_20px_48px_rgba(0,0,0,0.4)]">
      <div className="relative h-48 overflow-hidden border-b border-[#353d43] bg-[#e5e7e8]">
        <Image
          src={category.image}
          alt={`${category.name} filtration product family`}
          fill
          sizes="(max-width: 639px) 50vw, (max-width: 1279px) 50vw, 20vw"
          className={`transition-transform duration-500 ease-out ${imageClasses[category.slug]}`}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_58%,rgba(10,14,17,0.22)_100%)]" aria-hidden="true" />
      </div>
      <div className="p-7">
        <p className="font-mono text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#ef3340]">Product family</p>
        <h3 className="mt-3 text-2xl font-extrabold uppercase tracking-[-0.025em] text-white">{category.name}</h3>
        <p className="mt-3 text-sm leading-6 text-[#b9bec2]">{category.description}</p>
        <Link href={`/products?category=${encodeURIComponent(category.name)}`} className="mt-6 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.08em] text-white transition-colors group-hover:text-[#ef3340]">Explore range <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Link>
      </div>
    </article>
  );
}
