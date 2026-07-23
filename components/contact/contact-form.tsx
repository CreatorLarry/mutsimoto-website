"use client";

import { CheckCircle2, LoaderCircle, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface ContactFormProps {
  initialSubject?: string;
  initialType?: string;
  initialPart?: string;
  branchOptions?: { slug: string; name: string }[];
}

interface EnquiryFormValues {
  name: string;
  company: string;
  email: string;
  phone: string;
  type: "general" | "product" | "technical" | "dealer";
  partNumber: string;
  quantity?: number;
  branchSlug: string;
  subject: string;
  message: string;
  consent: boolean;
  website: string;
}

const fieldClass = "mt-2 h-12 w-full rounded-md border border-[#535b61] bg-[#11161a] px-4 text-sm text-white outline-none transition placeholder:text-[#777f84] [color-scheme:dark] focus:border-[#ef3340] focus:ring-4 focus:ring-[#ef3340]/10";
const labelClass = "text-xs font-black uppercase tracking-[0.1em] text-[#c9cdd0]";

export function ContactForm({ initialSubject = "", initialType = "general", initialPart = "", branchOptions = [] }: ContactFormProps) {
  const [enquiryNumber, setEnquiryNumber] = useState("");
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<EnquiryFormValues>({
    defaultValues: {
      type: initialType === "product" ? "product" : "general",
      partNumber: initialPart,
      subject: initialSubject,
      company: "",
      branchSlug: "",
      website: "",
      consent: false,
    },
  });

  async function submit(values: EnquiryFormValues) {
    setServerError("");
    const response = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    const payload = await response.json() as { enquiryNumber?: string; message?: string };
    if (!response.ok) {
      setServerError(payload.message ?? "The enquiry could not be sent.");
      return;
    }
    setEnquiryNumber(payload.enquiryNumber ?? "RECEIVED");
  }

  if (enquiryNumber) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center rounded-lg border border-[#353d43] bg-[#14191d] px-6 text-center" role="status">
        <span className="grid size-16 place-items-center rounded-md border border-[#535b61] bg-[#232a30] text-[#ef3340]"><CheckCircle2 className="size-8" /></span>
        <h2 className="mt-6 text-2xl font-black uppercase text-white">Your enquiry has reached the team</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-[#b9bec2]">Keep reference <strong className="font-mono text-white">{enquiryNumber}</strong> for any follow-up with Mutsimoto.</p>
        <button type="button" onClick={() => { setEnquiryNumber(""); reset(); }} className="button-dark mt-6">Send another enquiry</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="rounded-lg border border-[#353d43] bg-[#14191d] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.34)] sm:p-8" noValidate>
      {serverError && <p className="mb-5 rounded-md border border-[#8e2d35] bg-[#321418] px-4 py-3 text-sm leading-6 text-[#ffb8bd]" role="alert">{serverError}</p>}
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>Full name<input {...register("name", { required: "Enter your name", minLength: 2 })} autoComplete="name" className={fieldClass} placeholder="Your name" />{errors.name && <span className="mt-1 block normal-case tracking-normal text-[11px] text-[#ff8f97]">{errors.name.message}</span>}</label>
        <label className={labelClass}>Company<input {...register("company")} autoComplete="organization" className={fieldClass} placeholder="Company or workshop" /></label>
        <label className={labelClass}>Email<input {...register("email", { required: "Enter your email", pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" } })} type="email" autoComplete="email" className={fieldClass} placeholder="you@company.com" />{errors.email && <span className="mt-1 block normal-case tracking-normal text-[11px] text-[#ff8f97]">{errors.email.message}</span>}</label>
        <label className={labelClass}>Phone<input {...register("phone", { required: "Enter your phone number", minLength: 7 })} type="tel" autoComplete="tel" className={fieldClass} placeholder="+254 ..." />{errors.phone && <span className="mt-1 block normal-case tracking-normal text-[11px] text-[#ff8f97]">{errors.phone.message}</span>}</label>
        <label className={labelClass}>Enquiry type<select {...register("type")} className={fieldClass}><option value="general">General enquiry</option><option value="product">Product enquiry</option><option value="technical">Technical support</option><option value="dealer">Dealer enquiry</option></select></label>
        <label className={labelClass}>Part / OEM number<input {...register("partNumber")} className={fieldClass} placeholder="e.g. MF-101" /></label>
        <label className={labelClass}>Quantity<input {...register("quantity", { valueAsNumber: true })} type="number" min={1} className={fieldClass} placeholder="Optional" /></label>
        <label className={labelClass}>Preferred branch<select {...register("branchSlug")} className={fieldClass}><option value="">Any branch</option>{branchOptions.map((branch) => <option key={branch.slug} value={branch.slug}>{branch.name}</option>)}</select></label>
      </div>
      <label className={`mt-5 block ${labelClass}`}>Subject<input {...register("subject", { required: "Add a subject", minLength: 3 })} className={fieldClass} placeholder="How can we help?" />{errors.subject && <span className="mt-1 block normal-case tracking-normal text-[11px] text-[#ff8f97]">{errors.subject.message}</span>}</label>
      <label className={`mt-5 block ${labelClass}`}>Message<textarea {...register("message", { required: "Add enquiry details", minLength: { value: 10, message: "Add a little more detail" } })} rows={6} className={`${fieldClass} h-auto resize-y py-3`} placeholder="Include the vehicle, engine, equipment model, quantity, or any reference numbers you have." />{errors.message && <span className="mt-1 block normal-case tracking-normal text-[11px] text-[#ff8f97]">{errors.message.message}</span>}</label>
      <label className="sr-only" aria-hidden="true">Website<input {...register("website")} tabIndex={-1} autoComplete="off" /></label>
      <label className="mt-5 flex items-start gap-3 text-xs leading-5 text-[#b9bec2]"><input {...register("consent", { required: true })} type="checkbox" className="mt-1 accent-[#ef3340]" />I agree to be contacted about this enquiry.</label>
      {errors.consent && <p className="mt-2 text-[11px] text-[#ff8f97]">Please confirm that Mutsimoto may contact you.</p>}
      <button type="submit" disabled={isSubmitting} className="button-primary mt-6 w-full disabled:cursor-wait disabled:opacity-60 sm:w-auto">{isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />} {isSubmitting ? "Sending…" : "Send enquiry"}</button>
    </form>
  );
}
