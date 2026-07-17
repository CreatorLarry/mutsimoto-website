import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#7b8695]">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
          {index > 0 && <ChevronRight aria-hidden="true" className="size-3.5 text-[#a9b0ba]" />}
          {item.href ? <Link href={item.href} className="transition-colors hover:text-[#c81920]">{item.label}</Link> : <span className="text-[#0b1b31]">{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}
