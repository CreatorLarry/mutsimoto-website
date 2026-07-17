import type { Metadata } from "next";
import { Crosshair, Eye, Handshake, Lightbulb, ShieldCheck, Target } from "lucide-react";
import { CallToAction } from "@/components/ui/call-to-action";
import { FilterVisual } from "@/components/ui/filter-visual";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = { title: "About Us", description: "Learn about Mutsimoto Motor Company and our focus on automotive and industrial filtration." };

export default function AboutPage() {
  const values = [
    { icon: ShieldCheck, title: "Reliability", text: "Products and support that customers can depend on in real operating conditions." },
    { icon: Crosshair, title: "Focus", text: "Deep expertise in the three filtration systems that matter to our customers." },
    { icon: Handshake, title: "Partnership", text: "Practical, responsive support for mechanics, dealers, fleets, and industrial teams." },
    { icon: Lightbulb, title: "Technical clarity", text: "Clear specifications, accurate references, and application-first guidance." },
  ];
  return (
    <>
      <PageHero eyebrow="About Mutsimoto" title="A specialist filtration company" description="We focus only on oil, fuel, and air filtration—bringing automotive and industrial buyers a clear range backed by practical application knowledge." crumbs={[{ label: "Home", href: "/" }, { label: "About Us" }]} />
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:items-center lg:px-10 lg:py-24"><div><SectionHeading eyebrow="Company overview" title="Focused expertise. Broader equipment coverage." description="Mutsimoto Motor Company supplies filtration products for passenger vehicles, commercial fleets, construction machinery, agriculture, generators, and industrial equipment." /><div className="mt-7 space-y-5 text-base leading-8 text-[#5d697b]"><p>Our catalogue is deliberately focused. By specialising in oil, fuel, and air filters, we can make product selection clearer and provide more useful technical support.</p><p>Every product family is organised around real application data: part numbers, OEM cross-references, engine models, vehicles, equipment types, and the technical details buyers need to make a confident selection.</p></div></div><div className="min-h-[440px] overflow-hidden rounded-[28px] border border-[#dce3ea] shadow-[0_18px_50px_rgba(7,23,43,0.09)]"><FilterVisual category="Air Filters" /></div></section>
      <section className="px-5 py-8 text-white sm:px-8 lg:px-10"><div className="blueprint-grid-dark mx-auto grid max-w-7xl gap-3 rounded-[30px] bg-[linear-gradient(120deg,#07172b,#123446)] p-4 sm:p-6 md:grid-cols-2 lg:grid-cols-3">{[
        { icon: Target, eyebrow: "Mission", title: "Protect the systems that keep business moving", text: "To supply reliable filtration products and clear application support for automotive and industrial customers." },
        { icon: Eye, eyebrow: "Vision", title: "Be the region’s most trusted filtration specialist", text: "A recognised source for confident filter selection, dependable coverage, and responsive technical service." },
        { icon: ShieldCheck, eyebrow: "Quality commitment", title: "Fit, flow, and filtration first", text: "We prioritise product consistency, application accuracy, and specifications that serve real equipment needs." },
      ].map(({ icon: Icon, eyebrow, title, text }) => <article key={eyebrow} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-7 sm:p-9"><Icon className="size-6 text-[#ff6971]" /><p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#ff6971]">{eyebrow}</p><h2 className="mt-3 text-2xl font-extrabold leading-tight">{title}</h2><p className="mt-4 text-sm leading-7 text-[#b5c0ce]">{text}</p></article>)}</div></section>
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24"><SectionHeading eyebrow="Our values" title="How we approach every application" /><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{values.map(({ icon: Icon, title, text }, index) => <article key={title} className={`rounded-[22px] border p-6 ${index % 2 === 0 ? "border-[#efddd4] bg-[#fff4ed]" : "border-[#cfe3df] bg-[#edf6f3]"}`}><span className={`grid size-11 place-items-center rounded-2xl shadow-sm ${index % 2 === 0 ? "bg-[#fffdf9] text-[#d51f2a]" : "bg-[#fffdf9] text-[#2f8178]"}`}><Icon className="size-5" /></span><h2 className="mt-5 text-lg font-extrabold text-[#07172b]">{title}</h2><p className="mt-3 text-sm leading-6 text-[#68768a]">{text}</p></article>)}</div></section>
      <CallToAction title="Let’s solve your filtration requirement" description="Whether you manage one workshop or a national fleet, our team can help identify the right filter coverage." />
    </>
  );
}
