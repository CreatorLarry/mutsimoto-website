import type { ProductSpecification } from "@/types";

export function SpecificationsTable({ specifications }: { specifications: ProductSpecification[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#353d43] shadow-[0_12px_32px_rgba(0,0,0,0.28)]">
      <table className="w-full border-collapse text-left text-sm"><caption className="sr-only">Technical specifications</caption><tbody>{specifications.map((specification, index) => <tr key={specification.label} className={index % 2 === 0 ? "bg-[#171c20]" : "bg-[#11161a]"}><th scope="row" className="w-1/2 border-r border-[#353d43] px-4 py-3.5 font-bold uppercase tracking-[0.04em] text-[#c9cdd0]">{specification.label}</th><td className="px-4 py-3.5 font-mono font-bold text-white">{specification.value}</td></tr>)}</tbody></table>
    </div>
  );
}
