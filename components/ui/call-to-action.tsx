import { ArrowRight, MessageCircle } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";

interface CallToActionProps {
  eyebrow?: string;
  title: string;
  description: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function CallToAction({ eyebrow = "Talk to our team", title, description, primaryLabel = "Request a Quote", primaryHref = "/contact?type=product", secondaryLabel = "WhatsApp Us", secondaryHref = "https://wa.me/254700000000" }: CallToActionProps) {
  return (
    <section className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
      <div className="blueprint-grid-dark mx-auto flex max-w-7xl flex-col gap-8 overflow-hidden rounded-[28px] bg-[linear-gradient(120deg,#07172b,#123446)] px-6 py-12 text-white shadow-[0_24px_70px_rgba(7,23,43,0.18)] sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-14 lg:py-16">
        <div className="max-w-2xl"><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#ff6971]">{eyebrow}</p><h2 className="mt-4 text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl">{title}</h2><p className="mt-4 leading-7 text-[#b9c4d2]">{description}</p></div>
        <div className="flex flex-col gap-3 sm:flex-row"><ButtonLink href={primaryHref}>{primaryLabel}<ArrowRight className="size-4" /></ButtonLink><ButtonLink href={secondaryHref} external={secondaryHref.startsWith("http")} variant="secondary"><MessageCircle className="size-4" />{secondaryLabel}</ButtonLink></div>
      </div>
    </section>
  );
}
