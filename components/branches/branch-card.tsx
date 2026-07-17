import { Clock3, Mail, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import type { Branch } from "@/types";

export function BranchCard({ branch }: { branch: Branch }) {
  return (
    <article className="flex h-full flex-col rounded-[24px] border border-[#dfded4] bg-[linear-gradient(145deg,#fffdf9_55%,#eef6f3)] p-6 shadow-[0_8px_30px_rgba(7,23,43,0.04)] transition-all hover:-translate-y-1 hover:border-[#bcd8d2] hover:shadow-[0_18px_45px_rgba(7,23,43,0.09)] sm:p-7">
      <span className="grid size-12 place-items-center rounded-2xl bg-[#dceeea] text-[#246e66]"><MapPin className="size-5" /></span>
      <h2 className="mt-6 text-2xl font-extrabold tracking-[-0.03em] text-[#07172b]">{branch.name}</h2>
      <dl className="mt-5 space-y-4 text-sm text-[#5d6a7c]">
        <div className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-[#c81920]" /><div><dt className="sr-only">Location</dt><dd>{branch.location}</dd></div></div>
        <div className="flex gap-3"><Phone className="size-4 shrink-0 text-[#c81920]" /><div><dt className="sr-only">Phone</dt><dd><a href={`tel:${branch.phone.replace(/\s/g, "")}`} className="hover:text-[#0b1b31]">{branch.phone}</a></dd></div></div>
        <div className="flex gap-3"><Mail className="size-4 shrink-0 text-[#c81920]" /><div><dt className="sr-only">Email</dt><dd><a href={`mailto:${branch.email}`} className="hover:text-[#0b1b31]">{branch.email}</a></dd></div></div>
        <div className="flex gap-3"><Clock3 className="mt-0.5 size-4 shrink-0 text-[#c81920]" /><div><dt className="sr-only">Opening hours</dt><dd>{branch.openingHours}</dd></div></div>
      </dl>
      <div className="mt-auto grid grid-cols-2 gap-2 pt-7"><ButtonLink href={branch.directionsUrl} external variant="outline" className="px-3"><Navigation className="size-4" /> Directions</ButtonLink><ButtonLink href={branch.whatsappUrl} external variant="whatsapp" className="px-3"><MessageCircle className="size-4" /> WhatsApp</ButtonLink></div>
    </article>
  );
}
