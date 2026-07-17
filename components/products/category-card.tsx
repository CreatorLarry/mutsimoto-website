import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FilterVisual } from "@/components/ui/filter-visual";
import type { Category } from "@/types";

export function CategoryCard({ category }: { category: Category }) {
  const accent = category.name === "Air Filters" ? "border-t-[#2f8178] bg-[#fbfffd]" : category.name === "Fuel Filters" ? "border-t-[#e5a93f] bg-[#fffdf7]" : "border-t-[#e52833] bg-[#fffaf8]";

  return (
    <article className={`group overflow-hidden rounded-[26px] border border-t-4 border-[#e0e6ed] ${accent} shadow-[0_10px_35px_rgba(7,23,43,0.045)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(7,23,43,0.1)]`}>
      <FilterVisual category={category.name} compact />
      <div className="p-7">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#d51f2a]">Product family</p>
        <h3 className="mt-3 text-2xl font-extrabold tracking-[-0.03em] text-[#07172b]">{category.name}</h3>
        <p className="mt-3 text-sm leading-6 text-[#526176]">{category.description}</p>
        <Link href={`/products?category=${encodeURIComponent(category.name)}`} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#07172b] transition-colors group-hover:text-[#d51f2a]">Explore range <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Link>
      </div>
    </article>
  );
}
