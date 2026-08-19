"use client";

import { Camera, CheckCircle2, LoaderCircle, Send, ShieldCheck, Wrench } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { filterRequestAttachmentBucket, filterRequestKindLabels, type FilterRequestKind } from "@/lib/enquiries/filter-request";
import { createClient } from "@/lib/supabase/client";
import { productCategoryOptions } from "@/types/categories";

interface FilterRequestFormProps {
  initialQuery?: string;
}

interface FilterRequestValues {
  name: string;
  company: string;
  email: string;
  phone: string;
  requestKind: FilterRequestKind;
  filterCategory: string;
  partNumber: string;
  vehicleOrEquipment: string;
  engineModel: string;
  dimensions: string;
  quantity?: number;
  notes: string;
  consent: boolean;
  website: string;
}

interface UploadPreparation {
  path?: string;
  token?: string;
  message?: string;
}

interface SubmissionResponse {
  enquiryNumber?: string;
  message?: string;
}

const fieldClass = "mt-2 h-12 w-full rounded-md border border-[#535b61] bg-[#11161a] px-4 text-sm text-white outline-none transition placeholder:text-[#777f84] [color-scheme:dark] focus:border-[#ef3340] focus:ring-4 focus:ring-[#ef3340]/10";
const labelClass = "text-[10px] font-black uppercase tracking-[0.1em] text-[#c9cdd0]";
const errorClass = "mt-1 block normal-case tracking-normal text-[11px] text-[#ff8f97]";
const acceptedPhotoTypes = ["image/jpeg", "image/png", "image/webp"];

export function FilterRequestForm({ initialQuery = "" }: FilterRequestFormProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [serverError, setServerError] = useState("");
  const [enquiryNumber, setEnquiryNumber] = useState("");
  const [progressLabel, setProgressLabel] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, reset, setError, clearErrors, formState: { errors, isSubmitting } } = useForm<FilterRequestValues>({
    defaultValues: {
      name: "",
      company: "",
      email: "",
      phone: "",
      requestKind: "identify",
      filterCategory: "",
      partNumber: initialQuery,
      vehicleOrEquipment: "",
      engineModel: "",
      dimensions: "",
      notes: "",
      consent: false,
      website: "",
    },
  });

  function choosePhoto(file: File | null) {
    setPhotoError("");
    if (!file) {
      setPhoto(null);
      return;
    }
    if (!acceptedPhotoTypes.includes(file.type) || file.size > 5 * 1024 * 1024) {
      setPhoto(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setPhotoError("Use a JPG, PNG, or WebP photo smaller than 5 MB.");
      return;
    }
    setPhoto(file);
  }

  async function uploadPhoto(file: File): Promise<string> {
    const preparationResponse = await fetch("/api/enquiries/filter-request/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
    });
    const preparation = await preparationResponse.json() as UploadPreparation;
    if (!preparationResponse.ok || !preparation.path || !preparation.token) {
      throw new Error(preparation.message ?? "The photo could not be prepared for upload.");
    }

    const supabase = createClient();
    const { error } = await supabase.storage
      .from(filterRequestAttachmentBucket)
      .uploadToSignedUrl(preparation.path, preparation.token, file, { contentType: file.type });
    if (error) throw new Error("The photo could not be uploaded. Please try again.");
    return preparation.path;
  }

  async function submit(values: FilterRequestValues) {
    setServerError("");
    clearErrors(["email", "phone"]);
    if (!values.email.trim() && values.phone.trim().length < 7) {
      setError("phone", { message: "Add either a phone number or email address" });
      return;
    }

    try {
      let attachmentPath = "";
      if (photo) {
        setProgressLabel("Uploading photo…");
        attachmentPath = await uploadPhoto(photo);
      }
      setProgressLabel("Sending request…");
      const response = await fetch("/api/enquiries/filter-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, searchQuery: initialQuery, attachmentPath }),
      });
      const payload = await response.json() as SubmissionResponse;
      if (!response.ok) throw new Error(payload.message ?? "The filter request could not be sent.");
      setEnquiryNumber(payload.enquiryNumber ?? "RECEIVED");
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "The filter request could not be sent.");
    } finally {
      setProgressLabel("");
    }
  }

  if (enquiryNumber) {
    return (
      <div className="rounded-lg border border-[#3f655d] bg-[#12201d] px-6 py-10 text-center" role="status">
        <span className="mx-auto grid size-14 place-items-center rounded-md border border-[#4b7a70] bg-[#1b302b] text-[#74c7b4]"><CheckCircle2 className="size-7" /></span>
        <h3 className="mt-5 text-xl font-black uppercase text-white">Request received</h3>
        <p className="mt-2 text-sm leading-6 text-[#b9c8c4]">The technical team can now review your clues and photo. Keep reference <strong className="font-mono text-white">{enquiryNumber}</strong>.</p>
        <button
          type="button"
          onClick={() => {
            setEnquiryNumber("");
            setPhoto(null);
            reset();
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
          className="button-dark mt-5"
        >
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="rounded-lg border border-[#535b61] bg-[#14191d] p-5 text-left shadow-[0_18px_48px_rgba(0,0,0,0.28)] sm:p-7" noValidate>
      <div className="flex flex-col gap-4 border-b border-[#353d43] pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#ef3340]"><Wrench className="size-4" /> Technical request</span>
          <h3 className="mt-2 text-xl font-black uppercase text-white">Let us identify or make the filter</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#b9bec2]">Share whatever you know. Only your name, one contact method, and permission to contact you are required.</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-md border border-[#3f655d] bg-[#12201d] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#8ed2c2]"><ShieldCheck className="size-4" /> Photo kept private</span>
      </div>

      {serverError && <p className="mt-5 rounded-md border border-[#8e2d35] bg-[#321418] px-4 py-3 text-sm leading-6 text-[#ffb8bd]" role="alert">{serverError}</p>}

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>What do you need?<select {...register("requestKind")} className={fieldClass}>{Object.entries(filterRequestKindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className={labelClass}>Filter category <span className="font-medium normal-case tracking-normal text-[#7f898f]">(optional)</span><select {...register("filterCategory")} className={fieldClass}><option value="">Not sure</option>{productCategoryOptions.map((option) => <option key={option.value} value={option.label}>{option.label}</option>)}</select></label>
        <label className={labelClass}>Your name<input {...register("name", { required: "Enter your name", minLength: { value: 2, message: "Enter your name" } })} autoComplete="name" className={fieldClass} placeholder="Name" />{errors.name && <span className={errorClass}>{errors.name.message}</span>}</label>
        <label className={labelClass}>Company or workshop <span className="font-medium normal-case tracking-normal text-[#7f898f]">(optional)</span><input {...register("company")} autoComplete="organization" className={fieldClass} placeholder="Business name" /></label>
        <label className={labelClass}>Phone <span className="font-medium normal-case tracking-normal text-[#7f898f]">(phone or email)</span><input {...register("phone")} type="tel" autoComplete="tel" className={fieldClass} placeholder="+254 ..." />{errors.phone && <span className={errorClass}>{errors.phone.message}</span>}</label>
        <label className={labelClass}>Email <span className="font-medium normal-case tracking-normal text-[#7f898f]">(phone or email)</span><input {...register("email", { pattern: { value: /^$|^\S+@\S+\.\S+$/, message: "Enter a valid email" } })} type="email" autoComplete="email" className={fieldClass} placeholder="you@company.com" />{errors.email && <span className={errorClass}>{errors.email.message}</span>}</label>
        <label className={labelClass}>Part, OEM or reference number <span className="font-medium normal-case tracking-normal text-[#7f898f]">(optional)</span><input {...register("partNumber")} className={fieldClass} placeholder="Any number or marking" /></label>
        <label className={labelClass}>Quantity <span className="font-medium normal-case tracking-normal text-[#7f898f]">(optional)</span><input {...register("quantity", { valueAsNumber: true })} type="number" min={1} className={fieldClass} placeholder="How many are needed?" /></label>
        <label className={labelClass}>Vehicle, machine or equipment <span className="font-medium normal-case tracking-normal text-[#7f898f]">(optional)</span><input {...register("vehicleOrEquipment")} className={fieldClass} placeholder="Make, model, year or equipment" /></label>
        <label className={labelClass}>Engine model <span className="font-medium normal-case tracking-normal text-[#7f898f]">(optional)</span><input {...register("engineModel")} className={fieldClass} placeholder="Engine code, size or fuel type" /></label>
      </div>

      <label className={`mt-5 block ${labelClass}`}>Dimensions or visible markings <span className="font-medium normal-case tracking-normal text-[#7f898f]">(optional)</span><textarea {...register("dimensions")} rows={3} className={`${fieldClass} h-auto resize-y py-3`} placeholder="Height, outside diameter, inside diameter, thread size, printed numbers, or any other clues" /></label>
      <label className={`mt-5 block ${labelClass}`}>Anything else we should know? <span className="font-medium normal-case tracking-normal text-[#7f898f]">(optional)</span><textarea {...register("notes")} rows={4} className={`${fieldClass} h-auto resize-y py-3`} placeholder="Describe the application, problem, operating conditions, or custom requirements" /></label>

      <div className="mt-5 rounded-md border border-dashed border-[#616a70] bg-[#11161a] p-4">
        <label className="flex cursor-pointer flex-col items-center justify-center px-3 py-4 text-center">
          <Camera className="size-6 text-[#ef3340]" />
          <span className="mt-2 text-xs font-black uppercase tracking-[0.08em] text-white">Attach a filter photo <span className="font-medium normal-case tracking-normal text-[#7f898f]">(optional)</span></span>
          <span className="mt-1 text-xs text-[#929ba1]">JPG, PNG, or WebP · maximum 5 MB</span>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => choosePhoto(event.target.files?.[0] ?? null)} className="sr-only" />
        </label>
        {photo && <p className="mt-2 truncate text-center text-xs font-bold text-[#8ed2c2]">Selected: {photo.name}</p>}
        {photoError && <p className="mt-2 text-center text-xs text-[#ff8f97]" role="alert">{photoError}</p>}
      </div>

      <label className="sr-only" aria-hidden="true">Website<input {...register("website")} tabIndex={-1} autoComplete="off" /></label>
      <label className="mt-5 flex items-start gap-3 text-xs leading-5 text-[#b9bec2]"><input {...register("consent", { required: true })} type="checkbox" className="mt-1 accent-[#ef3340]" />I agree to be contacted about this filter request.</label>
      {errors.consent && <p className="mt-2 text-[11px] text-[#ff8f97]">Please confirm that Mutsimoto may contact you.</p>}

      <button type="submit" disabled={isSubmitting || Boolean(photoError)} className="button-primary mt-6 w-full disabled:cursor-wait disabled:opacity-60 sm:w-auto">
        {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
        {isSubmitting ? progressLabel || "Sending request…" : "Send filter request"}
      </button>
    </form>
  );
}
