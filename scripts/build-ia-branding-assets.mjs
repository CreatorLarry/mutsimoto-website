import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const root = process.cwd();
const out = path.join(root, "output", "branding", "ia-branch");
const artworkDir = path.join(out, "artwork");
const previewDir = path.join(out, "previews");
const printDir = path.join(out, "print-raster");

await fs.mkdir(artworkDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });
await fs.mkdir(printDir, { recursive: true });

const palette = {
  ink: "#11161A",
  paper: "#F3F1EC",
  red: "#8E1F2D",
  redDark: "#64141E",
  muted: "#777A7D",
  white: "#FFFFFF",
  line: "#D7D4CE",
};

const xml = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const img = (...parts) => path.join(root, "public", "images", ...parts);

async function dataUri(file) {
  const ext = path.extname(file).toLowerCase();
  const bytes = ext === ".webp" ? await sharp(file).png().toBuffer() : await fs.readFile(file);
  const mime = ext === ".png" || ext === ".webp" ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

const assets = {
  mark: await dataUri(img("main-logo.png")),
  brands: {
    powerFilter: await dataUri(img("filter-brands", "power-filter.png")),
    sunny: await dataUri(img("filter-brands", "sunny-genuine-filters.png")),
    powerGuard: await dataUri(img("filter-brands", "power-guard.png")),
    filterGuard: await dataUri(img("filter-brands", "filter-guard.png")),
    motokool: await dataUri(img("filter-brands", "motokool.png")),
  },
  products: {
    hero: await dataUri(img("hero-filters", "air-oil-fuel-set.png")),
    yellow: await dataUri(img("hero-filters", "air-oil-filter-set.png")),
    white: await dataUri(img("hero-filters", "filter-guard-oil-fuel.png")),
  },
  applications: {
    passenger: await dataUri(img("applications", "passenger-vehicles.webp")),
    commercial: await dataUri(img("applications", "commercial-vehicles.webp")),
    construction: await dataUri(img("applications", "construction-equipment.webp")),
    generators: await dataUri(img("applications", "generators.webp")),
    agriculture: await dataUri(img("applications", "agricultural-machinery.webp")),
    industrial: await dataUri(img("applications", "industrial-equipment.webp")),
  },
};

function svgOpen(width, height, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${xml(title)}">
  <rect width="${width}" height="${height}" fill="${palette.paper}"/>
  <style>
    .sans{font-family:Arial,Helvetica,sans-serif}.heavy{font-weight:800}.bold{font-weight:700}
    .track{letter-spacing:.18em}.track2{letter-spacing:.08em}
  </style>`;
}

function corporateLockup(x, y, markSize, wordSize, dark = false) {
  const color = dark ? palette.white : palette.ink;
  return `<image href="${assets.mark}" x="${x}" y="${y}" width="${markSize}" height="${markSize}" preserveAspectRatio="xMidYMid meet"/>
  <text x="${x + markSize + markSize * .18}" y="${y + markSize * .56}" class="sans heavy" font-size="${wordSize}" fill="${color}">MUTSIMOTO</text>
  <text x="${x + markSize + markSize * .19}" y="${y + markSize * .83}" class="sans bold track" font-size="${wordSize * .25}" fill="${dark ? "#D5D7D8" : palette.muted}">POWERED BY PASSION</text>`;
}

function brandImage(href, x, y, w, h) {
  return `<image href="${href}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>`;
}

function border(width, height) {
  return `<rect x="12" y="12" width="${width - 24}" height="${height - 24}" fill="none" stroke="${palette.red}" stroke-width="12"/>`;
}

function leftBanner() {
  const w = 5400, h = 2400;
  return `${svgOpen(w,h,"Mutsimoto 18 by 8 foot corporate brand banner")}
    <rect width="1520" height="2400" fill="${palette.ink}"/>
    <path d="M0 0h1520v420L0 1120z" fill="${palette.redDark}" opacity=".96"/>
    <image href="${assets.mark}" x="270" y="535" width="980" height="980" preserveAspectRatio="xMidYMid meet"/>
    <text x="760" y="1785" text-anchor="middle" class="sans heavy track2" font-size="188" fill="${palette.white}">MUTSIMOTO</text>
    <text x="760" y="1955" text-anchor="middle" class="sans bold track" font-size="62" fill="#D5D7D8">POWERED BY PASSION</text>
    <rect x="1720" y="250" width="3380" height="12" fill="${palette.red}"/>
    <text x="1720" y="520" class="sans heavy" font-size="176" fill="${palette.ink}">OUR BRAND PORTFOLIO</text>
    <text x="1720" y="675" class="sans bold track2" font-size="62" fill="${palette.muted}">PURPOSE-BUILT FOR AFRICAN OPERATING CONDITIONS</text>
    <line x1="1720" y1="820" x2="5100" y2="820" stroke="${palette.line}" stroke-width="6"/>
    ${brandImage(assets.brands.powerFilter, 1720, 940, 1020, 500)}
    ${brandImage(assets.brands.sunny, 2920, 930, 820, 520)}
    ${brandImage(assets.brands.powerGuard, 3970, 940, 980, 500)}
    ${brandImage(assets.brands.filterGuard, 1900, 1570, 1120, 460)}
    ${brandImage(assets.brands.motokool, 3460, 1540, 1000, 500)}
    <rect x="1720" y="2180" width="3380" height="12" fill="${palette.red}"/>
    ${border(w,h)}
  </svg>`;
}

function rightBanner() {
  const w = 4800, h = 2400;
  return `${svgOpen(w,h,"Mutsimoto 16 by 8 foot product banner")}
    <defs>
      <linearGradient id="bg" x1="0" x2="1"><stop stop-color="${palette.paper}"/><stop offset=".7" stop-color="#E7E3DC"/><stop offset="1" stop-color="#D6D1C8"/></linearGradient>
      <linearGradient id="red" x1="0" x2="1"><stop stop-color="${palette.redDark}"/><stop offset="1" stop-color="${palette.red}"/></linearGradient>
    </defs>
    <rect width="4800" height="2400" fill="url(#bg)"/>
    <rect width="4800" height="170" fill="${palette.ink}"/>
    <rect y="170" width="4800" height="18" fill="${palette.red}"/>
    ${corporateLockup(270, 330, 520, 205)}
    <text x="300" y="1210" class="sans heavy" font-size="250" fill="${palette.ink}">ENGINEERED</text>
    <text x="300" y="1460" class="sans heavy" font-size="250" fill="${palette.red}">TO PERFORM.</text>
    <text x="310" y="1650" class="sans bold track2" font-size="74" fill="${palette.muted}">FILTRATION FOR ROAD, FLEET, POWER &amp; INDUSTRY</text>
    <rect x="300" y="1840" width="1900" height="155" rx="77" fill="${palette.ink}"/>
    <text x="1250" y="1945" text-anchor="middle" class="sans bold track2" font-size="62" fill="${palette.white}">AIR  •  OIL  •  FUEL  •  HYDRAULIC  •  COOLANT</text>
    <path d="M2590 188h2210v2212H2170c600-530 730-1300 420-2212z" fill="url(#red)" opacity=".96"/>
    <circle cx="3740" cy="1200" r="850" fill="#FFFFFF" opacity=".08"/>
    <image href="${assets.products.hero}" x="2480" y="400" width="2200" height="1800" preserveAspectRatio="xMidYMid meet"/>
    ${border(w,h)}
  </svg>`;
}

const categoriesA = [
  ["01", "LIGHT COMMERCIAL", "VEHICLES", "commercial"],
  ["02", "HEAVY COMMERCIAL", "VEHICLES", "commercial"],
  ["03", "MATATUS &", "PSVs", "commercial"],
  ["04", "PASSENGER", "CARS", "passenger"],
  ["05", "4WDs &", "SUVs", "passenger"],
  ["06", "PICKUPS", "", "passenger"],
  ["07", "GENERATORS", "", "generators"],
];

const categoriesB = [
  ["08", "CONSTRUCTION", "EQUIPMENT", "construction"],
  ["09", "MINING", "EQUIPMENT", "construction"],
  ["10", "AGRICULTURAL", "MACHINERY", "agriculture"],
  ["11", "TRACTORS", "", "agriculture"],
  ["12", "COMPRESSORS", "", "industrial"],
  ["13", "INDUSTRIAL & PLANT", "MACHINERY", "industrial"],
];

function parkingArtwork(width, height, categories, title) {
  const top = Math.round(height * .18);
  const tileW = width / categories.length;
  const clips = categories.map((_, i) => `<clipPath id="p${i}"><rect x="${i*tileW}" y="${top}" width="${tileW}" height="${height-top}"/></clipPath>`).join("");
  const tiles = categories.map((c, i) => {
    const x = i * tileW;
    const photoH = Math.round((height-top)*.57);
    const dark = i % 2 === 1;
    return `<g>
      <rect x="${x}" y="${top}" width="${tileW}" height="${height-top}" fill="${dark ? palette.ink : palette.paper}"/>
      <image href="${assets.applications[c[3]]}" x="${x}" y="${top}" width="${tileW}" height="${photoH}" preserveAspectRatio="xMidYMid slice" clip-path="url(#p${i})"/>
      <rect x="${x}" y="${top}" width="${tileW}" height="${photoH}" fill="${dark ? palette.ink : palette.redDark}" opacity=".27"/>
      <rect x="${x}" y="${top+photoH-10}" width="${tileW}" height="18" fill="${palette.red}"/>
      <text x="${x+tileW*.08}" y="${top+photoH+Math.round((height-top)*.15)}" class="sans heavy" font-size="${Math.round(tileW*.19)}" fill="${palette.red}">${c[0]}</text>
      <text x="${x+tileW*.08}" y="${top+photoH+Math.round((height-top)*.29)}" class="sans heavy" font-size="${Math.round(tileW*.069)}" fill="${dark ? palette.white : palette.ink}">${xml(c[1])}</text>
      ${c[2] ? `<text x="${x+tileW*.08}" y="${top+photoH+Math.round((height-top)*.38)}" class="sans heavy" font-size="${Math.round(tileW*.069)}" fill="${dark ? palette.white : palette.ink}">${xml(c[2])}</text>` : ""}
      <line x1="${x+tileW}" y1="${top+35}" x2="${x+tileW}" y2="${height-35}" stroke="${palette.line}" stroke-width="3" opacity=".5"/>
    </g>`;
  }).join("");
  return `${svgOpen(width,height,title)}
    <defs>${clips}</defs>
    <rect width="${width}" height="${top}" fill="${palette.ink}"/>
    ${corporateLockup(Math.round(width*.025), Math.round(top*.16), Math.round(top*.68), Math.round(top*.26), true)}
    <text x="${Math.round(width*.975)}" y="${Math.round(top*.53)}" text-anchor="end" class="sans heavy" font-size="${Math.round(top*.25)}" fill="${palette.white}">BUILT FOR EVERY APPLICATION.</text>
    <text x="${Math.round(width*.975)}" y="${Math.round(top*.76)}" text-anchor="end" class="sans bold track2" font-size="${Math.round(top*.09)}" fill="#C9CCCE">13 APPLICATION CATEGORIES  •  ONE FILTRATION PARTNER</text>
    ${tiles}
    ${border(width,height)}
  </svg>`;
}

const outputs = [
  { name: "01-left-corporate-brand-banner-18x8ft", svg: leftBanner(), width: 5400 },
  { name: "02-right-product-banner-16x8ft", svg: rightBanner(), width: 4800 },
  { name: "03-parking-categories-01-07-22.5x8ft", svg: parkingArtwork(6750,2400,categoriesA,"Parking application categories 01 to 07") , width: 6750 },
  { name: "04-parking-categories-08-13-22.4x9.2ft", svg: parkingArtwork(6720,2760,categoriesB,"Parking application categories 08 to 13"), width: 6720 },
];

for (const item of outputs) {
  const svgPath = path.join(artworkDir, `${item.name}.svg`);
  const pngPath = path.join(previewDir, `${item.name}.png`);
  const printPath = path.join(printDir, `${item.name}-250dpi-at-1to10.png`);
  await fs.writeFile(svgPath, item.svg, "utf8");
  await sharp(Buffer.from(item.svg)).resize({ width: Math.min(2400, item.width) }).png({ compressionLevel: 9 }).toFile(pngPath);
  await sharp(Buffer.from(item.svg)).png({ compressionLevel: 9 }).toFile(printPath);
}

await fs.writeFile(path.join(out, "category-copy-proposed.txt"), `PROPOSED 13-CATEGORY APPLICATION SYSTEM - COPY APPROVAL REQUIRED\n\n01 Light Commercial Vehicles\n02 Heavy Commercial Vehicles\n03 Matatus & PSVs\n04 Passenger Cars\n05 4WDs & SUVs\n06 Pickups\n07 Generators\n08 Construction Equipment\n09 Mining Equipment\n10 Agricultural Machinery\n11 Tractors\n12 Compressors\n13 Industrial & Plant Machinery\n`, "utf8");

console.log(JSON.stringify(outputs.map(({name}) => ({ name, svg: path.join(artworkDir, `${name}.svg`), preview: path.join(previewDir, `${name}.png`) })), null, 2));
