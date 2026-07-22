import type { AdminProductOption, AdminReference } from "@/types/catalogue-admin";

interface ReferenceFormProps {
  action: (formData: FormData) => Promise<void>;
  products: AdminProductOption[];
  reference?: AdminReference;
  compact?: boolean;
}

const fieldClass = "mt-2 h-11 w-full rounded-xl border border-[#d9e1e9] bg-white px-3 text-sm text-[#26364b] outline-none transition focus:border-[#e52833] focus:ring-2 focus:ring-[#e52833]/10";
const labelClass = "text-[10px] font-black uppercase tracking-[0.11em] text-[#637186]";

export function ReferenceForm({ action, products, reference, compact = false }: ReferenceFormProps) {
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      {reference && <input type="hidden" name="referenceId" value={reference.id} />}
      <label className={`${labelClass} sm:col-span-2`}>
        Mutsimoto product
        <select name="productId" defaultValue={reference?.product.id ?? ""} required className={fieldClass}>
          <option value="" disabled>Select catalogue product</option>
          {products.map((product) => <option key={product.id} value={product.id}>{product.partNumber} — {product.name}{product.publicationStatus === "archived" ? " (archived)" : ""}</option>)}
        </select>
      </label>
      <label className={labelClass}>
        Reference type
        <select name="referenceType" defaultValue={reference?.referenceType ?? "oem"} className={fieldClass}>
          <option value="oem">OEM number</option>
          <option value="competitor">Competitor cross-reference</option>
          <option value="alternative">Alternative number</option>
        </select>
      </label>
      <label className={labelClass}>Manufacturer / brand<input name="manufacturer" defaultValue={reference?.manufacturer ?? ""} required maxLength={120} placeholder="e.g. Toyota or Donaldson" className={fieldClass} /></label>
      <label className={`${labelClass} sm:col-span-2`}>Reference number<input name="referenceNumber" defaultValue={reference?.referenceNumber ?? ""} required maxLength={160} placeholder="Enter the exact part or OEM number" className={`${fieldClass} font-mono font-bold uppercase`} /></label>
      <div className="sm:col-span-2"><button type="submit" className={compact ? "button-dark min-h-10 px-4 py-2 text-xs" : "button-primary"}>{reference ? "Save cross-reference" : "Add cross-reference"}</button></div>
    </form>
  );
}
