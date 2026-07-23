import { SearchX } from "lucide-react";

export function EmptySearchState({ onReset }: { onReset?: () => void }) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-dashed border-[#535b61] bg-[#14191d] px-6 text-center">
      <span className="grid size-14 place-items-center rounded-md border border-[#535b61] bg-[#232a30] text-[#ef3340] shadow-sm"><SearchX className="size-6" aria-hidden="true" /></span>
      <h3 className="mt-5 text-xl font-black uppercase text-white">No filters matched your search</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#b9bec2]">Try a different part number, OEM reference, vehicle, engine, or remove one of the selected filters.</p>
      {onReset && <button type="button" onClick={onReset} className="button-dark mt-5">Clear all filters</button>}
    </div>
  );
}
