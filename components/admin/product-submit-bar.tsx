"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

interface ProductSubmitBarProps {
  canPublish: boolean;
  schemaReady: boolean;
}

export function ProductSubmitBar({ canPublish, schemaReady }: ProductSubmitBarProps) {
  const { pending } = useFormStatus();
  const disabled = pending || !schemaReady;

  return (
    <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-2 rounded-2xl border border-[#d9e1e9] bg-white/95 p-4 shadow-[0_16px_50px_rgba(7,23,43,0.15)] backdrop-blur-xl">
      {pending && (
        <span className="mr-auto inline-flex items-center gap-2 text-xs font-black text-[#59687c]" role="status">
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          Saving product…
        </span>
      )}
      <button
        type="submit"
        name="intent"
        value="draft"
        disabled={disabled}
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d5dde6] px-5 text-sm font-black text-[#07172b] transition hover:bg-[#f2f5f8] disabled:cursor-not-allowed disabled:opacity-45"
      >
        Save draft
      </button>
      <button
        type="submit"
        name="intent"
        value="review"
        disabled={disabled}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#e8b449] px-5 text-sm font-black text-[#3e2c07] transition hover:bg-[#dcaa3f] disabled:cursor-not-allowed disabled:opacity-45"
      >
        Submit for review
      </button>
      {canPublish && (
        <button
          type="submit"
          name="intent"
          value="publish"
          disabled={disabled}
          className="button-primary disabled:cursor-not-allowed disabled:opacity-45"
        >
          Publish product
        </button>
      )}
    </div>
  );
}
