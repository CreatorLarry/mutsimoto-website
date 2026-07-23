import Link from "next/link";
import { ArrowRight, BadgeCheck, BookOpen, Boxes, CheckCircle2, Headset, ShieldCheck, Warehouse } from "lucide-react";
import { branches } from "@/data/branches";
import { applications } from "@/data/applications";
import { categories } from "@/data/categories";
import { BranchCard } from "@/components/branches/branch-card";
import { ApplicationCard } from "@/components/products/application-card";
import { CategoryCard } from "@/components/products/category-card";
import { ProductCard } from "@/components/products/product-card";
import { ButtonLink } from "@/components/ui/button-link";
import { CallToAction } from "@/components/ui/call-to-action";
import { FilterVisual } from "@/components/ui/filter-visual";
import { SearchBar } from "@/components/ui/search-bar";
import { SectionHeading } from "@/components/ui/section-heading";
import { getFeaturedProducts } from "@/lib/products";

export default async function Home() {
  const featuredProducts = await getFeaturedProducts(6);
  const reasons = [
    { icon: ShieldCheck, title: "Reliable filtration", text: "Consistent protection for critical engine and equipment systems.", tone: "border-[#ef3340] bg-[#ef3340]" },
    { icon: Boxes, title: "Broad application coverage", text: "One focused range for passenger, fleet, off-highway, and industrial use.", tone: "border-[#535b61] bg-[#232a30]" },
    { icon: Headset, title: "Technical support", text: "Practical application and cross-reference help from filtration specialists.", tone: "border-[#535b61] bg-[#232a30]" },
    { icon: BadgeCheck, title: "Quality-focused products", text: "Specification-led products built around fit, flow, and filtration performance.", tone: "border-[#535b61] bg-[#232a30]" },
  ];

  return (
    <>
      <section className="blueprint-grid-dark relative overflow-hidden border-b border-[#353d43] bg-[radial-gradient(circle_at_15%_28%,rgba(239,51,64,0.11),transparent_25%),linear-gradient(118deg,#0a0d0f_0%,#171c20_56%,#0d1114_100%)]">
        <div className="absolute -left-32 top-24 size-72 rotate-45 rounded-none border-[42px] border-white/[0.025]" aria-hidden="true" />
        <div className="absolute right-[42%] top-20 size-3 rounded-none bg-[#ef3340] shadow-[0_0_0_10px_rgba(239,51,64,0.1)]" aria-hidden="true" />
        <div className="relative mx-auto grid min-h-[690px] max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.03fr_0.97fr] lg:px-10 lg:py-20">
          <div>
            <p className="inline-flex items-center gap-2 border-l-2 border-[#ef3340] bg-[#1a2025] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#f4f5f5] shadow-sm"><span className="size-2 rounded-none bg-[#ef3340]" /> Automotive &amp; industrial filtration</p>
            <h1 className="mt-7 max-w-3xl text-5xl font-black uppercase leading-[0.95] tracking-[-0.055em] text-white sm:text-6xl lg:text-[72px]">Filtration Solutions Built for Performance</h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-[#c9cdd0]">Oil, fuel, and air filters engineered around the vehicles, machinery, and power systems that keep your operation moving.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/products">Explore products <ArrowRight className="size-4" /></ButtonLink><ButtonLink href="/downloads" variant="outline"><BookOpen className="size-4" /> View catalogues</ButtonLink></div>
            <div className="mt-9 flex flex-wrap gap-x-5 gap-y-3 text-xs font-semibold uppercase tracking-[0.05em] text-[#b9bec2]">{["12+ prototype references", "OEM cross-reference", "Technical support"].map((item) => <span key={item} className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-[#ef3340]" />{item}</span>)}</div>
          </div>

          <div className="relative">
            <div className="brushed-metal overflow-hidden rounded-lg border border-[#535b61] bg-[#0d1114] p-3 shadow-[0_30px_80px_rgba(0,0,0,0.48)]">
              <div className="h-[470px] overflow-hidden rounded-md"><FilterVisual category="Oil Filters" dark /></div>
              <div className="flex items-center justify-between px-4 py-3 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[#aeb4b8]"><span>MF Series / Engine oil</span><span className="inline-flex items-center gap-2 text-white"><span className="size-2 rounded-none bg-[#ef3340]" /> Application ready</span></div>
            </div>
            <div className="absolute -left-4 top-9 rounded-md border border-[#535b61] border-l-[3px] border-l-[#ef3340] bg-[#171c20] px-4 py-3 shadow-[0_14px_35px_rgba(0,0,0,0.38)] sm:-left-8"><p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#aeb4b8]">Product focus</p><p className="mt-1 text-sm font-extrabold uppercase text-white">Oil · Fuel · Air</p></div>
            <div className="absolute -bottom-5 right-5 rounded-md border border-[#ef3340] bg-[#14191d] px-5 py-4 text-white shadow-[0_14px_35px_rgba(0,0,0,0.4)]"><p className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#ef3340]">Coverage</p><p className="mt-1 text-sm font-extrabold uppercase text-white">Auto + Industrial</p></div>
          </div>
        </div>
        <div className="relative mx-auto max-w-7xl px-5 pb-10 sm:px-8 lg:px-10">
          <div className="rounded-lg border border-[#353d43] border-l-[3px] border-l-[#ef3340] bg-[#14191d] p-4 shadow-[0_18px_55px_rgba(0,0,0,0.4)] sm:p-5"><p className="mb-3 px-2 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#c9cdd0]">Find the right filter in seconds</p><SearchBar submitHref="/products" placeholder="Search by part number, OEM number, vehicle, engine, or equipment" /></div>
        </div>
      </section>

      <section className="border-y border-[#353d43] bg-[#0d1114]"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-5 py-8 sm:px-8 md:grid-cols-4 lg:px-10">{[
        ["01", "Automotive range", "bg-[#14191d]"], ["02", "Industrial coverage", "bg-[#171c20]"], ["03", "OEM references", "bg-[#14191d]"], ["04", "Technical support", "bg-[#171c20]"],
      ].map(([number, label, tone]) => <div key={number} className={`rounded-md border border-[#353d43] ${tone} px-4 py-5`}><span className="font-mono text-[10px] font-bold text-[#ef3340]">{number}</span><p className="mt-2 text-xs font-bold uppercase tracking-[0.05em] text-[#c9cdd0]">{label}</p></div>)}</div></section>

      <section className="mx-auto my-8 max-w-7xl rounded-lg border border-[#353d43] bg-[#11161a] px-5 py-20 shadow-[0_18px_48px_rgba(0,0,0,0.22)] sm:px-8 lg:px-10 lg:py-28">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"><SectionHeading eyebrow="Focused product range" title="Three systems. One dependable filtration partner." description="A specialist catalogue designed to make product discovery and application matching faster." /><p className="max-w-sm text-sm font-medium leading-7 text-[#aeb4b8]">Purpose-built for workshops, dealers, fleet managers, and industrial maintenance teams.</p></div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">{categories.map((category) => <CategoryCard key={category.id} category={category} />)}</div>
      </section>

      <section className="border-y border-[#353d43] bg-[#0d1114]"><div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28"><div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><SectionHeading eyebrow="Browse by application" title="Start with the equipment you service" description="Choose an application, then narrow results by make, engine, equipment, or existing reference." /><ButtonLink href="/applications" variant="outline">All applications <ArrowRight className="size-4" /></ButtonLink></div><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{applications.map((application) => <ApplicationCard key={application.id} application={application} />)}</div></div></section>

      <section className="mx-auto my-8 max-w-7xl rounded-lg border border-[#353d43] bg-[#11161a] px-5 py-20 sm:px-8 lg:px-10 lg:py-28"><div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><SectionHeading eyebrow="Featured products" title="Popular filtration references" description="Fast-moving automotive and industrial filters with clear fitment and technical data." /><Link href="/products" className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.08em] text-white transition-colors hover:text-[#ef3340]">View full catalogue <ArrowRight className="size-4" /></Link></div><div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>

      <section className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12"><div className="blueprint-grid-dark dark-panel brushed-metal mx-auto grid max-w-7xl gap-12 overflow-hidden rounded-lg border border-[#353d43] border-l-4 border-l-[#ef3340] bg-[#0d1114] px-6 py-14 text-white shadow-[0_24px_70px_rgba(0,0,0,0.4)] sm:px-10 lg:grid-cols-[0.82fr_1.18fr] lg:px-14 lg:py-20"><div><SectionHeading eyebrow="Why Mutsimoto" title="Filtration knowledge behind every fitment" description="A focused range, practical application guidance, and technical support for confident product selection." light /><ButtonLink href="/about" variant="secondary" className="mt-8">About Mutsimoto <ArrowRight className="size-4" /></ButtonLink></div><div className="grid gap-3 sm:grid-cols-2">{reasons.map(({ icon: Icon, title, text, tone }) => <article key={title} className="rounded-md border border-[#353d43] bg-[#171c20]/90 p-6"><span className={`grid size-11 place-items-center rounded-md border ${tone} text-white`}><Icon className="size-5" /></span><h3 className="mt-5 text-lg font-extrabold uppercase text-white">{title}</h3><p className="mt-2 text-sm font-medium leading-6 text-[#b9bec2]">{text}</p></article>)}</div></div></section>

      <section className="mx-auto my-8 max-w-7xl rounded-lg border border-[#353d43] bg-[#11161a] px-5 py-20 sm:px-8 lg:px-10 lg:py-28"><div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><SectionHeading eyebrow="Local support" title="Talk to a branch near you" description="Product enquiries, availability checks, and technical support from teams close to your operation." /><ButtonLink href="/branches" variant="outline"><Warehouse className="size-4" /> All branches</ButtonLink></div><div className="mt-12 grid gap-6 md:grid-cols-3">{branches.map((branch) => <BranchCard key={branch.id} branch={branch} />)}</div></section>

      <section className="px-5 pb-4 sm:px-8 lg:px-10"><div className="dark-panel brushed-metal mx-auto flex max-w-7xl flex-col gap-8 rounded-lg border border-[#353d43] border-l-4 border-l-[#ef3340] bg-[#14191d] px-6 py-10 text-white shadow-[0_20px_55px_rgba(0,0,0,0.34)] sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-12"><div className="flex gap-5"><span className="hidden size-13 shrink-0 place-items-center rounded-md border border-[#535b61] bg-[#232a30] text-[#ef3340] sm:grid"><BookOpen /></span><div><p className="font-mono text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#ef3340]">Catalogue resources</p><h2 className="mt-2 text-3xl font-extrabold uppercase tracking-[-0.035em] text-white">Take the filter range with you.</h2><p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[#c9cdd0]">Request the latest catalogue, cross-reference guide, or technical data sheet.</p></div></div><ButtonLink href="/downloads" variant="secondary">Browse downloads <ArrowRight className="size-4" /></ButtonLink></div></section>

      <CallToAction title="Need help matching a filter?" description="Send us a part number, OEM reference, vehicle, engine, or equipment model. Our team will help identify the right Mutsimoto filter." secondaryLabel="WhatsApp technical team" />
    </>
  );
}
