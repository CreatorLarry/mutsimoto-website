import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const templatePath = "C:/OneDrive_CreatorLarry/OneDrive/Documents/mutsimoto-website/public/templates/mutsimoto-product-catalogue-import.xlsx";
const previewDir = "C:/OneDrive_CreatorLarry/OneDrive/Documents/mutsimoto-website/outputs/catalogue-tailoring-20260805/previews";

await fs.mkdir(previewDir, { recursive: true });
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(templatePath));
console.log((await workbook.inspect({
  kind: "workbook,sheet,table",
  maxChars: 24000,
  tableMaxRows: 16,
  tableMaxCols: 40,
  tableMaxCellChars: 180,
})).ndjson);

const sheetNames = ["Instructions", "Products", "Specifications", "References", "Vehicle Applications", "Equipment Applications", "Images"];
for (const sheetName of sheetNames) {
  const preview = await workbook.render({
    sheetName,
    autoCrop: "all",
    scale: 1,
    format: "png",
  });
  await fs.writeFile(`${previewDir}/${sheetName.replaceAll(" ", "-")}.png`, new Uint8Array(await preview.arrayBuffer()));
  console.log(`rendered ${sheetName}`);
}
