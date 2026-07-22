import type { AdminEquipmentApplication, AdminProductOption, AdminVehicleApplication } from "@/types/catalogue-admin";

type FormAction = (formData: FormData) => Promise<void>;

interface VehicleApplicationFormProps {
  action: FormAction;
  products: AdminProductOption[];
  application?: AdminVehicleApplication;
  compact?: boolean;
}

interface EquipmentApplicationFormProps {
  action: FormAction;
  products: AdminProductOption[];
  application?: AdminEquipmentApplication;
  compact?: boolean;
}

const fieldClass = "mt-2 h-11 w-full rounded-xl border border-[#d9e1e9] bg-white px-3 text-sm text-[#26364b] outline-none transition focus:border-[#e52833] focus:ring-2 focus:ring-[#e52833]/10";
const textAreaClass = "mt-2 min-h-24 w-full resize-y rounded-xl border border-[#d9e1e9] bg-white px-3 py-3 text-sm text-[#26364b] outline-none transition focus:border-[#e52833] focus:ring-2 focus:ring-[#e52833]/10";
const labelClass = "text-[10px] font-black uppercase tracking-[0.11em] text-[#637186]";

function ProductSelect({ products, defaultValue }: { products: AdminProductOption[]; defaultValue?: string }) {
  return (
    <label className={`${labelClass} sm:col-span-2`}>
      Product
      <select name="productId" defaultValue={defaultValue ?? ""} required className={fieldClass}>
        <option value="" disabled>Select catalogue product</option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.partNumber} — {product.name}{product.publicationStatus === "archived" ? " (archived)" : ""}
          </option>
        ))}
      </select>
    </label>
  );
}

export function VehicleApplicationForm({ action, products, application, compact = false }: VehicleApplicationFormProps) {
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      {application && <input type="hidden" name="applicationId" value={application.id} />}
      <ProductSelect products={products} defaultValue={application?.product.id} />
      <label className={labelClass}>Vehicle brand<input name="brand" defaultValue={application?.brand} required maxLength={100} placeholder="e.g. Toyota" className={fieldClass} /></label>
      <label className={labelClass}>Vehicle model<input name="model" defaultValue={application?.model} required maxLength={120} placeholder="e.g. Hilux" className={fieldClass} /></label>
      <label className={`${labelClass} sm:col-span-2`}>Engine model<input name="engine" defaultValue={application?.engine ?? ""} maxLength={120} placeholder="e.g. 2KD-FTV (optional)" className={fieldClass} /></label>
      <label className={labelClass}>From year<input name="yearFrom" type="number" min={1900} max={2200} defaultValue={application?.yearFrom ?? ""} placeholder="e.g. 2012" className={fieldClass} /></label>
      <label className={labelClass}>To year<input name="yearTo" type="number" min={1900} max={2200} defaultValue={application?.yearTo ?? ""} placeholder="Current if empty" className={fieldClass} /></label>
      <label className={`${labelClass} sm:col-span-2`}>Fitment notes<textarea name="notes" defaultValue={application?.notes ?? ""} maxLength={1000} placeholder="Optional fitment notes, chassis, or market details" className={textAreaClass} /></label>
      <div className="sm:col-span-2"><button type="submit" className={compact ? "button-dark min-h-10 px-4 py-2 text-xs" : "button-primary"}>{application ? "Save vehicle application" : "Add vehicle application"}</button></div>
    </form>
  );
}

export function EquipmentApplicationForm({ action, products, application, compact = false }: EquipmentApplicationFormProps) {
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      {application && <input type="hidden" name="applicationId" value={application.id} />}
      <ProductSelect products={products} defaultValue={application?.product.id} />
      <label className={labelClass}>Equipment type<input name="equipmentType" defaultValue={application?.equipmentType} required maxLength={120} placeholder="e.g. Excavator" className={fieldClass} /></label>
      <label className={labelClass}>Industry<input name="industry" defaultValue={application?.industry ?? "Construction"} required maxLength={120} placeholder="e.g. Construction" className={fieldClass} /></label>
      <label className={labelClass}>Manufacturer<input name="manufacturer" defaultValue={application?.manufacturer} required maxLength={120} placeholder="e.g. Caterpillar" className={fieldClass} /></label>
      <label className={labelClass}>Equipment model<input name="model" defaultValue={application?.model} required maxLength={120} placeholder="e.g. 320D" className={fieldClass} /></label>
      <label className={`${labelClass} sm:col-span-2`}>Engine model<input name="engine" defaultValue={application?.engine ?? ""} maxLength={120} placeholder="e.g. C6.4 ACERT (optional)" className={fieldClass} /></label>
      <label className={`${labelClass} sm:col-span-2`}>Fitment notes<textarea name="notes" defaultValue={application?.notes ?? ""} maxLength={1000} placeholder="Optional serial range, configuration, or market details" className={textAreaClass} /></label>
      <div className="sm:col-span-2"><button type="submit" className={compact ? "button-dark min-h-10 px-4 py-2 text-xs" : "button-primary"}>{application ? "Save equipment application" : "Add equipment application"}</button></div>
    </form>
  );
}
