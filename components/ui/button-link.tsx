import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "dark" | "outline" | "whatsapp";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-[#d92734] text-white border-[#ef3340] shadow-[0_10px_26px_rgba(239,51,64,0.18)] hover:bg-[#bd202c] hover:border-[#ff4b57] hover:-translate-y-0.5",
  secondary: "bg-[#171d22] text-white border-[#d5d8da] hover:bg-[#232a30] hover:border-white hover:-translate-y-0.5",
  dark: "bg-[#171d22] text-white border-[#53565a] hover:bg-[#232a30] hover:border-[#ef3340] hover:-translate-y-0.5",
  outline: "bg-transparent text-white border-[#6c7175] hover:border-white hover:bg-white/[0.06] hover:-translate-y-0.5",
  whatsapp: "bg-[#171d22] text-white border-[#53565a] hover:bg-[#232a30] hover:border-[#ef3340]",
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
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-md border px-6 py-3 text-xs font-extrabold uppercase tracking-[0.05em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef3340] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0d0f]",
    variants[variant],
    className,
  );

  if (external) {
    return <a className={classes} href={href} target="_blank" rel="noreferrer">{children}</a>;
  }

  return <a className={classes} href={href}>{children}</a>;
}
