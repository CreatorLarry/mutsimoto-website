import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const workbookPath = "outputs/019f69ba-c47b-7390-ad3e-e90492895ddb/Mutsimoto 1 Series Catalogue Import - Updated.xlsx";
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));

const products = await workbook.inspect({
  kind: "table",
  range: "Products!A1:K12",
  include: "values,formulas",
  tableMaxRows: 12,
  tableMaxCols: 11,
  maxChars: 12000,
});
const audit = await workbook.inspect({
  kind: "table",
  range: "Import Audit!A1:H15",
  include: "values,formulas",
  tableMaxRows: 15,
  tableMaxCols: 8,
  maxChars: 12000,
});
const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
  maxChars: 6000,
});

await fs.writeFile("tmp/series1-update/verify-products.ndjson", products.ndjson);
await fs.writeFile("tmp/series1-update/verify-audit.ndjson", audit.ndjson);
await fs.writeFile("tmp/series1-update/verify-errors.ndjson", errors.ndjson);

const previewRanges = {
  Instructions: "A1:H31",
  Products: "A1:K18",
  Specifications: "A1:E22",
  References: "A1:D22",
  "Vehicle Applications": "A1:H20",
  "Equipment Applications": "A1:H20",
  Images: "A1:E22",
  "Import Audit": "A1:H18",
};
let index = 0;
for (const [sheetName, range] of Object.entries(previewRanges)) {
  index += 1;
  const preview = await workbook.render({ sheetName, range, scale: 1.2, format: "png" });
  await fs.writeFile(`tmp/series1-update/verify-${index}.png`, new Uint8Array(await preview.arrayBuffer()));
}

const prepared = JSON.parse(await fs.readFile("tmp/series1-update/prepared-data.json", "utf8"));
const checks = {
  sheets: workbook.worksheets.items.map((sheet) => sheet.name),
  productRows: prepared.products.length,
  specifications: prepared.specifications.length,
  references: prepared.references.length,
  vehicleApplications: prepared.vehicleApplications.length,
  equipmentApplications: prepared.equipmentApplications.length,
  imageRows: prepared.images.length,
  sourceDuplicates: prepared.quality.duplicateParts.length,
  orphanImages: prepared.quality.orphanImages.length,
  duplicateImageNames: prepared.quality.duplicateImageNames.length,
  formulaErrors: errors.ndjson.includes('"kind":"match"') ? errors.ndjson.split("\n").filter((line) => line.includes('"kind":"match"')).length : 0,
};
console.log(JSON.stringify(checks, null, 2));
