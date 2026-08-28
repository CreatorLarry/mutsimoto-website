import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const series = process.argv[2];
if (!series || !["1", "2", "3", "4"].includes(series)) {
  throw new Error("Pass a series number from 1 to 4.");
}

const root = path.resolve(".");
const correctedDir = path.resolve(
  root,
  "..",
  "..",
  "outputs",
  "019f69ba-c47b-7390-ad3e-e90492895ddb",
  "colleague-corrected",
);
const file = `Mutsimoto Product Catalogue Import - ${series} Series - Corrected.xlsx`;
const workbook = await SpreadsheetFile.importXlsx(
  await FileBlob.load(path.join(correctedDir, file)),
);
const previewDir = path.join(root, "previews-after", `${series}-series`);
await fs.mkdir(previewDir, { recursive: true });

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: `${series} Series final formula error scan`,
  maxChars: 6000,
});
console.log(JSON.stringify({ series, formulaErrors: errors.ndjson }));

for (const sheetName of [
  "Instructions",
  "Products",
  "Specifications",
  "References",
  "Vehicle Applications",
  "Equipment Applications",
  "Images",
]) {
  const sheet = workbook.worksheets.getItem(sheetName);
  const used = sheet.getUsedRange(true);
  const rowCount = Math.min(sheetName === "Instructions" ? 31 : 18, used?.rowCount ?? 18);
  const range = used
    ? used.getRangeByIndexes(0, 0, rowCount, used.columnCount)
    : sheet.getRange("A1:H18");
  const preview = await workbook.render({
    sheetName,
    range: range.address,
    scale: 0.6,
    format: "png",
  });
  await fs.writeFile(
    path.join(previewDir, `${sheetName.replaceAll(" ", "-")}.png`),
    new Uint8Array(await preview.arrayBuffer()),
  );
}
