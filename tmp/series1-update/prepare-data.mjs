import fs from "node:fs/promises";
import path from "node:path";

const root = "tmp/series1-update";
const sourceSheets = JSON.parse(await fs.readFile(path.join(root, "source-values.json"), "utf8"));
const imageAssignments = JSON.parse(await fs.readFile(path.join(root, "image-mapping.json"), "utf8"));
const databaseProducts = JSON.parse(await fs.readFile(path.join(root, "database-products.json"), "utf8"));
const sourceRows = sourceSheets[0].values.slice(2);

function text(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function meaningful(value) {
  const valueText = text(value);
  if (!valueText) return "";
  const normalized = valueText.toLowerCase().replace(/[^a-z0-9]+/g, "");
  if (["na", "nil", "none", "notapplicable", "0"].includes(normalized)) return "";
  return valueText;
}

function normalizedPartNumber(value) {
  return text(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

const commonShortWords = new Set(["AND", "FOR", "THE", "OLD", "BUS", "BIG", "SMALL", "PER", "USE"]);

function titleToken(token) {
  if (!token) return token;
  if (/\d/.test(token)) return token.toUpperCase();
  if (token.includes("/")) return token.split("/").map(titleToken).join("/");
  if (token.includes("-")) return token.split("-").map(titleToken).join("-");
  if (/^[A-Z]{2,3}$/.test(token) && !commonShortWords.has(token)) return token;
  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}

function titleText(value) {
  return text(value).split(" ").map(titleToken).join(" ");
}

function productName(row) {
  const description = meaningful(row[7]);
  const fallback = [meaningful(row[6]), meaningful(row[8]), "Fuel Filter"].filter(Boolean).join(" ");
  const candidate = titleText(description || fallback);
  if (candidate.length <= 160) return candidate;
  return titleText(`${meaningful(row[6])} ${meaningful(row[8])} Fuel Filter`).slice(0, 160).trim();
}

function uniqueReferences(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.referenceType}:${normalizedPartNumber(item.referenceNumber)}`;
    if (!normalizedPartNumber(item.referenceNumber) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function referenceValues(value) {
  return meaningful(value)
    .split(/[;,\n]+/)
    .map(meaningful)
    .filter(Boolean)
    .filter((item) => item.length <= 160);
}

const industrialTerms = [
  "generator", "locomotive", "industrial", "work order", "diesel engine",
  "atlas copco", "liebherr", "lister", "kirloskar", "kama", "jiang dong",
  "juag dong", "robin", "perkins", "massey", "new holland", "kubota", "yanmar",
  "taurus diesel", "racor",
];

function applicationType(row) {
  const haystack = [row[6], row[7], row[8]].map(text).join(" ").toLowerCase();
  return industrialTerms.some((term) => haystack.includes(term)) ? "Industrial" : "Automotive";
}

function equipmentDetails(row) {
  const haystack = [row[6], row[7], row[8]].map(text).join(" ").toLowerCase();
  if (haystack.includes("generator")) return { equipmentType: "Generator", industry: "Power Generation" };
  if (haystack.includes("locomotive")) return { equipmentType: "Locomotive", industry: "Transport" };
  if (["perkins", "massey", "new holland", "tractor"].some((term) => haystack.includes(term))) return { equipmentType: "Agricultural Machinery", industry: "Agriculture" };
  return { equipmentType: "Industrial Equipment", industry: "Industrial" };
}

function specification(label, value, unit, displayOrder) {
  const valueText = meaningful(value);
  return valueText ? { label, value: valueText.slice(0, 240), unit, displayOrder } : null;
}

const imagesByPart = new Map();
for (const assignment of imageAssignments) {
  const key = normalizedPartNumber(assignment.partNumber);
  const group = imagesByPart.get(key) ?? [];
  group.push(assignment);
  imagesByPart.set(key, group);
}

const databaseByPart = new Map(databaseProducts.map((product) => [product.part_number_normalized, product]));
const products = [];
const specifications = [];
const references = [];
const vehicleApplications = [];
const equipmentApplications = [];
const images = [];
const audit = [];
const seenProducts = new Set();

for (const row of sourceRows) {
  const partNumber = meaningful(row[1]);
  if (!partNumber) continue;
  const normalized = normalizedPartNumber(partNumber);
  if (seenProducts.has(normalized)) continue;
  seenProducts.add(normalized);

  const make = titleText(meaningful(row[6]) || "Unspecified");
  const model = meaningful(row[8]);
  const name = productName(row);
  const type = applicationType(row);
  const sourceDescription = titleText(meaningful(row[7]) || name);
  const applicationLabel = [make, model].filter(Boolean).join(" ");
  const shortDescription = `${partNumber} is a Mutsimoto fuel filter element for ${applicationLabel || "selected"} applications.`.slice(0, 320);
  const fullDescription = `${sourceDescription}. This Mutsimoto fuel filter element is listed for ${applicationLabel || "the stated application"}. Use the dimensions, gasket details, and cross-reference numbers supplied in this catalogue to confirm compatibility before installation.`;
  const seoTitle = `${partNumber} ${name} | Mutsimoto`.slice(0, 160);
  const seoDescription = `${partNumber} fuel filter element for ${applicationLabel || "automotive and industrial equipment"}. Review dimensions, references, and application details.`.slice(0, 320);

  products.push({
    partNumber,
    name,
    category: "Fuel Elements",
    applicationType: type,
    availability: "Contact for availability",
    featured: "No",
    shortDescription,
    fullDescription,
    seoTitle,
    seoDescription,
    technicalSheetFilename: "",
  });

  const specItems = [
    specification("Height", row[9], "mm", 1),
    specification("Outer Diameter", row[10], "mm", 2),
    specification("Inner Diameter 1", row[11], "mm", 3),
    specification("Inner Diameter 2", row[12], "mm", 4),
    specification("Filter Function", row[21], null, 5),
    specification("Service Position", row[22], null, 6),
    specification("Seal / Gasket Type", row[24], null, 7),
    specification("Catalogue Match", row[23], null, 8),
    specification("Use With", row[5], null, 9),
  ].filter(Boolean);
  for (const item of specItems) specifications.push({ partNumber, ...item });

  const referenceItems = [];
  for (const column of [2, 3, 4, 25, 26, 27, 28, 29, 30, 31]) {
    for (const referenceNumber of referenceValues(row[column])) {
      referenceItems.push({ referenceType: "OEM", manufacturer: make, referenceNumber });
    }
  }
  for (const referenceNumber of referenceValues(row[13])) {
    referenceItems.push({ referenceType: "Alternative", manufacturer: "Mutsimoto", referenceNumber });
  }
  const competitors = [
    [14, "Baldwin"], [15, "Fleetguard"], [16, "Donaldson"],
    [17, "JS Asakashi"], [18, "Sakura"], [19, "Hengst"],
  ];
  for (const [column, manufacturer] of competitors) {
    for (const referenceNumber of referenceValues(row[column])) {
      referenceItems.push({ referenceType: "Competitor", manufacturer, referenceNumber });
    }
  }
  for (const item of uniqueReferences(referenceItems)) references.push({ partNumber, ...item });

  const notes = [meaningful(row[22]), meaningful(row[23])].filter(Boolean).join(" · ") || "Confirm the exact application before supply.";
  if (type === "Automotive") {
    vehicleApplications.push({
      partNumber,
      vehicleBrand: make,
      vehicleModel: titleText(model || `General ${make} application`).slice(0, 160),
      engineManufacturer: "",
      engineModel: "",
      yearFrom: "",
      yearTo: "",
      notes: notes.slice(0, 1000),
    });
  } else {
    const equipment = equipmentDetails(row);
    equipmentApplications.push({
      partNumber,
      equipmentType: equipment.equipmentType,
      industry: equipment.industry,
      manufacturer: make,
      model: titleText(model || "General application").slice(0, 160),
      engineManufacturer: make === "Work Order" ? "Unspecified" : make,
      engineModel: model ? titleText(model).slice(0, 160) : "",
      notes: notes.slice(0, 1000),
    });
  }

  const productImages = imagesByPart.get(normalized) ?? [];
  productImages.forEach((assignment, index) => {
    images.push({
      partNumber,
      imageFilename: assignment.filename,
      altText: `${partNumber} ${name} product view${productImages.length > 1 ? ` ${index + 1}` : ""}`.slice(0, 240),
      displayOrder: index + 1,
      isPrimary: index === 0 ? "Yes" : "No",
    });
  });

  const existing = databaseByPart.get(normalized);
  const existingHasImage = Boolean(existing?.primary_image_url || existing?.product_images?.length);
  const packageHasImage = productImages.length > 0;
  audit.push({
    partNumber,
    name,
    databaseAction: existing ? "Update existing product" : "Create new product",
    currentDatabaseStatus: existing?.publication_status ?? "Not in database",
    packageImages: productImages.length,
    existingDatabaseImage: existingHasImage ? "Yes" : "No",
    recommendedResult: packageHasImage || existingHasImage ? "Eligible to publish" : "Keep as draft — no image",
  });
}

const productKeys = new Set(products.map((product) => normalizedPartNumber(product.partNumber)));
const orphanImages = imageAssignments.filter((item) => !productKeys.has(normalizedPartNumber(item.partNumber)));
const duplicateImageNames = images.map((item) => item.imageFilename.toLowerCase()).filter((name, index, all) => all.indexOf(name) !== index);
const duplicateParts = products.map((item) => normalizedPartNumber(item.partNumber)).filter((part, index, all) => all.indexOf(part) !== index);

const prepared = {
  products,
  specifications,
  references,
  vehicleApplications,
  equipmentApplications,
  images,
  audit,
  quality: {
    sourceRows: sourceRows.filter((row) => meaningful(row[1])).length,
    products: products.length,
    duplicateParts,
    imageAssignments: images.length,
    imageProducts: new Set(images.map((item) => normalizedPartNumber(item.partNumber))).size,
    orphanImages,
    duplicateImageNames,
    updates: audit.filter((item) => item.databaseAction.startsWith("Update")).length,
    creates: audit.filter((item) => item.databaseAction.startsWith("Create")).length,
    publishEligible: audit.filter((item) => item.recommendedResult === "Eligible to publish").length,
    draftNoImage: audit.filter((item) => item.recommendedResult.startsWith("Keep as draft")).length,
  },
};

await fs.writeFile(path.join(root, "prepared-data.json"), JSON.stringify(prepared, null, 2));
console.log(JSON.stringify(prepared.quality, null, 2));
