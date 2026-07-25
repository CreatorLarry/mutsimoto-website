import { AlertTriangle, ImagePlus, Info, Search } from "lucide-react";
import { ProductIdentityFields } from "@/components/admin/product-identity-fields";
import { ProductImageInput } from "@/components/admin/product-image-input";
import { ProductSubmitBar } from "@/components/admin/product-submit-bar";
import { ProductStructuredFields } from "@/components/admin/product-structured-fields";
import type { AdminProductFormValues } from "@/types/product-admin";

const fieldClass = "mt-2 h-12 w-full rounded-xl border border-[#d8e0e8] bg-white px-4 text-sm font-semibold text-[#07172b] outline-none transition placeholder:font-normal placeholder:text-[#9aa5b4] focus:border-[#e52833] focus:ring-4 focus:ring-[#e52833]/10";
const textareaClass = `${fieldClass} h-auto resize-y py-3 leading-6`;
const labelClass = "block text-xs font-extrabold text-[#344358]";

interface ProductFormProps {
  action: (formData: FormData) => void | Promise<void>;
  product?: AdminProductFormValues;
  canPublish: boolean;
  schemaReady?: boolean;
  schemaMessage?: string;
}

export function ProductForm({
  action,
  product,
  canPublish,
  schemaReady = true,
  schemaMessage,
}: ProductFormProps) {
  return (
    <form action={action} className="mt-8 space-y-6">
      {!schemaReady && (
        <aside className="flex gap-3 rounded-2xl border border-[#efb8bc] bg-[#fff3f4] p-4 text-sm text-[#8f2530]" role="alert">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-black">One database update is required before products can be saved.</p>
            <p className="mt-1 text-xs leading-5">
              {schemaMessage ?? "Apply the latest Supabase migration and refresh this page."}
            </p>
          </div>
        </aside>
      )}
      <aside className="flex gap-3 rounded-2xl border border-[#cfdbe7] bg-[#f5f8fb] p-4 text-sm text-[#526176]">
        <Info className="mt-0.5 size-5 shrink-0 text-[#e52833]" aria-hidden="true" />
        <div>
          <p className="font-black text-[#26364b]">Start with the five required fields marked in red.</p>
          <p className="mt-1 text-xs leading-5">
            Everything else can be added now or completed later. Save as a draft whenever the record is not ready to publish.
          </p>
        </div>
      </aside>

      <section className="rounded-[22px] border border-[#e0e6ed] bg-white p-6 shadow-[0_8px_28px_rgba(7,23,43,0.04)] sm:p-8">
        <div className="border-b border-[#e9edf2] pb-5">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-full bg-[#07172b] text-xs font-black text-white">1</span>
            <div>
              <h2 className="text-lg font-black text-[#07172b]">Product basics</h2>
              <p className="mt-1 text-xs text-[#748196]">The minimum information needed to identify this product.</p>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <ProductIdentityFields initial={product} />
        </div>
        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-[#e2e7ed] bg-[#fafbfd] p-4 text-sm font-bold text-[#344358]">
          <input
            name="featured"
            type="checkbox"
            defaultChecked={product?.featured}
            className="mt-0.5 size-4 shrink-0 accent-[#e52833]"
          />
          <span>
            Feature this product on the homepage
            <span className="mt-1 block text-xs font-medium leading-5 text-[#8490a1]">
              Turn this on only for selected priority products.
            </span>
          </span>
        </label>
      </section>

      <section className="rounded-[22px] border border-[#e0e6ed] bg-white p-6 shadow-[0_8px_28px_rgba(7,23,43,0.04)] sm:p-8">
        <div className="border-b border-[#e9edf2] pb-5">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-full bg-[#e52833] text-xs font-black text-white">2</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#07172b]">Product descriptions</h2>
                <span className="rounded-full bg-[#f0f3f6] px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[#788596]">Optional</span>
              </div>
              <p className="mt-1 text-xs leading-5 text-[#748196]">
                Leave these blank for now and a basic catalogue summary will be created automatically.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          <label className={labelClass}>
            Short description
            <textarea
              name="shortDescription"
              defaultValue={product?.shortDescription}
              rows={4}
              className={textareaClass}
              maxLength={320}
              placeholder="A brief one- or two-sentence product summary."
            />
            <span className="mt-2 block text-[11px] font-medium leading-5 text-[#8490a1]">
              Used on product cards and in search results. Maximum 320 characters.
            </span>
          </label>
          <label className={labelClass}>
            Full description
            <textarea
              name="fullDescription"
              defaultValue={product?.fullDescription}
              rows={6}
              className={textareaClass}
              maxLength={5000}
              placeholder="Add detailed product benefits, construction, and recommended use when available."
            />
            <span className="mt-2 block text-[11px] font-medium leading-5 text-[#8490a1]">
              Shown on the individual product page.
            </span>
          </label>
        </div>
      </section>

      <section className="rounded-[22px] border border-[#e0e6ed] bg-white p-6 shadow-[0_8px_28px_rgba(7,23,43,0.04)] sm:p-8">
        <div className="border-b border-[#e9edf2] pb-5">
          <div className="flex items-center gap-2">
            <ImagePlus className="size-5 text-[#e52833]" aria-hidden="true" />
            <h2 className="text-lg font-black text-[#07172b]">Product image</h2>
            <span className="rounded-full bg-[#f0f3f6] px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[#788596]">Optional</span>
          </div>
          <p className="mt-1 text-xs leading-5 text-[#748196]">
            Upload a clear JPEG, PNG, or WebP image up to 5 MB. A new upload replaces the primary image.
          </p>
        </div>
        {product?.primaryImagePath && (
          <p className="mt-5 rounded-xl bg-[#eef7f1] px-4 py-3 text-xs font-bold text-[#31704a]">
            This product already has a primary image. Leave the upload empty to keep it.
          </p>
        )}
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className={labelClass}>
            Choose product image
            <ProductImageInput
              className={`${fieldClass} h-auto py-3 file:mr-4 file:rounded-full file:border-0 file:bg-[#07172b] file:px-4 file:py-2 file:text-xs file:font-bold file:text-white`}
            />
          </label>
          <label className={labelClass}>
            Image description
            <input
              name="imageAlt"
              defaultValue={product?.imageAlt}
              className={fieldClass}
              placeholder="e.g. Front view of MOF-1050"
            />
            <span className="mt-2 block text-[11px] font-medium leading-5 text-[#8490a1]">
              Optional. We will use the product name if this is left blank.
            </span>
          </label>
        </div>
      </section>

      <ProductStructuredFields
        specifications={product?.specifications}
        references={product?.references}
        vehicleApplications={product?.vehicleApplications}
        equipmentApplications={product?.equipmentApplications}
      />

      <details className="group rounded-[22px] border border-[#e0e6ed] bg-white shadow-[0_8px_28px_rgba(7,23,43,0.04)]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 marker:hidden sm:p-8">
          <div className="flex items-center gap-3">
            <Search className="size-5 text-[#e52833]" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-black text-[#07172b]">Search engine details</h2>
              <p className="mt-1 text-xs text-[#748196]">Optional advanced settings for search previews.</p>
            </div>
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-[#718095] group-open:hidden">Show</span>
          <span className="hidden text-xs font-black uppercase tracking-wider text-[#718095] group-open:inline">Hide</span>
        </summary>
        <div className="grid gap-5 border-t border-[#e9edf2] px-6 pb-6 pt-5 md:grid-cols-2 sm:px-8 sm:pb-8">
          <label className={labelClass}>
            SEO title
            <input
              name="seoTitle"
              defaultValue={product?.seoTitle}
              className={fieldClass}
              maxLength={160}
              placeholder="Leave blank to use the product name"
            />
          </label>
          <label className={labelClass}>
            SEO description
            <textarea
              name="seoDescription"
              defaultValue={product?.seoDescription}
              rows={3}
              className={textareaClass}
              maxLength={320}
              placeholder="Leave blank to use the short description"
            />
          </label>
        </div>
      </details>

      <ProductSubmitBar canPublish={canPublish} schemaReady={schemaReady} />
    </form>
  );
}
