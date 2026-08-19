import { SearchX } from "lucide-react";
import { FilterRequestForm } from "@/components/contact/filter-request-form";

export function EmptySearchState({ onReset, initialQuery = "" }: { onReset?: () => void; initialQuery?: string }) {
  return (
    <div className="space-y-5">
      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-[#535b61] bg-[#14191d] px-6 text-center">
        <span className="grid size-14 place-items-center rounded-md border border-[#535b61] bg-[#232a30] text-[#ef3340] shadow-sm"><SearchX className="size-6" aria-hidden="true" /></span>
        <h3 className="mt-5 text-xl font-black uppercase text-white">No filters matched your search</h3>
        <p className="mt-2 max-w-lg text-sm leading-6 text-[#b9bec2]">Try another reference or send the technical team the details you have. They can identify, cross-reference, or assess a custom filter.</p>
        {onReset && <button type="button" onClick={onReset} className="button-dark mt-5">Clear all filters</button>}
      </div>
      <FilterRequestForm initialQuery={initialQuery} />
    </div>
  );
}
