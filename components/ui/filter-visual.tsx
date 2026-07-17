import { cn } from "@/lib/cn";
import type { FilterCategory } from "@/types";

interface FilterVisualProps {
  category: FilterCategory;
  compact?: boolean;
  dark?: boolean;
}

export function FilterVisual({ category, compact = false, dark = false }: FilterVisualProps) {
  const isAir = category === "Air Filters";
  const isFuel = category === "Fuel Filters";
  const lightStage = isAir ? "bg-[#cfe9e3]" : isFuel ? "bg-[#ffe6b8]" : "bg-[#ffd9d4]";

  return (
    <div className={cn("filter-stage relative grid overflow-hidden", compact ? "h-48" : "h-full min-h-72", dark ? "bg-[#09172a]" : lightStage)} aria-label={`${category} product visual`} role="img">
      <div className={cn("absolute left-5 top-5 font-mono text-[10px] font-bold uppercase tracking-[0.18em]", dark ? "text-[#b9c7d8]" : "text-[#3e5065]")}>Mutsimoto engineered filtration</div>
      <div className={cn("absolute bottom-5 right-5 font-mono text-[10px] font-bold", dark ? "text-[#b9c7d8]" : "text-[#3e5065]")}>{isAir ? "AIR / INTAKE" : isFuel ? "FUEL / SYSTEM" : "OIL / ENGINE"}</div>
      {isAir ? (
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
