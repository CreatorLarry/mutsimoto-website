import { SearchX } from "lucide-react";

export function EmptySearchState({ onReset }: { onReset?: () => void }) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-[24px] border border-dashed border-[#bdc5cf] bg-[#f8fafb] px-6 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-white text-[#c81920] shadow-sm"><SearchX className="size-6" aria-hidden="true" /></span>
      <h3 className="mt-5 text-xl font-black text-[#0b1b31]">No filters matched your search</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#657184]">Try a different part number, OEM reference, vehicle, engine, or remove one of the selected filters.</p>
      {onReset && <button type="button" onClick={onReset} className="button-dark mt-5">Clear all filters</button>}
    </div>
  );
}
