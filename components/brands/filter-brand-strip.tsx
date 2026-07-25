import Image from "next/image";

const filterBrands = [
  {
    name: "Power Filter",
    src: "/images/filter-brands/power-filter.png",
    width: 267,
    height: 126,
  },
  {
    name: "Sunny Genuine Filters",
    src: "/images/filter-brands/sunny-genuine-filters.png",
    width: 200,
    height: 152,
  },
  {
    name: "Power Guard",
    src: "/images/filter-brands/power-guard.png",
    width: 280,
    height: 138,
  },
  {
    name: "Filter Guard",
    src: "/images/filter-brands/filter-guard.png",
    width: 315,
    height: 130,
  },
  {
    name: "MotoKool",
    src: "/images/filter-brands/motokool.png",
    width: 75,
    height: 59,
  },
];

export function FilterBrandStrip() {
  return (
    <section className="filter-brand-strip border-y border-[#353d43]" aria-labelledby="filter-brand-strip-title">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8 lg:px-10">
        <div>
          <p className="font-mono text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#ef3340]">Mutsimoto brand portfolio</p>
          <h2 id="filter-brand-strip-title" className="filter-brand-strip__title mt-2 text-xl font-extrabold uppercase tracking-[-0.025em] text-white sm:text-2xl">Purpose-built brands. Proven performance focus.</h2>
        </div>
        <p className="filter-brand-strip__copy max-w-md text-xs font-semibold uppercase tracking-[0.06em] text-[#aeb4b8] sm:text-right">Automotive, motorcycle, power, and industrial coverage for demanding applications</p>
      </div>

      <div className="filter-brand-strip__viewport border-t border-[#353d43] py-5">
        <div className="filter-brand-strip__track">
          {Array.from({ length: 4 }, (_, groupIndex) => (
            <ul
              key={groupIndex}
              className="filter-brand-strip__group"
              aria-hidden={groupIndex === 0 ? undefined : true}
            >
              {filterBrands.map((brand) => (
                <li key={brand.name} className="filter-brand-strip__item">
                  <Image
                    src={brand.src}
                    alt={groupIndex === 0 ? `${brand.name} company brand` : ""}
                    width={brand.width}
                    height={brand.height}
                    className="filter-brand-strip__logo"
                  />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
