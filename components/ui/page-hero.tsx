import { Breadcrumbs } from "@/components/ui/breadcrumbs";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  crumbs: Array<{ label: string; href?: string }>;
}

export function PageHero({ eyebrow, title, description, crumbs }: PageHeroProps) {
  return (
    <section className="blueprint-grid-dark relative overflow-hidden border-b border-[#353d43] bg-[#11161a]">
      <div className="absolute -right-28 -top-28 size-80 rotate-12 rounded-none border-[42px] border-white/[0.025]" aria-hidden="true" />
      <div className="absolute right-[18%] top-14 size-3 rounded-none bg-[#ef3340] shadow-[0_0_0_9px_rgba(239,51,64,0.1)]" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
        <Breadcrumbs items={crumbs} />
        <p className="mt-9 inline-flex border-l-2 border-[#ef3340] bg-[#1a2025] px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#f3f4f4]">{eyebrow}</p>
        <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.055em] text-white sm:text-5xl lg:text-6xl">{title}</h1>
        <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-[#b7bdc1]">{description}</p>
      </div>
    </section>
  );
}
