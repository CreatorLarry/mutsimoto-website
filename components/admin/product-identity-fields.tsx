"use client";

import { useMemo, useState } from "react";
import { Link2 } from "lucide-react";
import { productCategoryOptions, type ProductCategoryKey } from "@/types/categories";
import { productAvailabilityOptions } from "@/types/product-admin";

const fieldClass =
  "mt-2 h-12 w-full rounded-xl border border-[#d8e0e8] bg-white px-4 text-sm font-semibold text-[#07172b] outline-none transition placeholder:font-normal placeholder:text-[#9aa5b4] focus:border-[#e52833] focus:ring-4 focus:ring-[#e52833]/10";
const labelClass = "block text-xs font-extrabold text-[#344358]";

interface ProductIdentityFieldsProps {
  initial?: {
    name: string;
    slug: string;
    partNumber: string;
    category: ProductCategoryKey;
    applicationType: "automotive" | "industrial" | "both";
    availability: string;
  };
}

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductIdentityFields({ initial }: ProductIdentityFieldsProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [partNumber, setPartNumber] = useState(initial?.partNumber ?? "");
  const generatedSlug = useMemo(() => slugify(`${name}-${partNumber}`), [name, partNumber]);
  const initialValuesUnchanged = name === (initial?.name ?? "") && partNumber === (initial?.partNumber ?? "");
  const slug = initialValuesUnchanged && initial?.slug ? initial.slug : generatedSlug;
  const hasCustomAvailability =
    Boolean(initial?.availability) &&
    !productAvailabilityOptions.includes(
      initial?.availability as (typeof productAvailabilityOptions)[number],
    );

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2">
        <label className={labelClass}>
          Product name <span className="text-[#e52833]">*</span>
          <input
            required
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={fieldClass}
            maxLength={160}
            placeholder="e.g. Heavy Duty Oil Filter"
            autoComplete="off"
          />
          <span className="mt-2 block text-[11px] font-medium leading-5 text-[#8490a1]">
            Use the name customers should see in the catalogue.
          </span>
        </label>

        <label className={labelClass}>
          Mutsimoto part number <span className="text-[#e52833]">*</span>
          <input
            required
            name="partNumber"
            value={partNumber}
            onChange={(event) => setPartNumber(event.target.value)}
            className={fieldClass}
            maxLength={100}
            placeholder="e.g. MOF-1050"
            autoComplete="off"
          />
          <span className="mt-2 block text-[11px] font-medium leading-5 text-[#8490a1]">
            Enter the unique code printed on the filter or packaging.
          </span>
        </label>

        <label className={labelClass}>
          Product category <span className="text-[#e52833]">*</span>
          <select
            required
            name="category"
            defaultValue={initial?.category ?? "oil_spin_on"}
            className={fieldClass}
          >
            {productCategoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          Used for <span className="text-[#e52833]">*</span>
          <select
            required
            name="applicationType"
            defaultValue={initial?.applicationType ?? "automotive"}
            className={fieldClass}
          >
            <option value="automotive">Automotive vehicles</option>
            <option value="industrial">Industrial equipment</option>
            <option value="both">Both automotive and industrial</option>
          </select>
        </label>

        <label className={labelClass}>
          Availability <span className="text-[#e52833]">*</span>
          <select
            required
            name="availability"
            defaultValue={initial?.availability ?? "In stock"}
            className={fieldClass}
          >
            {hasCustomAvailability && <option value={initial?.availability}>{initial?.availability}</option>}
            {productAvailabilityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div>
          <p className={labelClass}>Website address</p>
          <input type="hidden" name="slug" value={slug} />
          <div className="mt-2 flex min-h-12 items-center gap-2 rounded-xl border border-[#dce3ea] bg-[#f4f7fa] px-4 text-sm text-[#536176]">
            <Link2 className="size-4 shrink-0 text-[#e52833]" aria-hidden="true" />
            <span className="min-w-0 truncate font-mono text-xs">
              /products/{slug || "generated-automatically"}
            </span>
          </div>
          <p className="mt-2 text-[11px] font-medium leading-5 text-[#8490a1]">
            Created automatically from the product name and part number.
          </p>
        </div>
      </div>
    </>
  );
}
