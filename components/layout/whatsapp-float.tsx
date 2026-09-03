import { MessageCircle } from "lucide-react";
import { COMPANY_CONTACT } from "@/data/company-contact";

export function WhatsAppFloat() {
  return <a href={COMPANY_CONTACT.whatsapp.href} target="_blank" rel="noopener noreferrer" className="fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-md border border-[#697177] bg-[#171c20] text-white shadow-[0_12px_28px_rgba(0,0,0,0.4)] transition-all hover:-translate-y-0.5 hover:border-[#ef3340] hover:bg-[#ef3340] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef3340] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0d0f]" aria-label={`Enquire on WhatsApp at ${COMPANY_CONTACT.whatsapp.label}`}><MessageCircle className="size-6" aria-hidden="true" /></a>;
}
