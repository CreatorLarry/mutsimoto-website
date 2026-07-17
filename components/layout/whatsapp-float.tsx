import { MessageCircle } from "lucide-react";

export function WhatsAppFloat() {
  return <a href="https://wa.me/254721901129" target="_blank" rel="noreferrer" className="fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full bg-[#168a55] text-white shadow-lg transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#168a55] focus-visible:ring-offset-2" aria-label="Enquire on WhatsApp"><MessageCircle className="size-6" /></a>;
}
