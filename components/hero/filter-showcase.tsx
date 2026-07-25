import Image from "next/image";
import type { CSSProperties } from "react";

interface ShowcaseProduct {
  src: string;
  alt: string;
  animationDelay: string;
}

const products: readonly ShowcaseProduct[] = [
  {
    src: "/images/hero-filters/filter-guard-oil-fuel.png",
    alt: "Filter Guard FGL-3349 and FGF-1280 filtration products",
    animationDelay: "0s",
  },
  {
    src: "/images/hero-filters/air-oil-fuel-set.png",
    alt: "Heavy-duty air, oil, and fuel filtration products",
    animationDelay: "-9s",
  },
  {
    src: "/images/hero-filters/air-oil-filter-set.png",
    alt: "Yellow air cartridges and Powerfilter oil filter products",
    animationDelay: "-18s",
  },
] as const;

export function FilterShowcase({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`filter-showcase${compact ? " filter-showcase--compact" : ""}`} aria-label="Rotating Mutsimoto filtration product showcase">
      <div className="filter-showcase__spotlight" aria-hidden="true" />
      <div className="filter-showcase__datum" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="filter-showcase__products">
        {products.map((product, index) => (
          <figure
            key={product.src}
            className="filter-showcase__product"
            style={{ "--showcase-delay": product.animationDelay } as CSSProperties}
          >
            <Image
              src={product.src}
              alt={product.alt}
              width={3649}
              height={2739}
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 66vw, 540px"
              className="h-auto w-full object-contain"
              priority={index === 0}
            />
          </figure>
        ))}
      </div>
      <div className="filter-showcase__ground" aria-hidden="true" />
      <p className="filter-showcase__caption" aria-hidden="true">
        <span>01—03</span>
        Product range rotation
      </p>
    </div>
  );
}
