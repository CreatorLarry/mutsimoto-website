import Image from "next/image";
import { cn } from "@/lib/cn";
import type { FilterCategory } from "@/types";

interface FilterVisualProps {
  category: FilterCategory;
  compact?: boolean;
  dark?: boolean;
  imageSrc?: string | null;
  imageAlt?: string;
  className?: string;
}

export function FilterVisual({ category, compact = false, dark = false, imageSrc, imageAlt, className }: FilterVisualProps) {
  const isAir = category === "Air Cleaners";
  const isFuel = category === "Fuel Elements" || category === "Fuel Spin On";
  const isElement = category === "Oil Element" || category === "Fuel Elements";
  const lightStage = isAir ? "bg-[#242b30]" : isFuel ? "bg-[#1d2327]" : "bg-[#171c20]";
  const hasRenderableImage = Boolean(imageSrc && (imageSrc.startsWith("/") || imageSrc.startsWith("http")));
  const imagePosition = imageSrc?.includes("front")
    ? "center 56%"
    : imageSrc?.includes("side")
      ? "center 54%"
      : "center center";

  if (hasRenderableImage) {
    return (
      <div className={cn("relative isolate grid h-full min-h-0 w-full overflow-hidden bg-[#dfe4e7]", className)}>
        <Image
          src={imageSrc as string}
          alt=""
          fill
          sizes={compact ? "(max-width: 640px) 50vw, 33vw" : "(max-width: 1024px) 100vw, 50vw"}
          className="scale-110 object-cover opacity-30 blur-2xl saturate-75"
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(135deg,rgba(255,255,255,0.82),rgba(224,229,232,0.54)_48%,rgba(255,255,255,0.76))]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-3 z-[2] border border-white/60 shadow-[inset_0_0_32px_rgba(52,63,72,0.08)] sm:inset-4" aria-hidden="true" />
        <div className={cn("absolute z-[3]", compact ? "inset-[2%] sm:inset-[3%]" : "inset-[3%] sm:inset-[4%]")}>
          <Image
            src={imageSrc as string}
            alt={imageAlt ?? `${category} product image`}
            fill
            sizes={compact ? "(max-width: 640px) 50vw, 33vw" : "(max-width: 1024px) 100vw, 50vw"}
            className="object-contain drop-shadow-[0_18px_18px_rgba(19,29,38,0.2)] transition-transform duration-500 group-hover:scale-[1.01]"
            style={{ objectPosition: imagePosition }}
          />
        </div>
        <div className="pointer-events-none absolute inset-x-[12%] bottom-[3%] z-[2] h-[7%] rounded-[50%] bg-[#1a2025]/20 blur-xl" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className={cn("filter-stage relative grid h-full min-h-0 w-full overflow-hidden", dark ? "bg-[#0d1114]" : lightStage, className)} aria-label={`${category} product visual`} role="img">
      <div className={cn("absolute left-5 top-5 border-l-2 border-[#ef3340] pl-2 font-mono text-[9px] font-bold uppercase tracking-[0.18em]", dark ? "text-[#c9cdd0]" : "text-[#e1e3e4]")}>Mutsimoto engineered filtration</div>
      <div className={cn("absolute bottom-5 right-5 font-mono text-[9px] font-bold tracking-[0.12em]", dark ? "text-[#c9cdd0]" : "text-[#e1e3e4]")}>{isAir ? "AIR / INTAKE" : isFuel ? "FUEL / SYSTEM" : "OIL / ENGINE"}</div>
      {isAir || isElement ? (
        <div className={cn("filter-air place-self-center", compact && "scale-75")}>
          <div className="filter-air-pleats" />
        </div>
      ) : (
        <div className={cn("filter-canister place-self-center", isFuel && "filter-canister-fuel", compact && "scale-75")}>
          <div className="filter-canister-top" />
          <div className="filter-canister-label"><span>MUTSIMOTO</span><small>{isFuel ? "FUEL" : "OIL"} FILTER</small></div>
          <div className="filter-canister-base" />
        </div>
      )}
    </div>
  );
}
