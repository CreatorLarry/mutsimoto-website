import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

export function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className="group inline-flex shrink-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef3340] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0d0f]"
      aria-label="Mutsimoto Motor Company home"
    >
      <span className={cn("grid size-14 shrink-0 place-items-center rounded-md border p-1 transition-transform group-hover:scale-[1.03]", light ? "border-white/10 bg-white/[0.035]" : "border-[var(--theme-border)] bg-[var(--theme-surface-raised)]")}>
        <Image
          src="/images/main-logo.png"
          alt="Mutsimoto logo"
          width={56}
          height={56}
          className="h-full w-full object-contain"
        />
      </span>
      <span className="brand-mark__copy leading-none">
        <span
          className={
            light
              ? "block text-[15px] font-extrabold tracking-[0.08em] text-white"
              : "block text-[15px] font-extrabold tracking-[0.08em] text-[var(--theme-heading)]"
          }
        >
          MUTSIMOTO
        </span>
        <span
          className={
            light
              ? "mt-1 block text-[8px] font-bold tracking-[0.2em] text-[#9eacbd]"
              : "mt-1 block text-[8px] font-bold tracking-[0.2em] text-[var(--theme-muted)]"
          }
        >
          POWERED BY PASSION
        </span>
      </span>
    </Link>
  );
}
