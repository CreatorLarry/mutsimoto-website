"use client";

import { Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";

interface DeleteActionProps {
  action: (formData: FormData) => void | Promise<void>;
  fields: Record<string, string>;
  confirmMessage: string;
  label?: string;
  className?: string;
}

function DeleteSubmitButton({ label, className }: Pick<DeleteActionProps, "label" | "className">) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={className ?? "inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#e5bfc4] px-4 text-xs font-black text-[#a6323d] transition hover:border-[#cf7f88] hover:bg-[#fff0f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d51f2a] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"}
    >
      <Trash2 className="size-3.5" aria-hidden="true" />
      {pending ? "Deleting…" : label}
    </button>
  );
}

export function DeleteAction({
  action,
  fields,
  confirmMessage,
  label = "Delete",
  className,
}: DeleteActionProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
      }}
    >
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <DeleteSubmitButton label={label} className={className} />
    </form>
  );
}
