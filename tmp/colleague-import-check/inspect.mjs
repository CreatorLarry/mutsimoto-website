import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const root = path.resolve(".");
const workbookDir = path.join(root, "workbooks");
const previewDir = path.join(root, "previews-before");
await fs.mkdir(previewDir, { recursive: true });

const workbooks = (await fs.readdir(workbookDir))
  .filter((name) => name.endsWith(".xlsx"))
  .sort();

for (const name of workbooks) {
  const workbook = await SpreadsheetFile.importXlsx(
    await FileBlob.load(path.join(workbookDir, name)),
  );
  const summary = await workbook.inspect({
    kind: "sheet",
    include: "id,name",
    maxChars: 4000,
  });
  console.log(JSON.stringify({ workbook: name, sheets: summary.ndjson }));

  for (const sheetName of [
    "Products",
    "Specifications",
    "References",
    "Vehicle Applications",
    "Equipment Applications",
    "Images",
  ]) {
    const sheet = workbook.worksheets.getItem(sheetName);
    const used = sheet.getUsedRange(true);
    const previewRange = used
      ? used.getRangeByIndexes(0, 0, Math.min(18, used.rowCount), used.columnCount)
      : sheet.getRange("A1:H18");
    const preview = await workbook.render({
      sheetName,
      range: previewRange.address,
      scale: 0.75,
      format: "png",
    });
    await fs.writeFile(
      path.join(previewDir, `${name.replace(/\.xlsx$/i, "")}-${sheetName.replaceAll(" ", "-")}.png`),
      new Uint8Array(await preview.arrayBuffer()),
    );
  }
}
