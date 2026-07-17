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
      {eyebrow && <p className="mb-4 inline-flex rounded-full bg-[#fff0f1] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#d51f2a]">{eyebrow}</p>}
      <h2 className={cn("text-3xl font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-4xl lg:text-[44px]", light ? "text-white" : "text-[#07172b]")}>{title}</h2>
      {description && <p className={cn("mt-5 text-base leading-7", light ? "text-[#b8c3d1]" : "text-[#647287]")}>{description}</p>}
    </div>
  );
}
