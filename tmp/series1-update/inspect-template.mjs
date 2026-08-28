import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load("public/templates/mutsimoto-product-catalogue-import.xlsx"));
console.log((await workbook.inspect({ kind: "workbook,sheet,table", maxChars: 24000, tableMaxRows: 10, tableMaxCols: 18, tableMaxCellChars: 120 })).ndjson);
for (let index = 0; index < workbook.worksheets.items.length; index += 1) {
  const sheet = workbook.worksheets.items[index];
  const preview = await workbook.render({ sheetName: sheet.name, autoCrop: "all", scale: 1.2, format: "png" });
  await fs.writeFile(`tmp/series1-update/template-${index + 1}.png`, new Uint8Array(await preview.arrayBuffer()));
}
