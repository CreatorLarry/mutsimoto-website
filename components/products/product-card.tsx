import Link from "next/link";
import { ArrowRight, MessageSquareText } from "lucide-react";
import { FilterVisual } from "@/components/ui/filter-visual";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card group flex h-full flex-col overflow-hidden rounded-md border border-[#353d43] bg-[#14191d] shadow-[0_10px_24px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 hover:border-[#ef3340] hover:shadow-[0_20px_48px_rgba(0,0,0,0.42)] sm:rounded-lg sm:shadow-[0_14px_34px_rgba(0,0,0,0.28)]">
      <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`} className="block aspect-[4/3] overflow-hidden border-b border-[#353d43] bg-[#171c20] sm:aspect-square"><FilterVisual category={product.category} compact imageSrc={product.image} /></Link>
      <div className="flex flex-1 flex-col p-3 sm:p-6">
        <div className="flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <span className="max-w-full truncate border-l-2 border-[#ef3340] bg-[#232a30] px-2 py-0.5 text-[7px] font-extrabold uppercase tracking-[0.1em] text-[#f4f5f5] sm:px-2.5 sm:py-1 sm:text-[9px] sm:tracking-[0.14em]">{product.category}</span>
          <span className="font-mono text-[10px] font-bold tracking-[0.05em] text-[#ef3340] sm:text-xs sm:tracking-[0.08em]">{product.partNumber}</span>
        </div>
        <h3 className="mt-2 line-clamp-2 text-sm font-extrabold uppercase leading-[1.15] tracking-[-0.015em] text-white sm:mt-4 sm:text-xl sm:leading-[1.04] sm:tracking-[-0.025em]"><Link href={`/products/${product.slug}`} className="transition-colors hover:text-[#ef3340]">{product.name}</Link></h3>
        <p className="mt-3 hidden text-sm leading-6 text-[#b9bec2] sm:block">{product.shortDescription}</p>
        <p className="mt-3 line-clamp-2 border-t border-[#353d43] pt-2 text-[9px] font-semibold uppercase leading-4 tracking-[0.04em] text-[#c9cdd0] sm:mt-5 sm:pt-4 sm:text-xs sm:leading-normal sm:tracking-[0.06em]">
          <span className="sm:hidden">{product.equipmentTypes.slice(0, 1).join(" · ")}</span>
          <span className="hidden sm:inline">{product.equipmentTypes.slice(0, 2).join(" · ")}</span>
        </p>
        <div className="mt-auto grid grid-cols-[1fr_44px] gap-1.5 pt-3 sm:grid-cols-2 sm:gap-2 sm:pt-5">
          <Link href={`/products/${product.slug}`} className="inline-flex min-h-11 items-center justify-center gap-1 rounded-md border border-[#ef3340] bg-[#d92734] px-2 text-[9px] font-extrabold uppercase tracking-[0.04em] text-white transition-all hover:bg-[#bd202c] hover:shadow-[0_8px_22px_rgba(239,51,64,0.22)] sm:gap-1.5 sm:px-3 sm:text-[11px] sm:tracking-[0.05em]"><span className="sm:hidden">View</span><span className="hidden sm:inline">View details</span> <ArrowRight className="hidden size-3.5 sm:block" /></Link>
          <Link href={`/contact?type=product&part=${product.partNumber}`} aria-label={`Enquire about ${product.name}`} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-[#697177] bg-[#11161a] px-2 text-[9px] font-extrabold uppercase tracking-[0.04em] text-white transition-colors hover:border-white hover:bg-[#232a30] sm:px-3 sm:text-[11px] sm:tracking-[0.05em]"><MessageSquareText className="size-3.5" /><span className="hidden sm:inline">Enquire</span></Link>
        </div>
      </div>
    </article>
  );
}
