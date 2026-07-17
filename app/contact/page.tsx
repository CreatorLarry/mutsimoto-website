import type { Metadata } from "next";
import { Clock3, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { ButtonLink } from "@/components/ui/button-link";
import { PageHero } from "@/components/ui/page-hero";
import { branches } from "@/data/branches";

export const metadata: Metadata = { title: "Contact", description: "Send Mutsimoto a product, technical, dealer, or general enquiry." };

interface ContactPageProps { searchParams: Promise<{ subject?: string; type?: string; part?: string }> }

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  return (
    <>
      <PageHero eyebrow="Contact Mutsimoto" title="Tell us what you need to filter" description="Send a product reference or application details and our team will help with selection, availability, or technical documentation." crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:px-10 lg:py-20">
        <aside>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c81920]">Direct contact</p><h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#0b1b31]">Product and general enquiries</h2><p className="mt-4 text-sm leading-7 text-[#657184]">For the fastest product match, include any part number, OEM number, vehicle, engine, or equipment details you have.</p>
          <div className="mt-8 space-y-5 border-y border-[#d8dde3] py-7 text-sm text-[#526075]"><a href="tel:+254700000000" className="flex items-center gap-3 hover:text-[#0b1b31]"><Phone className="size-5 text-[#c81920]" />+254 700 000 000</a><a href="mailto:sales@mutsimoto.co.ke" className="flex items-center gap-3 hover:text-[#0b1b31]"><Mail className="size-5 text-[#c81920]" />sales@mutsimoto.co.ke</a><p className="flex items-start gap-3"><Clock3 className="mt-0.5 size-5 shrink-0 text-[#c81920]" />Mon–Fri 8:00–17:00<br />Sat 8:30–13:00</p></div>
          <ButtonLink href="https://wa.me/254700000000" external variant="whatsapp" className="mt-7 w-full"><MessageCircle className="size-4" /> Contact us on WhatsApp</ButtonLink>
        </aside>
        <ContactForm initialSubject={params.subject} initialType={params.type} initialPart={params.part} />
      </section>
      <section className="bg-[#eaf4f1]"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-20"><div className="blueprint-grid flex min-h-[390px] flex-col items-center justify-center rounded-[26px] border border-[#bfd9d3] bg-[#dcece8] px-6 text-center"><span className="grid size-14 place-items-center rounded-2xl bg-[#2f8178] text-white"><MapPin className="size-6" /></span><h2 className="mt-5 text-2xl font-extrabold text-[#07172b]">Interactive branch map</h2><p className="mt-2 max-w-md text-sm leading-6 text-[#68768a]">Map integration will be connected after branch addresses and map provider details are approved.</p></div><div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#d51f2a]">Branch contacts</p><h2 className="mt-3 text-3xl font-extrabold text-[#07172b]">Reach the local team</h2><div className="mt-7 divide-y divide-[#cadbd7]">{branches.map((branch) => <article key={branch.id} className="py-5 first:pt-0"><h3 className="font-extrabold text-[#07172b]">{branch.name}</h3><p className="mt-1 text-sm text-[#68768a]">{branch.location}</p><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold"><a href={`tel:${branch.phone.replace(/\s/g, "")}`} className="text-[#d51f2a] hover:underline">{branch.phone}</a><a href={`mailto:${branch.email}`} className="text-[#47566a] hover:text-[#d51f2a]">{branch.email}</a></div></article>)}</div></div></div></section>
    </>
  );
}
