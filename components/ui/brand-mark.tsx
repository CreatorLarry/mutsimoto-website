import Image from "next/image";
import Link from "next/link";

export function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef3340] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0d0f]"
      aria-label="Mutsimoto Motor Company home"
    >
      <span className="grid size-14 shrink-0 place-items-center rounded-md border border-white/10 bg-white/[0.035] p-1 transition-transform group-hover:scale-[1.03]">
        <Image
          src="/images/main-logo.png"
          alt="Mutsimoto logo"
          width={56}
          height={56}
          className="h-full w-full object-contain"
        />
      </span>
      <span className="leading-none">
        <span
          className={
            light
              ? "block text-[15px] font-extrabold tracking-[0.08em] text-white"
              : "block text-[15px] font-extrabold tracking-[0.08em] text-white"
          }
        >
          MUTSIMOTO
        </span>
        <span
          className={
            light
              ? "mt-1 block text-[8px] font-bold tracking-[0.2em] text-[#9eacbd]"
              : "mt-1 block text-[8px] font-bold tracking-[0.2em] text-[#aeb4b8]"
          }
        >
          POWERED BY PASSION
        </span>
      </span>
    </Link>
  );
}
