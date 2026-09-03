import { Clock3, Mail, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import type { Branch } from "@/types";

export function BranchCard({ branch, headingLevel = 2 }: { branch: Branch; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 3 ? "h3" : "h2";

  return (
    <article className="flex h-full flex-col rounded-lg border border-[#353d43] bg-[#14191d] p-6 shadow-[0_12px_32px_rgba(0,0,0,0.26)] transition-all hover:-translate-y-1 hover:border-[#697177] hover:shadow-[0_20px_48px_rgba(0,0,0,0.4)] sm:p-7">
      <span className="grid size-12 place-items-center rounded-md border border-[#535b61] bg-[#232a30] text-[#ef3340]"><MapPin className="size-5" aria-hidden="true" /></span>
      <Heading className="mt-6 text-2xl font-extrabold uppercase tracking-[-0.025em] text-white">{branch.name}</Heading>
      <dl className="mt-5 space-y-4 text-sm text-[#b9bec2]">
        <div className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-[#ef3340]" aria-hidden="true" /><div><dt className="sr-only">Location</dt><dd>{branch.location}</dd></div></div>
        <div className="flex gap-3"><Phone className="size-4 shrink-0 text-[#ef3340]" aria-hidden="true" /><div><dt className="sr-only">Phone</dt><dd><a href={`tel:${branch.phone.replace(/\s/g, "")}`} className="hover:text-white">{branch.phone}</a></dd></div></div>
        <div className="flex gap-3"><Mail className="size-4 shrink-0 text-[#ef3340]" aria-hidden="true" /><div><dt className="sr-only">Email</dt><dd><a href={`mailto:${branch.email}`} className="hover:text-white">{branch.email}</a></dd></div></div>
        <div className="flex gap-3"><Clock3 className="mt-0.5 size-4 shrink-0 text-[#ef3340]" aria-hidden="true" /><div><dt className="sr-only">Opening hours</dt><dd>{branch.openingHours}</dd></div></div>
      </dl>
      <div className="mt-auto grid grid-cols-2 gap-2 pt-7"><ButtonLink href={branch.directionsUrl} external variant="outline" className="px-3"><Navigation className="size-4" /> Directions</ButtonLink><ButtonLink href={branch.whatsappUrl} external variant="whatsapp" className="px-3"><MessageCircle className="size-4" /> WhatsApp</ButtonLink></div>
    </article>
  );
}
