import { cn } from "@/lib/cn";

const statusStyles: Record<string, string> = {
  published: "bg-[#e4f4ec] text-[#147347]",
  draft: "bg-[#eef1f5] text-[#5b6879]",
  review: "bg-[#fff1ce] text-[#87610c]",
  archived: "bg-[#f6e8eb] text-[#8d3443]",
  new: "bg-[#e6f2ff] text-[#225d98]",
  follow_up: "bg-[#fff1ce] text-[#87610c]",
  active: "bg-[#e4f4ec] text-[#147347]",
  inactive: "bg-[#f6e8eb] text-[#8d3443]",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em]", statusStyles[status] ?? "bg-[#eef1f5] text-[#5b6879]")}>{status.replaceAll("_", " ")}</span>;
}
