import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const root = "tmp/series1-update";
const outputDir = "outputs/019f69ba-c47b-7390-ad3e-e90492895ddb";
const outputPath = path.join(outputDir, "Mutsimoto 1 Series Catalogue Import - Updated.xlsx");
const prepared = JSON.parse(await fs.readFile(path.join(root, "prepared-data.json"), "utf8"));
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load("public/templates/mutsimoto-product-catalogue-import.xlsx"));

const navy = "#07172B";
const blue = "#1D4D73";
const red = "#EF2637";
const paleBlue = "#DFF2FA";
const white = "#FFFFFF";
const ink = "#13283C";
const muted = "#5C6C7C";
const line = "#CCD9E3";

function columnName(index) {
  let result = "";
  let value = index + 1;
  while (value > 0) {
    value -= 1;
    result = String.fromCharCode(65 + (value % 26)) + result;
    value = Math.floor(value / 26);
  }
  return result;
}

function styleDataSheet(sheetName, rows, options) {
  const sheet = workbook.worksheets.getItem(sheetName);
  const columnCount = options.widths.length;
  const lastColumn = columnName(columnCount - 1);
  const lastRow = Math.max(5, 4 + rows.length);
  const clearLastRow = Math.max(lastRow, sheet.getUsedRange(true)?.rowCount ?? lastRow);
  sheet.getRange(`A5:${lastColumn}${clearLastRow}`).clear({ applyTo: "contents" });
  if (rows.length > 0) sheet.getRange(`A5:${lastColumn}${lastRow}`).values = rows;

  sheet.showGridLines = false;
  sheet.freezePanes.freezeRows(4);
  sheet.getRange(`A1:${lastColumn}1`).format = {
    fill: navy,
    font: { bold: true, color: white, size: 16 },
    verticalAlignment: "center",
  };
  sheet.getRange(`A2:${lastColumn}2`).format = {
    fill: navy,
    font: { color: "#B9C8D6", size: 9 },
    wrapText: true,
    verticalAlignment: "center",
  };
  sheet.getRange(`A4:${lastColumn}4`).format = {
    fill: blue,
    font: { bold: true, color: white, size: 9 },
    wrapText: true,
    verticalAlignment: "center",
    borders: { bottom: { style: "medium", color: navy } },
  };
  for (const range of options.requiredRanges) {
    sheet.getRange(range).format.fill = red;
  }

  if (rows.length > 0) {
    const body = sheet.getRange(`A5:${lastColumn}${lastRow}`);
    body.format = {
      fill: white,
      font: { color: ink, size: 9 },
      verticalAlignment: "top",
      wrapText: true,
      borders: { insideHorizontal: { style: "thin", color: line } },
    };
    for (let row = 6; row <= lastRow; row += 2) {
      sheet.getRange(`A${row}:${lastColumn}${row}`).format.fill = paleBlue;
    }
    body.format.rowHeight = options.rowHeight ?? 30;
  }

  options.widths.forEach((width, index) => {
    sheet.getRange(`${columnName(index)}:${columnName(index)}`).format.columnWidthPx = width;
  });
  sheet.getRange("1:1").format.rowHeight = 30;
  sheet.getRange("2:2").format.rowHeight = 34;
  sheet.getRange("4:4").format.rowHeight = 34;
  return { sheet, lastRow };
}

const productRows = prepared.products.map((item) => [
  item.partNumber, item.name, item.category, item.applicationType, item.availability,
  item.featured, item.shortDescription, item.fullDescription, item.seoTitle,
  item.seoDescription, item.technicalSheetFilename,
]);
const products = styleDataSheet("Products", productRows, {
  requiredRanges: ["A4:D4"],
  widths: [120, 250, 130, 125, 150, 80, 280, 360, 240, 300, 190],
  rowHeight: 52,
});
products.sheet.getRange(`C5:C${products.lastRow}`).dataValidation = { rule: { type: "list", values: ["Oil Element", "Oil Spin On", "Fuel Elements", "Fuel Spin On", "Air Cleaners"] } };
products.sheet.getRange(`D5:D${products.lastRow}`).dataValidation = { rule: { type: "list", values: ["Automotive", "Industrial", "Both"] } };
products.sheet.getRange(`F5:F${products.lastRow}`).dataValidation = { rule: { type: "list", values: ["Yes", "No"] } };

const specificationRows = prepared.specifications.map((item) => [item.partNumber, item.label, item.value, item.unit ?? "", item.displayOrder]);
const specifications = styleDataSheet("Specifications", specificationRows, {
  requiredRanges: ["A4:C4"],
  widths: [130, 190, 240, 90, 110],
  rowHeight: 25,
});
specifications.sheet.getRange(`E5:E${specifications.lastRow}`).format.numberFormat = "0";

const referenceRows = prepared.references.map((item) => [item.partNumber, item.referenceType, item.manufacturer, item.referenceNumber]);
const references = styleDataSheet("References", referenceRows, {
  requiredRanges: ["A4:B4", "D4:D4"],
  widths: [130, 120, 180, 210],
  rowHeight: 25,
});
references.sheet.getRange(`B5:B${references.lastRow}`).dataValidation = { rule: { type: "list", values: ["OEM", "Competitor", "Alternative"] } };

const vehicleRows = prepared.vehicleApplications.map((item) => [
  item.partNumber, item.vehicleBrand, item.vehicleModel, item.engineManufacturer,
  item.engineModel, item.yearFrom, item.yearTo, item.notes,
]);
const vehicles = styleDataSheet("Vehicle Applications", vehicleRows, {
  requiredRanges: ["A4:C4"],
  widths: [130, 170, 250, 180, 190, 90, 90, 300],
  rowHeight: 34,
});
vehicles.sheet.getRange(`F5:G${vehicles.lastRow}`).format.numberFormat = "0";

const equipmentRows = prepared.equipmentApplications.map((item) => [
  item.partNumber, item.equipmentType, item.industry, item.manufacturer,
  item.model, item.engineManufacturer, item.engineModel, item.notes,
]);
styleDataSheet("Equipment Applications", equipmentRows, {
  requiredRanges: ["A4:B4", "D4:E4"],
  widths: [130, 190, 150, 180, 240, 180, 190, 300],
  rowHeight: 34,
});

const imageRows = prepared.images.map((item) => [item.partNumber, item.imageFilename, item.altText, item.displayOrder, item.isPrimary]);
const images = styleDataSheet("Images", imageRows, {
  requiredRanges: ["A4:C4"],
  widths: [130, 220, 340, 110, 110],
  rowHeight: 30,
});
images.sheet.getRange(`D5:D${images.lastRow}`).format.numberFormat = "0";
images.sheet.getRange(`E5:E${images.lastRow}`).dataValidation = { rule: { type: "list", values: ["Yes", "No"] } };

const audit = workbook.worksheets.add("Import Audit");
audit.showGridLines = false;
audit.freezePanes.freezeRows(6);
audit.mergeCells("A1:H1");
audit.mergeCells("A2:H2");
audit.getRange("A1").values = [["Mutsimoto 1 Series — Import Readiness Audit"]];
audit.getRange("A2").values = [["Part numbers were matched against the current catalogue. New embedded photos are mapped by their exact source row; products with no package or database image must remain drafts."]];
audit.getRange("A1:H1").format = { fill: navy, font: { bold: true, color: white, size: 17 }, verticalAlignment: "center" };
audit.getRange("A2:H2").format = { fill: navy, font: { color: "#B9C8D6", size: 9 }, wrapText: true, verticalAlignment: "center" };
audit.getRange("A3:H3").values = [["Total products", null, "Existing updates", null, "Eligible to publish", null, "Draft — no image", null]];
audit.getRange("A4:H4").formulas = [[
  "=COUNTA(A7:A79)", null,
  "=COUNTIF(C7:C79,\"Update existing product\")", null,
  "=COUNTIF(G7:G79,\"Eligible to publish\")", null,
  "=COUNTIF(G7:G79,\"Keep as draft — no image\")", null,
]];
for (const pair of [["A3:B4", blue], ["C3:D4", "#334C63"], ["E3:F4", "#1A6B57"], ["G3:H4", "#A93640"]]) {
  audit.getRange(pair[0]).format = { fill: pair[1], font: { color: white, bold: true }, verticalAlignment: "center" };
}
audit.getRange("A3:H3").format.font.size = 9;
audit.getRange("A4:H4").format.font.size = 18;
audit.getRange("A6:H6").values = [["Part number", "Product name", "Database action", "Current status", "Package images", "Existing DB image", "Recommended result", "Review note"]];
audit.getRange("A6:H6").format = { fill: red, font: { bold: true, color: white, size: 9 }, wrapText: true, verticalAlignment: "center" };
const auditRows = prepared.audit.map((item) => [
  item.partNumber,
  item.name,
  item.databaseAction,
  item.currentDatabaseStatus,
  item.packageImages,
  item.existingDatabaseImage,
  item.recommendedResult,
  item.packageImages > 0
    ? "New embedded image mapped to this exact part number."
    : item.existingDatabaseImage === "Yes"
      ? "No new source photo; retain the existing database image."
      : "No source or database photo; request an image before publishing.",
]);
audit.getRange("A7:H79").values = auditRows;
audit.getRange("A7:H79").format = {
  fill: white,
  font: { color: ink, size: 9 },
  wrapText: true,
  verticalAlignment: "top",
  borders: { insideHorizontal: { style: "thin", color: line } },
  rowHeight: 40,
};
for (let row = 8; row <= 79; row += 2) audit.getRange(`A${row}:H${row}`).format.fill = paleBlue;
audit.getRange("G7:G79").conditionalFormats.add("containsText", { text: "Eligible to publish", format: { fill: "#DDF4E8", font: { color: "#146B4B", bold: true } } });
audit.getRange("G7:G79").conditionalFormats.add("containsText", { text: "Keep as draft", format: { fill: "#FDE7E9", font: { color: "#A72934", bold: true } } });
audit.getRange("E7:E79").format.numberFormat = "0";
[120, 280, 170, 120, 110, 125, 190, 330].forEach((width, index) => {
  audit.getRange(`${columnName(index)}:${columnName(index)}`).format.columnWidthPx = width;
});
audit.getRange("1:1").format.rowHeight = 32;
audit.getRange("2:2").format.rowHeight = 40;
audit.getRange("3:4").format.rowHeight = 28;
audit.getRange("6:6").format.rowHeight = 34;

await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(outputPath);
