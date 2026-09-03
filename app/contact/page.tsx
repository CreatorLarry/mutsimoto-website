import type { Metadata } from "next";
import { Clock3, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { ButtonLink } from "@/components/ui/button-link";
import { PageHero } from "@/components/ui/page-hero";
import { COMPANY_CONTACT } from "@/data/company-contact";
import { getBranches } from "@/lib/branches";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Contact Mutsimoto",
  description: "Send Mutsimoto a product, technical, dealer, or general enquiry.",
  path: "/contact",
});

interface ContactPageProps { searchParams: Promise<{ subject?: string; type?: string; part?: string }> }

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const branches = await getBranches();
  const nakuruBranch = branches.find((branch) => branch.id === "nakuru") ?? branches[0];

  return (
    <>
      <PageHero eyebrow="Contact Mutsimoto" title="Tell us what you need to filter" description="Send a product reference or application details and our team will help with selection, availability, or technical documentation." crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:px-10 lg:py-20">
        <aside>
          <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[#ef3340]">Direct contact</p><h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.035em] text-white">Product and general enquiries</h2><p className="mt-4 text-sm leading-7 text-[#b9bec2]">For the fastest product match, include any part number, OEM number, vehicle, engine, or equipment details you have.</p>
          {nakuruBranch && <><div className="mt-8 space-y-5 border-y border-[#353d43] py-7 text-sm text-[#c9cdd0]"><a href={COMPANY_CONTACT.phone.href} className="flex items-center gap-3 hover:text-white"><Phone className="size-5 text-[#ef3340]" />{COMPANY_CONTACT.phone.label}</a><a href={COMPANY_CONTACT.hotline.href} className="flex items-center gap-3 hover:text-white"><Phone className="size-5 text-[#ef3340]" />{COMPANY_CONTACT.hotline.label}</a><a href={`mailto:${nakuruBranch.email}`} className="flex items-center gap-3 hover:text-white"><Mail className="size-5 text-[#ef3340]" />{nakuruBranch.email}</a><p className="flex items-start gap-3"><Clock3 className="mt-0.5 size-5 shrink-0 text-[#ef3340]" />{nakuruBranch.openingHours}</p></div><ButtonLink href={COMPANY_CONTACT.whatsapp.href} external variant="whatsapp" className="mt-7 w-full"><MessageCircle className="size-4" /> Contact us on WhatsApp</ButtonLink></>}
        </aside>
        <ContactForm initialSubject={params.subject} initialType={params.type} initialPart={params.part} branchOptions={branches.map((branch) => ({ slug: branch.id, name: branch.name }))} />
      </section>
      <section className="border-y border-[#353d43] bg-[#0d1114]"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-20">{nakuruBranch && <div className="blueprint-grid-dark flex min-h-[24rem] flex-col items-center justify-center rounded-lg border border-[#353d43] bg-[#14191d] px-6 py-6 text-center"><span className="grid size-14 place-items-center rounded-md border border-[#ef3340] bg-[#232a30] text-[#ef3340]"><MapPin className="size-6" /></span><h2 className="mt-5 text-2xl font-extrabold uppercase text-white">{nakuruBranch.name}</h2><p className="mt-2 max-w-md text-sm leading-6 text-[#b9bec2]">{nakuruBranch.location}</p><div className="mt-5 w-full flex-1 overflow-hidden rounded-md border border-[#535b61] bg-white shadow-sm"><iframe src={`https://www.google.com/maps?q=${encodeURIComponent(nakuruBranch.location)}&output=embed`} className="h-full min-h-[20rem] w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={`${nakuruBranch.name} map`} /></div><a href={nakuruBranch.directionsUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.06em] text-[#ef3340] hover:text-white">Open directions <span aria-hidden="true">↗</span></a></div>}<div><p className="font-mono text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#ef3340]">Branch contacts</p><h2 className="mt-3 text-3xl font-extrabold uppercase text-white">Reach the local team</h2><div className="mt-7 divide-y divide-[#353d43]">{branches.map((branch) => <article key={branch.id} className="py-5 first:pt-0"><h3 className="font-extrabold uppercase text-white">{branch.name}</h3><p className="mt-1 text-sm text-[#b9bec2]">{branch.location}</p><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold"><a href={`tel:${branch.phone.replace(/\s/g, "")}`} className="text-[#ef3340] hover:underline">{branch.phone}</a><a href={`mailto:${branch.email}`} className="text-[#c9cdd0] hover:text-[#ef3340]">{branch.email}</a></div></article>)}</div></div></div></section>
    </>
  );
}
