import Link from "next/link";
import { ArrowRight, BadgeCheck, BookOpen, Boxes, CheckCircle2, Headset, ShieldCheck, Warehouse } from "lucide-react";
import { branches } from "@/data/branches";
import { applications } from "@/data/applications";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { BranchCard } from "@/components/branches/branch-card";
import { ApplicationCard } from "@/components/products/application-card";
import { CategoryCard } from "@/components/products/category-card";
import { ProductCard } from "@/components/products/product-card";
import { ButtonLink } from "@/components/ui/button-link";
import { CallToAction } from "@/components/ui/call-to-action";
import { FilterVisual } from "@/components/ui/filter-visual";
import { SearchBar } from "@/components/ui/search-bar";
import { SectionHeading } from "@/components/ui/section-heading";

export default function Home() {
  const featuredProducts = products.filter((product) => product.featured).slice(0, 6);
  const reasons = [
    { icon: ShieldCheck, title: "Reliable filtration", text: "Consistent protection for critical engine and equipment systems.", tone: "bg-[#e52833]" },
    { icon: Boxes, title: "Broad application coverage", text: "One focused range for passenger, fleet, off-highway, and industrial use.", tone: "bg-[#d3962e]" },
    { icon: Headset, title: "Technical support", text: "Practical application and cross-reference help from filtration specialists.", tone: "bg-[#2f8178]" },
    { icon: BadgeCheck, title: "Quality-focused products", text: "Specification-led products built around fit, flow, and filtration performance.", tone: "bg-[#376b91]" },
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-[#e7d5ca] bg-[linear-gradient(120deg,#d5ebe6_0%,#f8eddc_52%,#ffd9d5_100%)]">
        <div className="absolute -left-32 top-24 size-72 rounded-full border-[52px] border-[#fffaf4]/80" aria-hidden="true" />
        <div className="absolute right-[42%] top-20 size-3 rounded-full bg-[#e5a93f] shadow-[0_0_0_10px_rgba(229,169,63,0.13)]" aria-hidden="true" />
        <div className="relative mx-auto grid min-h-[690px] max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.03fr_0.97fr] lg:px-10 lg:py-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#07172b] bg-[#07172b] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.15em] text-white shadow-sm"><span className="size-2 rounded-full bg-[#ff5b64]" /> Automotive &amp; industrial filtration</p>
            <h1 className="mt-7 max-w-3xl text-5xl font-extrabold leading-[0.98] tracking-[-0.065em] text-[#07172b] sm:text-6xl lg:text-[72px]">Filtration Solutions Built for Performance</h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-[#405168]">Oil, fuel, and air filters engineered around the vehicles, machinery, and power systems that keep your operation moving.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/products">Explore products <ArrowRight className="size-4" /></ButtonLink><ButtonLink href="/downloads" variant="outline"><BookOpen className="size-4" /> View catalogues</ButtonLink></div>
            <div className="mt-9 flex flex-wrap gap-x-5 gap-y-3 text-xs font-semibold text-[#516176]">{["12+ prototype references", "OEM cross-reference", "Technical support"].map((item) => <span key={item} className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-[#e52833]" />{item}</span>)}</div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[34px] border border-[#263b55] bg-[#07172b] p-3 shadow-[0_30px_80px_rgba(7,23,43,0.22)]">
              <div className="h-[470px] overflow-hidden rounded-[26px]"><FilterVisual category="Oil Filters" dark /></div>
              <div className="flex items-center justify-between px-4 py-3 text-[10px] font-bold uppercase tracking-[0.13em] text-[#93a3b6]"><span>MF Series / Engine oil</span><span className="inline-flex items-center gap-2 text-white"><span className="size-2 rounded-full bg-[#42d392]" /> Application ready</span></div>
            </div>
            <div className="absolute -left-4 top-9 rounded-2xl border border-[#f4ded5] bg-[#fffaf4] px-4 py-3 shadow-[0_14px_35px_rgba(7,23,43,0.14)] sm:-left-8"><p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#8a96a5]">Product focus</p><p className="mt-1 text-sm font-extrabold text-[#07172b]">Oil · Fuel · Air</p></div>
            <div className="absolute -bottom-5 right-5 rounded-2xl bg-[#e52833] px-5 py-4 text-white shadow-[0_14px_35px_rgba(229,40,51,0.28)]"><p className="text-[9px] font-bold uppercase tracking-[0.13em] text-white/70">Coverage</p><p className="mt-1 text-sm font-extrabold">Auto + Industrial</p></div>
          </div>
        </div>
        <div className="relative mx-auto max-w-7xl px-5 pb-10 sm:px-8 lg:px-10">
          <div className="rounded-[24px] border border-[#eadfd4] bg-[#fffdf9] p-4 shadow-[0_18px_55px_rgba(7,23,43,0.1)] sm:p-5"><p className="mb-3 px-2 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#7c8999]">Find the right filter in seconds</p><SearchBar submitHref="/products" placeholder="Search by part number, OEM number, vehicle, engine, or equipment" /></div>
        </div>
      </section>

      <section className="bg-[#f9eee7]"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-5 py-8 sm:px-8 md:grid-cols-4 lg:px-10">{[
        ["01", "Automotive range", "bg-[#ffdcd7]"], ["02", "Industrial coverage", "bg-[#cfe7e2]"], ["03", "OEM references", "bg-[#ffe5b9]"], ["04", "Technical support", "bg-[#d9e6f2]"],
      ].map(([number, label, tone]) => <div key={number} className={`rounded-2xl ${tone} px-4 py-5`}><span className="font-mono text-[10px] font-bold text-[#e52833]">{number}</span><p className="mt-2 text-xs font-bold text-[#435268]">{label}</p></div>)}</div></section>

      <section className="mx-auto my-8 max-w-7xl rounded-[36px] bg-[#fff0e3] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"><SectionHeading eyebrow="Focused product range" title="Three systems. One dependable filtration partner." description="A specialist catalogue designed to make product discovery and application matching faster." /><p className="max-w-sm text-sm leading-7 text-[#718095]">Purpose-built for workshops, dealers, fleet managers, and industrial maintenance teams.</p></div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">{categories.map((category) => <CategoryCard key={category.id} category={category} />)}</div>
      </section>

      <section className="bg-[#dceeea]"><div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28"><div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><SectionHeading eyebrow="Browse by application" title="Start with the equipment you service" description="Choose an application, then narrow results by make, engine, equipment, or existing reference." /><ButtonLink href="/applications" variant="outline">All applications <ArrowRight className="size-4" /></ButtonLink></div><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{applications.map((application) => <ApplicationCard key={application.id} application={application} />)}</div></div></section>

      <section className="mx-auto my-8 max-w-7xl rounded-[36px] bg-[#fde9e7] px-5 py-20 sm:px-8 lg:px-10 lg:py-28"><div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><SectionHeading eyebrow="Featured products" title="Popular filtration references" description="Fast-moving automotive and industrial filters with clear fitment and technical data." /><Link href="/products" className="inline-flex items-center gap-2 text-sm font-bold text-[#07172b] transition-colors hover:text-[#d51f2a]">View full catalogue <ArrowRight className="size-4" /></Link></div><div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>

      <section className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12"><div className="blueprint-grid-dark dark-panel mx-auto grid max-w-7xl gap-12 overflow-hidden rounded-[32px] border-t-4 border-[#e52833] bg-[linear-gradient(120deg,#07172b,#123446)] px-6 py-14 text-white shadow-[0_24px_70px_rgba(7,23,43,0.18)] sm:px-10 lg:grid-cols-[0.82fr_1.18fr] lg:px-14 lg:py-20"><div><SectionHeading eyebrow="Why Mutsimoto" title="Filtration knowledge behind every fitment" description="A focused range, practical application guidance, and technical support for confident product selection." light /><ButtonLink href="/about" variant="secondary" className="mt-8">About Mutsimoto <ArrowRight className="size-4" /></ButtonLink></div><div className="grid gap-3 sm:grid-cols-2">{reasons.map(({ icon: Icon, title, text, tone }) => <article key={title} className="rounded-[20px] border border-white/15 bg-white/[0.075] p-6"><span className={`grid size-11 place-items-center rounded-2xl ${tone} text-white`}><Icon className="size-5" /></span><h3 className="mt-5 text-lg font-extrabold text-white">{title}</h3><p className="mt-2 text-sm font-medium leading-6 text-[#c8d2de]">{text}</p></article>)}</div></div></section>

      <section className="mx-auto my-8 max-w-7xl rounded-[36px] bg-[#dfeaf5] px-5 py-20 sm:px-8 lg:px-10 lg:py-28"><div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><SectionHeading eyebrow="Local support" title="Talk to a branch near you" description="Product enquiries, availability checks, and technical support from teams close to your operation." /><ButtonLink href="/branches" variant="outline"><Warehouse className="size-4" /> All branches</ButtonLink></div><div className="mt-12 grid gap-6 md:grid-cols-3">{branches.map((branch) => <BranchCard key={branch.id} branch={branch} />)}</div></section>

      <section className="px-5 pb-4 sm:px-8 lg:px-10"><div className="dark-panel mx-auto flex max-w-7xl flex-col gap-8 rounded-[28px] bg-[#d51f2a] px-6 py-10 text-white shadow-[0_20px_55px_rgba(229,40,51,0.22)] sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-12"><div className="flex gap-5"><span className="hidden size-13 shrink-0 place-items-center rounded-2xl bg-white/15 sm:grid"><BookOpen /></span><div><p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-white/80">Catalogue resources</p><h2 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-white">Take the filter range with you.</h2><p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-white/90">Request the latest catalogue, cross-reference guide, or technical data sheet.</p></div></div><ButtonLink href="/downloads" variant="secondary">Browse downloads <ArrowRight className="size-4" /></ButtonLink></div></section>

      <CallToAction title="Need help matching a filter?" description="Send us a part number, OEM reference, vehicle, engine, or equipment model. Our team will help identify the right Mutsimoto filter." secondaryLabel="WhatsApp technical team" />
    </>
  );
}
