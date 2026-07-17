import type { ProductSpecification } from "@/types";

export function SpecificationsTable({ specifications }: { specifications: ProductSpecification[] }) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-[#dce3ea] shadow-[0_8px_25px_rgba(7,23,43,0.04)]">
      <table className="w-full border-collapse text-left text-sm"><caption className="sr-only">Technical specifications</caption><tbody>{specifications.map((specification, index) => <tr key={specification.label} className={index % 2 === 0 ? "bg-[#f5f7f8]" : "bg-white"}><th scope="row" className="w-1/2 border-r border-[#d5dbe2] px-4 py-3.5 font-bold text-[#3f4d61]">{specification.label}</th><td className="px-4 py-3.5 font-mono text-[#0b1b31]">{specification.value}</td></tr>)}</tbody></table>
    </div>
  );
}
