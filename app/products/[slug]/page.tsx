import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, Download, FileSearch, Gauge, MessageCircle, Send } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { SpecificationsTable } from "@/components/products/specifications-table";
import { ProductViewTracker } from "@/components/analytics/product-view-tracker";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ButtonLink } from "@/components/ui/button-link";
import { CallToAction } from "@/components/ui/call-to-action";
import { FilterVisual } from "@/components/ui/filter-visual";
import { SectionHeading } from "@/components/ui/section-heading";
import { createPageMetadata } from "@/lib/metadata";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";

interface ProductPageProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found", robots: { index: false, follow: false } };
  return createPageMetadata({
    title: product.seoTitle ?? `${product.name} ${product.partNumber}`,
    description: product.seoDescription ?? product.shortDescription,
    path: `/products/${product.slug}`,
    absoluteTitle: Boolean(product.seoTitle?.includes("Mutsimoto Motor Company")),
  });
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const relatedProducts = await getRelatedProducts(product);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.partNumber,
    category: product.category,
    description: product.shortDescription,
    image: product.images ?? [product.image],
    brand: { "@type": "Brand", name: "Mutsimoto" },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replaceAll("<", "\\u003c") }} />
      <ProductViewTracker productId={product.id} />
      <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: product.partNumber }]} /></div>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:px-10 lg:pb-20">
        <div><div className="aspect-[4/3] overflow-hidden rounded-lg border border-[#353d43] bg-[#171c20] shadow-[0_18px_50px_rgba(0,0,0,0.38)]"><FilterVisual category={product.category} imageSrc={product.image} imageAlt={`${product.name} (${product.partNumber})`} /></div><div className="mt-3 grid grid-cols-3 gap-3">{["Product profile", "Seal detail", "Media construction"].map((label, index) => <div key={label} className="relative aspect-square overflow-hidden rounded-md border border-[#353d43] bg-[#171c20]"><FilterVisual category={product.category} compact imageSrc={product.images?.[index] ?? product.image} imageAlt={`${product.name} — ${label}`} /><span className="absolute inset-x-0 bottom-0 z-[2] border-t border-[#353d43] bg-[#0d1114]/95 px-2 py-1.5 text-center font-mono text-[8px] font-bold uppercase tracking-[0.06em] text-[#c9cdd0]">0{index + 1} · {label}</span></div>)}</div></div>
        <div className="lg:py-5"><div className="flex flex-wrap items-center gap-3"><span className="border-l-2 border-[#ef3340] bg-[#232a30] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-white">{product.category}</span><span className="inline-flex items-center gap-1.5 rounded-md border border-[#535b61] bg-[#171c20] px-3 py-1.5 text-xs font-bold text-[#d7dadd]"><CheckCircle2 className="size-4 text-[#ef3340]" /> {product.availability}</span></div><h1 className="mt-6 text-4xl font-black uppercase tracking-[-0.045em] text-white sm:text-5xl">{product.name}</h1><div className="mt-6 flex items-center gap-4 rounded-md border border-[#353d43] border-l-[3px] border-l-[#ef3340] bg-[#171c20] px-4 py-4"><span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#aeb4b8]">Mutsimoto part number</span><strong className="font-mono text-xl tracking-[0.04em] text-white">{product.partNumber}</strong></div><p className="mt-6 text-base leading-8 text-[#b9bec2]">{product.description}</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><ButtonLink href={`/contact?type=product&part=${product.partNumber}`}><Send className="size-4" /> Request Quote</ButtonLink><ButtonLink href={`https://wa.me/254710600307?text=I%20am%20enquiring%20about%20${product.partNumber}`} variant="whatsapp" external><MessageCircle className="size-4" /> WhatsApp Enquiry</ButtonLink></div><div className="mt-8 grid gap-3 border-t border-[#353d43] pt-6 sm:grid-cols-2"><div className="flex gap-3"><Gauge className="mt-0.5 size-5 text-[#ef3340]" /><div><p className="text-xs font-extrabold uppercase text-white">Application type</p><p className="mt-1 text-sm text-[#aeb4b8]">{product.applicationType}</p></div></div><div className="flex gap-3"><FileSearch className="mt-0.5 size-5 text-[#ef3340]" /><div><p className="text-xs font-extrabold uppercase text-white">Cross references</p><p className="mt-1 text-sm text-[#aeb4b8]">{product.oemNumbers.length} listed references</p></div></div></div></div>
      </section>
      <section className="border-y border-[#353d43] bg-[#0d1114]"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-20"><div><SectionHeading eyebrow="Technical data" title="Specifications" description="Prototype specifications are supplied for catalogue demonstration and will be validated against production data before launch." /><ButtonLink href={`/contact?type=product&part=${product.partNumber}&subject=Data%20sheet`} variant="outline" className="mt-7"><Download className="size-4" /> Request data sheet</ButtonLink></div><SpecificationsTable specifications={product.specifications} /></div></section>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-3 lg:px-10 lg:py-20">{[
        { title: "OEM & cross-reference numbers", items: product.oemNumbers },
        { title: "Compatible vehicles", items: product.vehicleBrands },
        { title: "Compatible engines & equipment", items: [...product.engineModels, ...product.equipmentTypes] },
      ].map((group) => <article key={group.title} className="border-t-[3px] border-[#ef3340] bg-[#11161a] px-5 pb-2 pt-5"><h2 className="text-lg font-black uppercase text-white">{group.title}</h2><ul className="mt-5 divide-y divide-[#353d43] text-sm text-[#b9bec2]">{group.items.map((item) => <li key={item} className="flex items-center justify-between py-3"><span>{item}</span><span className="font-mono text-[#ef3340]">↗</span></li>)}</ul></article>)}</section>
      {relatedProducts.length > 0 && <section className="border-y border-[#353d43] bg-[#0d1114]"><div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20"><SectionHeading eyebrow="Related products" title="More from this filter family" /><div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{relatedProducts.map((related) => <ProductCard key={related.id} product={related} />)}</div></div></section>}
      <CallToAction title="Need a fitment confirmation?" description={`Send our technical team your vehicle, engine, equipment, or OEM reference and mention ${product.partNumber}.`} />
    </>
  );
}
