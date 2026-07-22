import type { AdminBranch } from "@/types/content-admin";

interface BranchFormProps {
  action: (formData: FormData) => Promise<void>;
  branch?: AdminBranch;
  compact?: boolean;
}

const fieldClass = "mt-2 h-11 w-full rounded-xl border border-[#d9e1e9] bg-white px-3 text-sm text-[#26364b] outline-none transition focus:border-[#e52833] focus:ring-2 focus:ring-[#e52833]/10";
const textAreaClass = "mt-2 min-h-24 w-full resize-y rounded-xl border border-[#d9e1e9] bg-white px-3 py-3 text-sm text-[#26364b] outline-none transition focus:border-[#e52833] focus:ring-2 focus:ring-[#e52833]/10";
const labelClass = "text-[10px] font-black uppercase tracking-[0.11em] text-[#637186]";

export function BranchForm({ action, branch, compact = false }: BranchFormProps) {
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      {branch && <input type="hidden" name="branchId" value={branch.id} />}
      <label className={labelClass}>Branch name<input name="name" defaultValue={branch?.name} required maxLength={140} placeholder="e.g. Nairobi Industrial Area" className={fieldClass} /></label>
      <label className={labelClass}>URL slug<input name="slug" defaultValue={branch?.slug} maxLength={160} placeholder="Generated from the name if empty" className={fieldClass} /></label>
      <label className={labelClass}>Street address<input name="address" defaultValue={branch?.address} required maxLength={240} placeholder="Street and building" className={fieldClass} /></label>
      <label className={labelClass}>City<input name="city" defaultValue={branch?.city} required maxLength={100} placeholder="e.g. Nakuru" className={fieldClass} /></label>
      <label className={labelClass}>Phone<input name="phone" type="tel" defaultValue={branch?.phone} required maxLength={40} placeholder="+254 ..." className={fieldClass} /></label>
      <label className={labelClass}>WhatsApp<input name="whatsapp" type="tel" defaultValue={branch?.whatsapp} maxLength={40} placeholder="Defaults to phone if empty" className={fieldClass} /></label>
      <label className={`${labelClass} sm:col-span-2`}>Email<input name="email" type="email" defaultValue={branch?.email} required maxLength={180} placeholder="branch@mutsimoto.com" className={fieldClass} /></label>
      <label className={`${labelClass} sm:col-span-2`}>Opening hours<textarea name="openingHours" defaultValue={branch?.openingHours} required maxLength={500} placeholder="Mon–Fri 8:00–17:00 · Sat 8:30–13:00" className={textAreaClass} /></label>
      <label className={labelClass}>Latitude<input name="latitude" type="number" step="any" min={-90} max={90} defaultValue={branch?.latitude ?? ""} placeholder="Optional" className={fieldClass} /></label>
      <label className={labelClass}>Longitude<input name="longitude" type="number" step="any" min={-180} max={180} defaultValue={branch?.longitude ?? ""} placeholder="Optional" className={fieldClass} /></label>
      <label className="flex items-start gap-3 rounded-xl border border-[#dce3eb] bg-[#f7f9fb] p-3 text-xs font-bold leading-5 text-[#526176] sm:col-span-2"><input name="active" type="checkbox" defaultChecked={branch?.active ?? true} className="mt-1 accent-[#d51f2a]" />Show this branch on the public website and enquiry form.</label>
      <div className="sm:col-span-2"><button type="submit" className={compact ? "button-dark min-h-10 px-4 py-2 text-xs" : "button-primary"}>{branch ? "Save branch" : "Add branch"}</button></div>
    </form>
  );
}
