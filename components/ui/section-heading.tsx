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
      {eyebrow && <p className={cn("mb-4 inline-flex border-l-2 border-[#ef3340] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em]", light ? "bg-white/[0.045] text-[#d7dadd]" : "bg-[#1a2025] text-[#d7dadd]")}>{eyebrow}</p>}
      <h2 className={cn("text-3xl font-black uppercase leading-[1.02] tracking-[-0.045em] sm:text-4xl lg:text-[44px]", light ? "text-white" : "text-white")}>{title}</h2>
      {description && <p className={cn("mt-5 text-base font-medium leading-7", light ? "text-[#b7bdc1]" : "text-[#aeb4b8]")}>{description}</p>}
    </div>
  );
}
