"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Archive, CheckSquare2, Edit3, Layers3 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { DeleteAction } from "@/components/admin/delete-action";
import { StatusBadge } from "@/components/admin/status-badge";
import { productCategoryLabels } from "@/types/categories";
import {
  productAvailabilityOptions,
  type AdminProductListItem,
} from "@/types/product-admin";

type ProductAction = (formData: FormData) => void | Promise<void>;
type BulkField = "availability" | "publication_status" | "featured";

interface ProductBulkTableProps {
  products: AdminProductListItem[];
  canEdit: boolean;
  canPublish: boolean;
  canDelete: boolean;
  returnPath: string;
  bulkAction: ProductAction;
  archiveAction: ProductAction;
  deleteAction: ProductAction;
}

const fieldLabels: Record<BulkField, string> = {
  availability: "Availability",
  publication_status: "Publication status",
  featured: "Homepage placement",
};

function valuesFor(field: BulkField, canPublish: boolean) {
  if (field === "availability") {
    return productAvailabilityOptions.map((value) => ({ value, label: value }));
  }
  if (field === "featured") {
    return [
      { value: "true", label: "Mark as featured" },
      { value: "false", label: "Remove from featured" },
    ];
  }
  return [
    { value: "draft", label: "Draft" },
    { value: "review", label: "Under review" },
    ...(canPublish
      ? [
          { value: "published", label: "Published" },
          { value: "archived", label: "Archived" },
        ]
      : []),
  ];
}

function BulkSubmitButton({ selectedCount }: { selectedCount: number }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || selectedCount === 0}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#07172b] px-5 text-xs font-black text-white transition hover:bg-[#132d49] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e52833] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
    >
      <CheckSquare2 className="size-4" aria-hidden="true" />
      {pending ? "Applying…" : "Apply change"}
    </button>
  );
}

export function ProductBulkTable({
  products,
  canEdit,
  canPublish,
  canDelete,
  returnPath,
  bulkAction,
  archiveAction,
  deleteAction,
}: ProductBulkTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [field, setField] = useState<BulkField>("availability");
  const options = useMemo(() => valuesFor(field, canPublish), [field, canPublish]);
  const [value, setValue] = useState(options[0]?.value ?? "");
  const selectAllRef = useRef<HTMLInputElement>(null);
  const selectedCount = selectedIds.size;
  const allSelected = products.length > 0 && selectedCount === products.length;
  const someSelected = selectedCount > 0 && !allSelected;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected;
  }, [someSelected]);

  function changeField(nextField: BulkField) {
    const nextOptions = valuesFor(nextField, canPublish);
    setField(nextField);
    setValue(nextOptions[0]?.value ?? "");
  }

  function toggleProduct(productId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(products.map((product) => product.id)));
  }

  const selectedValueLabel = options.find((option) => option.value === value)?.label ?? value;

  return (
    <>
      {canEdit && (
        <form
          action={bulkAction}
          className="mt-3 rounded-[20px] border border-[#d8e1e9] bg-[#f7f9fb] p-4 shadow-[0_8px_28px_rgba(7,23,43,0.04)]"
          onSubmit={(event) => {
            if (selectedCount === 0) {
              event.preventDefault();
              return;
            }
            const confirmed = window.confirm(
              `Apply “${selectedValueLabel}” to ${selectedCount} selected ${selectedCount === 1 ? "product" : "products"}?`,
            );
            if (!confirmed) event.preventDefault();
          }}
        >
          {[...selectedIds].map((productId) => (
            <input key={productId} type="hidden" name="productIds" value={productId} />
          ))}
          <input type="hidden" name="returnPath" value={returnPath} />

          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#07172b] text-white">
                <Layers3 className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-black text-[#07172b]">Bulk product changes</p>
                <p className="mt-1 text-xs leading-5 text-[#657184]">
                  {selectedCount > 0
                    ? `${selectedCount} ${selectedCount === 1 ? "product" : "products"} selected on this page.`
                    : "Tick products below, or use the select-all checkbox."}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[190px_220px_auto]">
              <label className="text-[10px] font-black uppercase tracking-[0.1em] text-[#667488]">
                Change
                <select
                  name="bulkField"
                  value={field}
                  onChange={(event) => changeField(event.target.value as BulkField)}
                  className="mt-2 h-11 w-full rounded-xl border border-[#ccd6e0] bg-white px-3 text-xs font-bold normal-case tracking-normal text-[#17283d] outline-none focus:border-[#e52833]"
                >
                  {Object.entries(fieldLabels).map(([optionValue, label]) => (
                    <option key={optionValue} value={optionValue}>{label}</option>
                  ))}
                </select>
              </label>
              <label className="text-[10px] font-black uppercase tracking-[0.1em] text-[#667488]">
                New value
                <select
                  name="bulkValue"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-[#ccd6e0] bg-white px-3 text-xs font-bold normal-case tracking-normal text-[#17283d] outline-none focus:border-[#e52833]"
                >
                  {options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <BulkSubmitButton selectedCount={selectedCount} />
            </div>
          </div>
        </form>
      )}

      <div className="mt-3 overflow-hidden rounded-[22px] border border-[#e0e6ed] bg-white shadow-[0_8px_28px_rgba(7,23,43,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1020px] text-left">
            <thead className="bg-[#f3f6f9] text-[10px] font-black uppercase tracking-[0.11em] text-[#6a778a]">
              <tr>
                {canEdit && (
                  <th className="w-14 px-5 py-4">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label={`Select all ${products.length} products on this page`}
                      className="size-4 rounded border-[#aeb9c6] accent-[#e52833]"
                    />
                  </th>
                )}
                <th className="px-4 py-4">Product</th>
                <th className="px-4 py-4">Category</th>
                <th className="px-4 py-4">Availability</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf0f3]">
              {products.map((product) => {
                const selected = selectedIds.has(product.id);
                return (
                  <tr key={product.id} className={selected ? "bg-[#fff7f7]" : "hover:bg-[#fafbfc]"}>
                    {canEdit && (
                      <td className="px-5 py-4">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleProduct(product.id)}
                          aria-label={`Select ${product.name} (${product.partNumber})`}
                          className="size-4 rounded border-[#aeb9c6] accent-[#e52833]"
                        />
                      </td>
                    )}
                    <td className="px-4 py-4">
                      <p className="text-sm font-black text-[#07172b]">{product.name}</p>
                      <p className="mt-1 font-mono text-[11px] font-bold text-[#748196]">
                        {product.partNumber}{product.featured ? " · Featured" : ""}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-[#58667a]">
                      {productCategoryLabels[product.category]}
                    </td>
                    <td className="px-4 py-4 text-sm text-[#657184]">{product.availability}</td>
                    <td className="px-4 py-4"><StatusBadge status={product.publicationStatus} /></td>
                    <td className="px-4 py-4 text-xs text-[#748196]">
                      {new Date(product.updatedAt).toLocaleDateString("en-KE")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {canEdit && (
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#dbe2ea] px-3 text-xs font-black text-[#07172b] hover:border-[#b4c0ce] hover:bg-[#f1f4f7]"
                          >
                            <Edit3 className="size-3.5" /> Edit
                          </Link>
                        )}
                        {canPublish && product.publicationStatus !== "archived" && (
                          <form action={archiveAction}>
                            <input type="hidden" name="productId" value={product.id} />
                            <input type="hidden" name="returnPath" value={returnPath} />
                            <button
                              type="submit"
                              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#d7dfe7] px-3 text-xs font-black text-[#526176] hover:bg-[#f4f6f8]"
                            >
                              <Archive className="size-3.5" /> Archive
                            </button>
                          </form>
                        )}
                        {canDelete && (
                          <DeleteAction
                            action={deleteAction}
                            fields={{ productId: product.id, returnPath }}
                            label="Delete"
                            confirmMessage={`Permanently delete ${product.name} (${product.partNumber})? Its specifications, references, applications, views, and stored product media will also be removed. This cannot be undone.`}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
