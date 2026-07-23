import Link from "next/link";
import { ArrowRight, MessageSquareText } from "lucide-react";
import { FilterVisual } from "@/components/ui/filter-visual";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-[#353d43] bg-[#14191d] shadow-[0_14px_34px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-[#ef3340] hover:shadow-[0_20px_48px_rgba(0,0,0,0.42)]">
      <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`} className="block aspect-square overflow-hidden border-b border-[#353d43] bg-[#171c20]"><FilterVisual category={product.category} compact imageSrc={product.image} /></Link>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-4">
          <span className="border-l-2 border-[#ef3340] bg-[#232a30] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#f4f5f5]">{product.category}</span>
          <span className="font-mono text-xs font-bold tracking-[0.08em] text-[#ef3340]">{product.partNumber}</span>
        </div>
        <h3 className="mt-4 text-xl font-extrabold uppercase tracking-[-0.025em] text-white"><Link href={`/products/${product.slug}`} className="transition-colors hover:text-[#ef3340]">{product.name}</Link></h3>
        <p className="mt-3 text-sm leading-6 text-[#b9bec2]">{product.shortDescription}</p>
        <p className="mt-5 border-t border-[#353d43] pt-4 text-xs font-semibold uppercase tracking-[0.06em] text-[#c9cdd0]">{product.equipmentTypes.slice(0, 2).join(" · ")}</p>
        <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
          <Link href={`/products/${product.slug}`} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-[#ef3340] bg-[#d92734] px-3 text-[11px] font-extrabold uppercase tracking-[0.05em] text-white transition-all hover:bg-[#bd202c] hover:shadow-[0_8px_22px_rgba(239,51,64,0.22)]">View details <ArrowRight className="size-3.5" /></Link>
          <Link href={`/contact?type=product&part=${product.partNumber}`} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-[#697177] bg-[#11161a] px-3 text-[11px] font-extrabold uppercase tracking-[0.05em] text-white transition-colors hover:border-white hover:bg-[#232a30]"><MessageSquareText className="size-3.5" /> Enquire</Link>
        </div>
      </div>
    </article>
  );
}
