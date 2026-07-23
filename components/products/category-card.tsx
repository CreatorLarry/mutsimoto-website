import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FilterVisual } from "@/components/ui/filter-visual";
import type { Category } from "@/types";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-t-[3px] border-[#353d43] border-t-[#ef3340] bg-[#14191d] shadow-[0_14px_34px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-[#697177] hover:border-t-[#ef3340] hover:shadow-[0_20px_48px_rgba(0,0,0,0.4)]">
      <div className="h-48"><FilterVisual category={category.name} compact /></div>
      <div className="p-7">
        <p className="font-mono text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#ef3340]">Product family</p>
        <h3 className="mt-3 text-2xl font-extrabold uppercase tracking-[-0.025em] text-white">{category.name}</h3>
        <p className="mt-3 text-sm leading-6 text-[#b9bec2]">{category.description}</p>
        <Link href={`/products?category=${encodeURIComponent(category.name)}`} className="mt-6 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.08em] text-white transition-colors group-hover:text-[#ef3340]">Explore range <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Link>
      </div>
    </article>
  );
}
