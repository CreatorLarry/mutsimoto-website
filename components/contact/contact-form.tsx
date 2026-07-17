"use client";

import { CheckCircle2, Send } from "lucide-react";
import { FormEvent, useState } from "react";

interface ContactFormProps {
  initialSubject?: string;
  initialType?: string;
  initialPart?: string;
}

const fieldClass = "mt-2 h-12 w-full rounded-xl border border-[#dbe2ea] bg-white px-4 text-sm text-[#07172b] outline-none transition focus:border-[#e52833] focus:ring-4 focus:ring-[#e52833]/10";

export function ContactForm({ initialSubject = "", initialType = "general", initialPart = "" }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center rounded-[26px] border border-[#e0e6ed] bg-[#f7f9fb] px-6 text-center" role="status">
        <span className="grid size-16 place-items-center rounded-full bg-[#e6f4ed] text-[#168a55]"><CheckCircle2 className="size-8" /></span>
        <h2 className="mt-6 text-2xl font-black text-[#0b1b31]">Your enquiry is ready for the team</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-[#657184]">This frontend prototype has captured the form successfully. Email delivery will be connected during the Supabase integration phase.</p>
        <button type="button" onClick={() => setSubmitted(false)} className="button-dark mt-6">Send another enquiry</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-[26px] border border-[#e0e6ed] bg-white p-6 shadow-[0_14px_45px_rgba(7,23,43,0.06)] sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-xs font-black uppercase tracking-[0.1em] text-[#435166]">Full name<input required name="name" autoComplete="name" className={fieldClass} placeholder="Your name" /></label>
        <label className="text-xs font-black uppercase tracking-[0.1em] text-[#435166]">Company<input name="company" autoComplete="organization" className={fieldClass} placeholder="Company or workshop" /></label>
        <label className="text-xs font-black uppercase tracking-[0.1em] text-[#435166]">Email<input required type="email" name="email" autoComplete="email" className={fieldClass} placeholder="you@company.com" /></label>
        <label className="text-xs font-black uppercase tracking-[0.1em] text-[#435166]">Phone<input required type="tel" name="phone" autoComplete="tel" className={fieldClass} placeholder="+254 ..." /></label>
        <label className="text-xs font-black uppercase tracking-[0.1em] text-[#435166]">Enquiry type<select name="type" defaultValue={initialType === "product" ? "product" : "general"} className={fieldClass}><option value="general">General enquiry</option><option value="product">Product enquiry</option><option value="technical">Technical support</option><option value="dealer">Dealer enquiry</option></select></label>
        <label className="text-xs font-black uppercase tracking-[0.1em] text-[#435166]">Part / OEM number<input name="partNumber" defaultValue={initialPart} className={fieldClass} placeholder="e.g. MF-101" /></label>
      </div>
      <label className="mt-5 block text-xs font-black uppercase tracking-[0.1em] text-[#435166]">Subject<input required name="subject" defaultValue={initialSubject} className={fieldClass} placeholder="How can we help?" /></label>
      <label className="mt-5 block text-xs font-black uppercase tracking-[0.1em] text-[#435166]">Message<textarea required name="message" rows={6} className={`${fieldClass} h-auto resize-y py-3`} placeholder="Include the vehicle, engine, equipment model, quantity, or any reference numbers you have." /></label>
      <label className="mt-5 flex items-start gap-3 text-xs leading-5 text-[#657184]"><input required type="checkbox" className="mt-1 accent-[#c81920]" />I agree to be contacted about this enquiry.</label>
      <button type="submit" className="button-primary mt-6 w-full sm:w-auto"><Send className="size-4" /> Send enquiry</button>
    </form>
  );
}
