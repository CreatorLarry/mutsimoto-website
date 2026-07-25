import type { Metadata } from "next";
import Image from "next/image";
import { Crosshair, Droplets, Eye, Fuel, Handshake, Lightbulb, Quote, ShieldCheck, Target, UserRound, Wind } from "lucide-react";
import { FilterBrandStrip } from "@/components/brands/filter-brand-strip";
import { FilterShowcase } from "@/components/hero/filter-showcase";
import { CallToAction } from "@/components/ui/call-to-action";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPublicCompanyContent } from "@/lib/company-content";

export const metadata: Metadata = { title: "About Us", description: "Learn about Mutsimoto Motor Company, our filtration expertise, quality focus, and leadership." };

export default async function AboutPage() {
  const { about, leadership } = await getPublicCompanyContent();
  const values = [
    { icon: ShieldCheck, title: "Reliability", text: "Products and support that customers can depend on in real operating conditions." },
    { icon: Crosshair, title: "Focus", text: "Deep expertise in the three filtration systems that matter to our customers." },
    { icon: Handshake, title: "Partnership", text: "Practical, responsive support for mechanics, dealers, fleets, and industrial teams." },
    { icon: Lightbulb, title: "Technical clarity", text: "Clear specifications, accurate references, and application-first guidance." },
  ];
  const filterFamilies = [
    { icon: Droplets, eyebrow: "Lubrication protection", title: about.oilFilterTitle, text: about.oilFilterBody, tone: "border-t-[#ef3340]", image: "/images/about/oil-filtration-protection.webp", imageAlt: "Diesel engine valvetrain and camshaft components protected by clean lubricating oil" },
    { icon: Fuel, eyebrow: "Fuel-system protection", title: about.fuelFilterTitle, text: about.fuelFilterBody, tone: "border-t-[#697177]", image: "/images/about/fuel-filtration-protection.webp", imageAlt: "Installed common-rail diesel pump, rail, high-pressure lines, and injectors" },
    { icon: Wind, eyebrow: "Intake protection", title: about.airFilterTitle, text: about.airFilterBody, tone: "border-t-[#697177]", image: "/images/about/air-filtration-protection.webp", imageAlt: "Heavy-duty turbocharger compressor and clean engine intake hardware" },
  ];

  return (
    <>
      <PageHero eyebrow={about.eyebrow} title={about.title} description={about.summary} crumbs={[{ label: "Home", href: "/" }, { label: "About Us" }]} />

      <FilterBrandStrip />

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:items-center lg:px-10 lg:py-24">
        <div>
          <SectionHeading eyebrow="Company overview" title={about.overviewTitle} />
          {about.overviewBody.split(/\n\s*\n/).map((paragraph) => <p key={paragraph} className="mt-5 text-base leading-8 text-[#b9bec2]">{paragraph}</p>)}
          <article className="mt-8 flex gap-5 rounded-md border border-[#353d43] border-l-[3px] border-l-[#ef3340] bg-[#171c20] p-5 shadow-[0_14px_34px_rgba(0,0,0,0.24)] sm:p-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-md border border-[#535b61] bg-[#232a30] text-[#ef3340]">
              <Crosshair className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-mono text-[9px] font-black uppercase tracking-[0.14em] text-[#ef3340]">Custom engineering capability</p>
              <h3 className="mt-2 text-lg font-extrabold uppercase text-white">Custom filters and filtration solutions</h3>
              <p className="mt-2 text-sm leading-6 text-[#b9bec2]">We engineer tailored filters and complete filtration solutions around specific equipment, operating conditions, flow requirements, space constraints, and service targets.</p>
            </div>
          </article>
        </div>
        <div className="relative lg:-mr-4"><FilterShowcase compact /></div>
      </section>

      <section className="border-y border-[#353d43] bg-[#0d1114]"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start lg:px-10 lg:py-20"><div className="lg:sticky lg:top-28"><p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-[#ef3340]">Filtration expertise</p><h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.035em] text-white">{about.expertiseTitle}</h2></div><p className="text-base leading-8 text-[#b9bec2]">{about.expertiseBody}</p></div></section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24"><SectionHeading eyebrow="What filtration protects" title="Three filter families. One clear purpose." description="Clean oil, clean fuel, and clean intake air help protect precision components, reduce avoidable wear, and support consistent equipment performance." /><div className="mt-10 grid gap-5 lg:grid-cols-3">{filterFamilies.map(({ icon: Icon, eyebrow, title, text, tone, image, imageAlt }) => <article key={title} className={`group flex min-h-[480px] flex-col overflow-hidden rounded-lg border border-t-[3px] border-[#353d43] bg-[#14191d] text-[#ef3340] shadow-[0_14px_36px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-1 hover:border-x-[#697177] hover:border-b-[#697177] hover:shadow-[0_24px_54px_rgba(0,0,0,0.46)] ${tone}`}><div className="relative aspect-[16/9] overflow-hidden border-b border-[#353d43] bg-[#0d1114]"><Image src={image} alt={imageAlt} fill sizes="(max-width: 1023px) 100vw, 33vw" className="object-cover saturate-[.74] transition duration-500 ease-out group-hover:scale-[1.035] group-hover:saturate-100" /><div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,11,13,0.03)_18%,rgba(8,11,13,0.76)_100%)]" aria-hidden="true" /><div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,#ef3340,rgba(239,51,64,0.08)_38%,transparent)]" aria-hidden="true" /><span className="absolute bottom-4 left-5 grid size-12 place-items-center rounded-md border border-[#697177] bg-[#14191d]/95 text-[#ef3340] shadow-[0_10px_24px_rgba(0,0,0,0.36)] transition-colors group-hover:border-[#ef3340] group-hover:bg-[#ef3340] group-hover:text-white"><Icon className="size-5" /></span></div><div className="flex flex-1 flex-col p-7"><p className="font-mono text-[9px] font-black uppercase tracking-[0.14em] text-[#ef3340]">{eyebrow}</p><h2 className="mt-3 text-xl font-black uppercase leading-tight text-white">{title}</h2><p className="mt-4 text-sm leading-7 text-[#b9bec2]">{text}</p></div></article>)}</div></section>

      <section className="dark-panel px-5 py-8 text-white sm:px-8 lg:px-10"><div className="blueprint-grid-dark brushed-metal mx-auto grid max-w-7xl gap-3 rounded-lg border border-[#353d43] border-l-4 border-l-[#ef3340] bg-[#0d1114] p-4 sm:p-6 md:grid-cols-2 lg:grid-cols-3">{[
        { icon: Target, eyebrow: "Mission", title: about.missionTitle, text: about.missionBody },
        { icon: Eye, eyebrow: "Vision", title: about.visionTitle, text: about.visionBody },
        { icon: ShieldCheck, eyebrow: "Quality commitment", title: about.qualityTitle, text: about.qualityBody },
      ].map(({ icon: Icon, eyebrow, title, text }) => <article key={eyebrow} className="rounded-md border border-[#353d43] bg-[#171c20]/90 p-7 sm:p-9"><Icon className="size-6 text-[#ef3340]" /><p className="mt-6 font-mono text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#ef3340]">{eyebrow}</p><h2 className="mt-3 text-2xl font-extrabold uppercase leading-tight text-white">{title}</h2><p className="mt-4 text-sm font-medium leading-7 text-[#c9cdd0]">{text}</p></article>)}</div></section>

      {leadership.length > 0 && (
        <section className="border-y border-[#353d43] bg-[#0d1114]">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
            <SectionHeading
              eyebrow="Company leadership"
              title="Leadership grounded in customer service and technical focus"
            />
            <div className={`mt-10 grid gap-6 ${leadership.length > 1 ? "lg:grid-cols-2" : ""}`}>
              {leadership.map((leader) => (
                <article
                  key={leader.id}
                  className="overflow-hidden rounded-lg border border-[#353d43] bg-[#14191d] shadow-[0_16px_45px_rgba(0,0,0,0.32)]"
                >
                  <div className="grid md:grid-cols-[240px_1fr]">
                    <div
                      className="blueprint-grid-dark relative flex min-h-80 items-end justify-center overflow-hidden border-b border-[#353d43] bg-[#11161a] px-7 pt-8 md:min-h-full md:border-b-0 md:border-r"
                      aria-label={
                        leader.photoUrl
                          ? undefined
                          : `${leader.fullName} leadership portrait placeholder`
                      }
                      role={leader.photoUrl ? undefined : "img"}
                    >
                      {leader.photoUrl ? (
                        <>
                          <Image
                            src={leader.photoUrl}
                            alt={`${leader.fullName}, ${leader.title}`}
                            fill
                            sizes="(max-width: 767px) 100vw, 240px"
                            unoptimized
                            className="object-cover object-top"
                          />
                          <div
                            className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(7,12,16,0.5)_100%)]"
                            aria-hidden="true"
                          />
                          <div
                            className="absolute inset-x-0 bottom-0 h-1 bg-[#ef3340]"
                            aria-hidden="true"
                          />
                        </>
                      ) : (
                        <>
                          <div
                            className="absolute inset-x-6 top-8 h-px bg-[linear-gradient(90deg,transparent,#535b61,transparent)]"
                            aria-hidden="true"
                          />
                          <div
                            className="absolute left-6 top-6 size-2 border-l border-t border-[#ef3340]"
                            aria-hidden="true"
                          />
                          <div
                            className="absolute right-6 top-6 size-2 border-r border-t border-[#ef3340]"
                            aria-hidden="true"
                          />
                          <div className="relative flex h-[260px] w-full max-w-48 flex-col items-center justify-end overflow-hidden rounded-t-[999px] border border-b-0 border-[#535b61] bg-[#1d2429] shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
                            <div
                              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(239,51,64,0.12),transparent_34%)]"
                              aria-hidden="true"
                            />
                            <UserRound
                              className="relative mb-9 size-28 stroke-[1.15] text-[#7c858b]"
                              aria-hidden="true"
                            />
                          </div>
                          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-sm border border-[#535b61] bg-[#0d1114]/95 px-3 py-1.5 font-mono text-[8px] font-black uppercase tracking-[0.16em] text-[#c9cdd0]">
                            Leadership portrait
                          </span>
                        </>
                      )}
                    </div>
                    <div className="p-7 sm:p-9">
                      <p className="font-mono text-[10px] font-black uppercase tracking-[0.14em] text-[#ef3340]">
                        {leader.title}
                      </p>
                      <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.035em] text-white">
                        {leader.fullName}
                      </h2>
                      <p className="mt-5 text-sm leading-7 text-[#b9bec2]">{leader.biography}</p>
                      {leader.message && (
                        <blockquote className="mt-7 border-l-2 border-[#ef3340] pl-5">
                          <Quote className="size-5 text-[#ef3340]" />
                          <p className="mt-3 text-base font-semibold italic leading-7 text-[#d7dadd]">
                            “{leader.message}”
                          </p>
                        </blockquote>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24"><SectionHeading eyebrow="Our values" title="How we approach every application" /><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{values.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-lg border border-[#353d43] bg-[#14191d] p-6 shadow-[0_10px_28px_rgba(0,0,0,0.24)]"><span className="grid size-11 place-items-center rounded-md border border-[#535b61] bg-[#232a30] text-[#ef3340] shadow-sm"><Icon className="size-5" /></span><h2 className="mt-5 text-lg font-extrabold uppercase text-white">{title}</h2><p className="mt-3 text-sm leading-6 text-[#b9bec2]">{text}</p></article>)}</div></section>
      <CallToAction title="Let’s solve your filtration requirement" description="Whether you manage one workshop or a national fleet, our team can help identify the right filter coverage." />
    </>
  );
}
