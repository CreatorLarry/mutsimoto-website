import fs from "node:fs";
import * as XLSX from "@e965/xlsx";

const path = "C:/OneDrive_CreatorLarry/OneDrive/Documents/mutsimoto-website/outputs/catalogue-tailoring-20260805/Mutsimoto-1-Series-Import-Ready.xlsx";
const expected = {
  Products: ["part_number", "name", "category", "application_type"],
  Specifications: ["part_number", "label", "value"],
  References: ["part_number", "reference_type", "reference_number"],
  "Vehicle Applications": ["part_number", "vehicle_brand", "vehicle_model"],
  "Equipment Applications": ["part_number", "equipment_type", "manufacturer", "model"],
  Images: ["part_number", "image_filename", "alt_text"],
};
const allowedCategories = new Set(["Oil Element", "Oil Spin On", "Fuel Elements", "Fuel Spin On", "Air Cleaners"]);
const allowedApplications = new Set(["Automotive", "Industrial", "Both"]);
const allowedReferenceTypes = new Set(["OEM", "Competitor", "Alternative"]);

function valueText(value) {
  return value === null || value === undefined ? "" : String(value).trim();
}

function headerText(value) {
  return valueText(value).replace(/\*+$/, "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function normalizedPart(value) {
  return valueText(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

const workbook = XLSX.read(fs.readFileSync(path), { type: "buffer" });
const errors = [];
const rowsBySheet = {};

for (const [sheetName, requiredHeaders] of Object.entries(expected)) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    errors.push(`${sheetName}: worksheet missing`);
    continue;
  }
  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: true });
  const headerIndex = matrix.slice(0, 12).findIndex((row) => row.some((cell) => headerText(cell) === "part_number"));
  if (headerIndex < 0) {
    errors.push(`${sheetName}: part_number header missing`);
    continue;
  }
  const headers = matrix[headerIndex].map(headerText);
  for (const header of requiredHeaders) {
    if (!headers.includes(header)) errors.push(`${sheetName}: required ${header} header missing`);
  }
  rowsBySheet[sheetName] = matrix.slice(headerIndex + 1)
    .filter((row) => row.some((cell) => valueText(cell)))
    .map((row, index) => ({
      rowNumber: headerIndex + index + 2,
      values: Object.fromEntries(headers.map((header, column) => [header, row[column] ?? ""])),
    }));
}

const productParts = new Set();
for (const row of rowsBySheet.Products ?? []) {
  const values = row.values;
  const part = valueText(values.part_number);
  const normalized = normalizedPart(part);
  if (!part || !valueText(values.name) || !allowedCategories.has(valueText(values.category)) || !allowedApplications.has(valueText(values.application_type))) {
    errors.push(`Products row ${row.rowNumber}: invalid required product fields`);
  }
  if (productParts.has(normalized)) errors.push(`Products row ${row.rowNumber}: duplicate part number ${part}`);
  productParts.add(normalized);
  const shortDescription = valueText(values.short_description);
  const fullDescription = valueText(values.full_description);
  if (shortDescription && shortDescription.length < 10) errors.push(`Products row ${row.rowNumber}: short description too short`);
  if (fullDescription && fullDescription.length < 20) errors.push(`Products row ${row.rowNumber}: full description too short`);
}

for (const [sheetName, rows] of Object.entries(rowsBySheet)) {
  if (sheetName === "Products") continue;
  for (const row of rows) {
    if (!productParts.has(normalizedPart(row.values.part_number))) {
      errors.push(`${sheetName} row ${row.rowNumber}: unmatched part number ${valueText(row.values.part_number)}`);
    }
    if (sheetName === "References" && !allowedReferenceTypes.has(valueText(row.values.reference_type))) {
      errors.push(`${sheetName} row ${row.rowNumber}: invalid reference type`);
    }
  }
}

const specificationKeys = new Set();
for (const row of rowsBySheet.Specifications ?? []) {
  const key = `${normalizedPart(row.values.part_number)}:${valueText(row.values.label).toLowerCase().replace(/[^a-z0-9]+/g, "")}`;
  if (specificationKeys.has(key)) errors.push(`Specifications row ${row.rowNumber}: duplicate label for part`);
  specificationKeys.add(key);
}

const referenceKeys = new Set();
for (const row of rowsBySheet.References ?? []) {
  const key = `${normalizedPart(row.values.part_number)}:${valueText(row.values.reference_type)}:${normalizedPart(row.values.reference_number)}`;
  if (referenceKeys.has(key)) errors.push(`References row ${row.rowNumber}: duplicate reference for part`);
  referenceKeys.add(key);
}

const imageFiles = new Set();
const primaryCounts = new Map();
for (const row of rowsBySheet.Images ?? []) {
  const filename = valueText(row.values.image_filename).toLowerCase();
  if (!/\.(jpe?g|png|webp)$/.test(filename)) errors.push(`Images row ${row.rowNumber}: invalid filename`);
  if (imageFiles.has(filename)) errors.push(`Images row ${row.rowNumber}: duplicate filename`);
  imageFiles.add(filename);
  if (valueText(row.values.is_primary).toLowerCase() === "yes") {
    const part = normalizedPart(row.values.part_number);
    primaryCounts.set(part, (primaryCounts.get(part) ?? 0) + 1);
  }
}
for (const [part, count] of primaryCounts) {
  if (count > 1) errors.push(`Images: ${part} has more than one primary image`);
}

const summary = Object.fromEntries(Object.entries(rowsBySheet).map(([sheet, rows]) => [sheet, rows.length]));
console.log(JSON.stringify({ valid: errors.length === 0, errors, summary, fileSize: fs.statSync(path).size }, null, 2));
if (errors.length > 0) process.exitCode = 1;
