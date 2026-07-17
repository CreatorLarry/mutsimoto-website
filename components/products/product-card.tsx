import Link from "next/link";
import { ArrowRight, MessageSquareText } from "lucide-react";
import { FilterVisual } from "@/components/ui/filter-visual";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-[#e6ddd5] bg-[#fffdf9] shadow-[0_8px_28px_rgba(7,23,43,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-[#c7d0db] hover:shadow-[0_18px_45px_rgba(7,23,43,0.1)]">
      <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`} className="overflow-hidden"><FilterVisual category={product.category} compact /></Link>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-4">
          <span className="rounded-full bg-[#fff0f1] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#d51f2a]">{product.category}</span>
          <span className="font-mono text-xs font-bold text-[#718095]">{product.partNumber}</span>
        </div>
        <h3 className="mt-4 text-xl font-extrabold tracking-[-0.03em] text-[#07172b]"><Link href={`/products/${product.slug}`} className="transition-colors hover:text-[#d51f2a]">{product.name}</Link></h3>
        <p className="mt-3 text-sm leading-6 text-[#68768a]">{product.shortDescription}</p>
        <p className="mt-5 border-t border-[#edf0f3] pt-4 text-xs font-semibold text-[#516176]">{product.equipmentTypes.slice(0, 2).join(" · ")}</p>
        <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
          <Link href={`/products/${product.slug}`} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-[#07172b] px-3 text-xs font-bold text-white transition-all hover:bg-[#d51f2a]">View details <ArrowRight className="size-3.5" /></Link>
          <Link href={`/contact?type=product&part=${product.partNumber}`} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-[#d9e0e8] px-3 text-xs font-bold text-[#07172b] transition-colors hover:border-[#9aa8b8] hover:bg-[#f5f7fa]"><MessageSquareText className="size-3.5" /> Enquire</Link>
        </div>
      </div>
    </article>
  );
}
