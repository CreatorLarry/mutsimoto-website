import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, Download, FileSearch, Gauge, MessageCircle, Send } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { SpecificationsTable } from "@/components/products/specifications-table";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ButtonLink } from "@/components/ui/button-link";
import { CallToAction } from "@/components/ui/call-to-action";
import { FilterVisual } from "@/components/ui/filter-visual";
import { SectionHeading } from "@/components/ui/section-heading";
import { products } from "@/data/products";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";

interface ProductPageProps { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return { title: `${product.name} ${product.partNumber}`, description: product.shortDescription };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const relatedProducts = await getRelatedProducts(product);
  return (
    <>
      <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: product.partNumber }]} /></div>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:px-10 lg:pb-20">
        <div><div className="min-h-[430px] overflow-hidden rounded-[28px] border border-[#dce3ea] shadow-[0_18px_50px_rgba(7,23,43,0.08)]"><FilterVisual category={product.category} /></div><div className="mt-3 grid grid-cols-3 gap-3">{["Product profile", "Seal detail", "Media construction"].map((label, index) => <div key={label} className="relative h-28 overflow-hidden rounded-2xl border border-[#dce3ea] bg-[#eef1f4]"><FilterVisual category={product.category} compact /><span className="absolute inset-x-0 bottom-0 bg-white/95 px-2 py-1.5 text-center text-[9px] font-bold text-[#48566a]">0{index + 1} · {label}</span></div>)}</div></div>
        <div className="lg:py-5"><div className="flex flex-wrap items-center gap-3"><span className="rounded-full bg-[#fff0f1] px-3 py-1.5 text-[10px] font-extrabold text-[#d51f2a]">{product.category}</span><span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf7f1] px-3 py-1.5 text-xs font-bold text-[#168a55]"><CheckCircle2 className="size-4" /> {product.availability}</span></div><h1 className="mt-6 text-4xl font-extrabold tracking-[-0.055em] text-[#07172b] sm:text-5xl">{product.name}</h1><div className="mt-6 flex items-center gap-4 rounded-2xl bg-[#f4f7fa] px-4 py-4"><span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#738095]">Mutsimoto part number</span><strong className="font-mono text-xl text-[#07172b]">{product.partNumber}</strong></div><p className="mt-6 text-base leading-8 text-[#5d697b]">{product.description}</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><ButtonLink href={`/contact?type=product&part=${product.partNumber}`}><Send className="size-4" /> Request Quote</ButtonLink><ButtonLink href={`https://wa.me/254700000000?text=I%20am%20enquiring%20about%20${product.partNumber}`} variant="whatsapp" external><MessageCircle className="size-4" /> WhatsApp Enquiry</ButtonLink></div><div className="mt-8 grid gap-3 border-t border-[#e1e7ed] pt-6 sm:grid-cols-2"><div className="flex gap-3"><Gauge className="mt-0.5 size-5 text-[#d51f2a]" /><div><p className="text-xs font-extrabold text-[#07172b]">Application type</p><p className="mt-1 text-sm text-[#68768a]">{product.applicationType}</p></div></div><div className="flex gap-3"><FileSearch className="mt-0.5 size-5 text-[#d51f2a]" /><div><p className="text-xs font-extrabold text-[#07172b]">Cross references</p><p className="mt-1 text-sm text-[#68768a]">{product.oemNumbers.length} listed references</p></div></div></div></div>
      </section>
      <section className="bg-[#f4f7fa]"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-20"><div><SectionHeading eyebrow="Technical data" title="Specifications" description="Prototype specifications are supplied for catalogue demonstration and will be validated against production data before launch." /><ButtonLink href={`/contact?type=product&part=${product.partNumber}&subject=Data%20sheet`} variant="outline" className="mt-7"><Download className="size-4" /> Request data sheet</ButtonLink></div><SpecificationsTable specifications={product.specifications} /></div></section>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-3 lg:px-10 lg:py-20">{[
        { title: "OEM & cross-reference numbers", items: product.oemNumbers },
        { title: "Compatible vehicles", items: product.vehicleBrands },
        { title: "Compatible engines & equipment", items: [...product.engineModels, ...product.equipmentTypes] },
      ].map((group) => <article key={group.title} className="border-t-2 border-[#0b1b31] pt-5"><h2 className="text-lg font-black text-[#0b1b31]">{group.title}</h2><ul className="mt-5 divide-y divide-[#d8dde3] text-sm text-[#5c697c]">{group.items.map((item) => <li key={item} className="flex items-center justify-between py-3"><span>{item}</span><span className="font-mono text-[#9aa4b0]">↗</span></li>)}</ul></article>)}</section>
      {relatedProducts.length > 0 && <section className="bg-[#f2f4f6]"><div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20"><SectionHeading eyebrow="Related products" title="More from this filter family" /><div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{relatedProducts.map((related) => <ProductCard key={related.id} product={related} />)}</div></div></section>}
      <CallToAction title="Need a fitment confirmation?" description={`Send our technical team your vehicle, engine, equipment, or OEM reference and mention ${product.partNumber}.`} />
    </>
  );
}
