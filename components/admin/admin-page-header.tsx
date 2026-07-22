import type { ReactNode } from "react";

interface AdminPageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function AdminPageHeader({ eyebrow = "Administration", title, description, actions }: AdminPageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 border-b border-[#dfe5ec] pb-7 md:flex-row md:items-end md:justify-between">
      <div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#d51f2a]">{eyebrow}</p><h1 className="mt-2 text-3xl font-black tracking-[-0.045em] text-[#07172b] sm:text-4xl">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-[#657184]">{description}</p></div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

