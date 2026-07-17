import { Breadcrumbs } from "@/components/ui/breadcrumbs";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  crumbs: Array<{ label: string; href?: string }>;
}

export function PageHero({ eyebrow, title, description, crumbs }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(120deg,#e8f3f1_0%,#f8f4ed_58%,#ffebe8_100%)]">
      <div className="absolute -right-28 -top-28 size-80 rounded-full border-[48px] border-[#fffaf4]/80" aria-hidden="true" />
      <div className="absolute right-[18%] top-14 size-3 rounded-full bg-[#e5a93f] shadow-[0_0_0_9px_rgba(229,169,63,0.12)]" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
        <Breadcrumbs items={crumbs} />
        <p className="mt-9 inline-flex rounded-full border border-[#f5d1cb] bg-[#fffaf4] px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#d51f2a] shadow-sm">{eyebrow}</p>
        <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.03] tracking-[-0.055em] text-[#07172b] sm:text-5xl lg:text-6xl">{title}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#647287]">{description}</p>
      </div>
    </section>
  );
}
