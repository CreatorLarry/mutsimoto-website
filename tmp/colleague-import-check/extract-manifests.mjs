import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const root = path.resolve(".");
const correctedDir = path.resolve(
  root,
  "..",
  "..",
  "outputs",
  "019f69ba-c47b-7390-ad3e-e90492895ddb",
  "colleague-corrected",
);
const manifests = {};

for (const series of [1, 2, 3, 4]) {
  const file = `Mutsimoto Product Catalogue Import - ${series} Series - Corrected.xlsx`;
  const workbook = await SpreadsheetFile.importXlsx(
    await FileBlob.load(path.join(correctedDir, file)),
  );
  const images = workbook.worksheets.getItem("Images").getUsedRange(true).values;
  manifests[`${series} Series`] = images
    .slice(4)
    .map((row) => String(row[1] ?? "").trim())
    .filter(Boolean);
}

await fs.writeFile(
  path.join(root, "image-manifests.json"),
  JSON.stringify(manifests, null, 2),
);
console.log(JSON.stringify(Object.fromEntries(
  Object.entries(manifests).map(([series, files]) => [series, files.length]),
)));
