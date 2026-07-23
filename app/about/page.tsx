import type { Metadata } from "next";
import { Crosshair, Droplets, Eye, Fuel, Handshake, Lightbulb, Quote, ShieldCheck, Target, Wind } from "lucide-react";
import { CallToAction } from "@/components/ui/call-to-action";
import { FilterVisual } from "@/components/ui/filter-visual";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPublicCompanyContent } from "@/lib/company-content";

export const metadata: Metadata = { title: "About Us", description: "Learn about Mutsimoto Motor Company, our filtration expertise, quality focus, and leadership." };

function initials(value: string): string {
  return value.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "MM";
}

export default async function AboutPage() {
  const { about, leadership } = await getPublicCompanyContent();
  const values = [
    { icon: ShieldCheck, title: "Reliability", text: "Products and support that customers can depend on in real operating conditions." },
    { icon: Crosshair, title: "Focus", text: "Deep expertise in the three filtration systems that matter to our customers." },
    { icon: Handshake, title: "Partnership", text: "Practical, responsive support for mechanics, dealers, fleets, and industrial teams." },
    { icon: Lightbulb, title: "Technical clarity", text: "Clear specifications, accurate references, and application-first guidance." },
  ];
  const filterFamilies = [
    { icon: Droplets, eyebrow: "Lubrication protection", title: about.oilFilterTitle, text: about.oilFilterBody, tone: "border-t-[#ef3340]" },
    { icon: Fuel, eyebrow: "Fuel-system protection", title: about.fuelFilterTitle, text: about.fuelFilterBody, tone: "border-t-[#697177]" },
    { icon: Wind, eyebrow: "Intake protection", title: about.airFilterTitle, text: about.airFilterBody, tone: "border-t-[#697177]" },
  ];

  return (
    <>
      <PageHero eyebrow={about.eyebrow} title={about.title} description={about.summary} crumbs={[{ label: "Home", href: "/" }, { label: "About Us" }]} />

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:items-center lg:px-10 lg:py-24">
        <div><SectionHeading eyebrow="Company overview" title={about.overviewTitle} />{about.overviewBody.split(/\n\s*\n/).map((paragraph) => <p key={paragraph} className="mt-5 text-base leading-8 text-[#b9bec2]">{paragraph}</p>)}</div>
        <div className="h-[440px] overflow-hidden rounded-lg border border-[#353d43] shadow-[0_18px_50px_rgba(0,0,0,0.35)]"><FilterVisual category="Air Filters" /></div>
      </section>

      <section className="border-y border-[#353d43] bg-[#0d1114]"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start lg:px-10 lg:py-20"><div className="lg:sticky lg:top-28"><p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-[#ef3340]">Filtration expertise</p><h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.035em] text-white">{about.expertiseTitle}</h2></div><p className="text-base leading-8 text-[#b9bec2]">{about.expertiseBody}</p></div></section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24"><SectionHeading eyebrow="What filtration protects" title="Three filter families. One clear purpose." description="Clean oil, clean fuel, and clean intake air help protect precision components, reduce avoidable wear, and support consistent equipment performance." /><div className="mt-10 grid gap-5 lg:grid-cols-3">{filterFamilies.map(({ icon: Icon, eyebrow, title, text, tone }) => <article key={title} className={`rounded-lg border border-t-[3px] border-[#353d43] bg-[#14191d] p-7 text-[#ef3340] shadow-[0_12px_32px_rgba(0,0,0,0.25)] ${tone}`}><span className="grid size-12 place-items-center rounded-md border border-[#535b61] bg-[#232a30]"><Icon className="size-5" /></span><p className="mt-7 font-mono text-[9px] font-black uppercase tracking-[0.14em] text-[#ef3340]">{eyebrow}</p><h2 className="mt-3 text-xl font-black uppercase leading-tight text-white">{title}</h2><p className="mt-4 text-sm leading-7 text-[#b9bec2]">{text}</p></article>)}</div></section>

      <section className="dark-panel px-5 py-8 text-white sm:px-8 lg:px-10"><div className="blueprint-grid-dark brushed-metal mx-auto grid max-w-7xl gap-3 rounded-lg border border-[#353d43] border-l-4 border-l-[#ef3340] bg-[#0d1114] p-4 sm:p-6 md:grid-cols-2 lg:grid-cols-3">{[
        { icon: Target, eyebrow: "Mission", title: about.missionTitle, text: about.missionBody },
        { icon: Eye, eyebrow: "Vision", title: about.visionTitle, text: about.visionBody },
        { icon: ShieldCheck, eyebrow: "Quality commitment", title: about.qualityTitle, text: about.qualityBody },
      ].map(({ icon: Icon, eyebrow, title, text }) => <article key={eyebrow} className="rounded-md border border-[#353d43] bg-[#171c20]/90 p-7 sm:p-9"><Icon className="size-6 text-[#ef3340]" /><p className="mt-6 font-mono text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#ef3340]">{eyebrow}</p><h2 className="mt-3 text-2xl font-extrabold uppercase leading-tight text-white">{title}</h2><p className="mt-4 text-sm font-medium leading-7 text-[#c9cdd0]">{text}</p></article>)}</div></section>

      {leadership.length > 0 && <section className="border-y border-[#353d43] bg-[#0d1114]"><div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24"><SectionHeading eyebrow="Company leadership" title="Leadership grounded in customer service and technical focus" /><div className={`mt-10 grid gap-6 ${leadership.length > 1 ? "lg:grid-cols-2" : ""}`}>{leadership.map((leader) => <article key={leader.id} className="overflow-hidden rounded-lg border border-[#353d43] bg-[#14191d] shadow-[0_16px_45px_rgba(0,0,0,0.32)]"><div className="grid md:grid-cols-[220px_1fr]"><div className="blueprint-grid-dark flex min-h-64 items-center justify-center border-r border-[#353d43] bg-[#11161a] p-8"><span className="grid size-28 place-items-center rounded-md border border-[#535b61] bg-[#232a30] text-3xl font-black tracking-[-0.04em] text-white">{initials(leader.fullName)}</span></div><div className="p-7 sm:p-9"><p className="font-mono text-[10px] font-black uppercase tracking-[0.14em] text-[#ef3340]">{leader.title}</p><h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.035em] text-white">{leader.fullName}</h2><p className="mt-5 text-sm leading-7 text-[#b9bec2]">{leader.biography}</p>{leader.message && <blockquote className="mt-7 border-l-2 border-[#ef3340] pl-5"><Quote className="size-5 text-[#ef3340]" /><p className="mt-3 text-base font-semibold italic leading-7 text-[#d7dadd]">“{leader.message}”</p></blockquote>}</div></div></article>)}</div></div></section>}

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24"><SectionHeading eyebrow="Our values" title="How we approach every application" /><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{values.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-lg border border-[#353d43] bg-[#14191d] p-6 shadow-[0_10px_28px_rgba(0,0,0,0.24)]"><span className="grid size-11 place-items-center rounded-md border border-[#535b61] bg-[#232a30] text-[#ef3340] shadow-sm"><Icon className="size-5" /></span><h2 className="mt-5 text-lg font-extrabold uppercase text-white">{title}</h2><p className="mt-3 text-sm leading-6 text-[#b9bec2]">{text}</p></article>)}</div></section>
      <CallToAction title="Let’s solve your filtration requirement" description="Whether you manage one workshop or a national fleet, our team can help identify the right filter coverage." />
    </>
  );
}
