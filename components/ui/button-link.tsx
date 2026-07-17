import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "dark" | "outline" | "whatsapp";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-[#e52833] text-white border-[#e52833] shadow-[0_8px_24px_rgba(229,40,51,0.2)] hover:bg-[#c91923] hover:border-[#c91923] hover:-translate-y-0.5",
  secondary: "bg-white text-[#07172b] border-white hover:bg-[#f0f3f7] hover:border-[#f0f3f7] hover:-translate-y-0.5",
  dark: "bg-[#07172b] text-white border-[#07172b] hover:bg-[#132943] hover:border-[#132943] hover:-translate-y-0.5",
  outline: "bg-white text-[#07172b] border-[#d9e0e8] hover:border-[#9aa8b8] hover:bg-[#f7f9fb] hover:-translate-y-0.5",
  whatsapp: "bg-[#168a55] text-white border-[#168a55] hover:bg-[#117347] hover:border-[#117347]",
};

interface ButtonLinkProps {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  external?: boolean;
}

export function ButtonLink({ href, children, variant = "primary", className, external }: ButtonLinkProps) {
  const classes = cn(
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e52833] focus-visible:ring-offset-2",
    variants[variant],
    className,
  );

  if (external) {
    return <a className={classes} href={href} target="_blank" rel="noreferrer">{children}</a>;
  }

  return <a className={classes} href={href}>{children}</a>;
}
