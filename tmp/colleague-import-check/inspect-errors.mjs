import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const root = path.resolve(".");
const checks = {
  "1 Series.xlsx": {
    References: [102, 202, 253, 316, 317],
  },
  "2 Series.xlsx": {
    References: [209, 232, 256, 262, 276, 400, 452, 532],
  },
  "3 Series.xlsx": {
    Products: [32],
    References: [408, 428, 635, 656, 660, 665, 712],
  },
  "4 Series.xlsx": {
    Products: [91, 103, 134, 143, 164, 251, 268, 272, 316],
    References: [162, 291, 444, 725, 1149, 1178, 1192, 1355, 1397],
    "Vehicle Applications": [123, 124],
  },
};

for (const [file, sheets] of Object.entries(checks)) {
  const workbook = await SpreadsheetFile.importXlsx(
    await FileBlob.load(path.join(root, "workbooks", file)),
  );
  for (const [sheetName, rows] of Object.entries(sheets)) {
    const sheet = workbook.worksheets.getItem(sheetName);
    const maxCol = sheetName === "Products" ? "K" : sheetName === "References" ? "D" : "H";
    console.log(JSON.stringify({
      file,
      sheet: sheetName,
      rows: rows.map((row) => ({
        row,
        values: sheet.getRange(`A${row}:${maxCol}${row}`).values[0],
      })),
    }, null, 2));
  }
}
