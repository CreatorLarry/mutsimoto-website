import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load("tmp/series1-update/source.xlsx"));
const sheets = [];
for (const sheet of workbook.worksheets.items) {
  const used = sheet.getUsedRange(true);
  sheets.push({
    name: sheet.name,
    address: used?.address ?? null,
    imageCount: sheet.images.items.length,
    values: used?.values ?? [],
  });
}
const drawings = await workbook.inspect({ kind: "drawing", maxChars: 500000 });
await fs.writeFile("tmp/series1-update/source-values.json", JSON.stringify(sheets, null, 2));
await fs.writeFile("tmp/series1-update/source-drawings.ndjson", drawings.ndjson);
console.log(JSON.stringify(sheets.map(({ name, address, imageCount, values }) => ({ name, address, imageCount, rows: values.length, cols: values[0]?.length ?? 0 })), null, 2));
