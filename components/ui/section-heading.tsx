import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
}

export function SectionHeading({ eyebrow, title, description, align = "left", light = false }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && <p className={cn("mb-4 inline-flex rounded-full border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em]", light ? "border-white/15 bg-white/10 text-[#ffb4b8]" : "border-[#c91923] bg-[#d51f2a] text-white")}>{eyebrow}</p>}
      <h2 className={cn("text-3xl font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-4xl lg:text-[44px]", light ? "text-white" : "text-[#041323]")}>{title}</h2>
      {description && <p className={cn("mt-5 text-base font-medium leading-7", light ? "text-[#d1d9e3]" : "text-[#46566b]")}>{description}</p>}
    </div>
  );
}
