import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: "navy" | "red" | "green" | "amber";
  href?: string;
}

const tones = {
  navy: "bg-[#eaf0f6] text-[#173b61]",
  red: "bg-[#fff0f1] text-[#d51f2a]",
  green: "bg-[#e8f4ef] text-[#28765b]",
  amber: "bg-[#fff3d8] text-[#8a6209]",
};

export function StatCard({ label, value, icon: Icon, tone = "navy", href }: StatCardProps) {
  const content = <><div className={`grid size-11 place-items-center rounded-2xl ${tones[tone]}`}><Icon className="size-5" /></div><p className="mt-5 text-3xl font-black tracking-[-0.04em] text-[#07172b]">{value.toLocaleString()}</p><p className="mt-1 text-xs font-bold text-[#718096]">{label}</p></>;
  const className = "block rounded-[22px] border border-[#e0e6ed] bg-white p-5 shadow-[0_8px_28px_rgba(7,23,43,0.045)] transition hover:-translate-y-0.5 hover:border-[#b9c5d2] hover:shadow-[0_14px_34px_rgba(7,23,43,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e52833] focus-visible:ring-offset-2";

  return href
    ? <Link href={href} className={className} aria-label={`Open ${label}`}>{content}</Link>
    : <article className={className}>{content}</article>;
}
