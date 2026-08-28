import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

async function inspectWorkbook(label, path) {
  const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(path));
  const overview = await workbook.inspect({
    kind: "workbook,sheet,table,drawing",
    maxChars: 20000,
    tableMaxRows: 8,
    tableMaxCols: 12,
    tableMaxCellChars: 100,
  });
  console.log(`===== ${label} OVERVIEW =====`);
  console.log(overview.ndjson);

  const sheets = workbook.worksheets.items;
  for (let index = 0; index < sheets.length; index += 1) {
    const sheet = sheets[index];
    const used = sheet.getUsedRange(true);
    console.log(`===== ${label} SHEET ${index + 1}: ${sheet.name} =====`);
    console.log(`used=${used?.address ?? "none"} images=${sheet.images.items.length} tables=${sheet.tables.items.length}`);
    const preview = await workbook.render({ sheetName: sheet.name, autoCrop: "all", scale: 0.9, format: "png" });
    await fs.writeFile(`tmp/series1-update/${label.toLowerCase()}-${index + 1}.png`, new Uint8Array(await preview.arrayBuffer()));
  }
}

await inspectWorkbook("SOURCE", "tmp/series1-update/source.xlsx");
await inspectWorkbook("TEMPLATE", "public/templates/mutsimoto-product-catalogue-import.xlsx");
