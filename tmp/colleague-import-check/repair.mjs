import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const root = path.resolve(".");
const sourceDir = path.join(root, "workbooks");
const outputDir = path.resolve(
  root,
  "..",
  "..",
  "outputs",
  "019f69ba-c47b-7390-ad3e-e90492895ddb",
  "colleague-corrected",
);
await fs.mkdir(outputDir, { recursive: true });

const repairs = {
  "1 Series.xlsx": {
    output: "Mutsimoto Product Catalogue Import - 1 Series - Corrected.xlsx",
    clearRows: {
      References: [102, 202, 253, 316, 317],
    },
  },
  "2 Series.xlsx": {
    output: "Mutsimoto Product Catalogue Import - 2 Series - Corrected.xlsx",
    clearRows: {
      References: [209, 232, 256, 262, 276, 400, 452, 532],
    },
  },
  "3 Series.xlsx": {
    output: "Mutsimoto Product Catalogue Import - 3 Series - Corrected.xlsx",
    clearRows: {
      References: [408, 428, 635, 656, 660, 665, 712],
    },
    descriptions: {
      32: "Tata 207 automotive oil filter.",
    },
  },
  "4 Series.xlsx": {
    output: "Mutsimoto Product Catalogue Import - 4 Series - Corrected.xlsx",
    clearRows: {
      References: [162, 291, 444, 725, 1149, 1178, 1192, 1355, 1397],
      "Vehicle Applications": [123, 124],
    },
    descriptionFromShort: [91, 103, 134, 143, 164, 251, 268, 272, 316],
  },
};

const rowEnd = {
  References: "D",
  "Vehicle Applications": "H",
};

const requested = process.argv[2];
const entries = Object.entries(repairs).filter(([sourceName]) => !requested || sourceName === requested);

for (const [sourceName, repair] of entries) {
  const workbook = await SpreadsheetFile.importXlsx(
    await FileBlob.load(path.join(sourceDir, sourceName)),
  );

  for (const [sheetName, rows] of Object.entries(repair.clearRows ?? {})) {
    const sheet = workbook.worksheets.getItem(sheetName);
    for (const row of rows) {
      sheet.getRange(`A${row}:${rowEnd[sheetName]}${row}`).clear({ applyTo: "contents" });
    }
  }

  if (repair.descriptions) {
    const products = workbook.worksheets.getItem("Products");
    for (const [row, value] of Object.entries(repair.descriptions)) {
      products.getRange(`H${row}`).values = [[value]];
    }
  }

  if (repair.descriptionFromShort) {
    const products = workbook.worksheets.getItem("Products");
    for (const row of repair.descriptionFromShort) {
      const shortDescription = products.getRange(`G${row}`).values[0][0];
      products.getRange(`H${row}`).values = [[shortDescription]];
    }
  }

  const exported = await SpreadsheetFile.exportXlsx(workbook);
  await exported.save(path.join(outputDir, repair.output));
  console.log(JSON.stringify({ source: sourceName, output: repair.output }));
}
