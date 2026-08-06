import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const templatePath = "C:/OneDrive_CreatorLarry/OneDrive/Documents/mutsimoto-website/public/templates/mutsimoto-product-catalogue-import.xlsx";
const dataPath = "C:/OneDrive_CreatorLarry/OneDrive/Documents/mutsimoto-website/outputs/catalogue-tailoring-20260805/catalogue-data.json";
const outputDir = "C:/OneDrive_CreatorLarry/OneDrive/Documents/mutsimoto-website/outputs/catalogue-tailoring-20260805";
const outputPath = `${outputDir}/Mutsimoto-1-Series-Import-Ready.xlsx`;
const previewDir = `${outputDir}/final-previews`;

const data = JSON.parse(await fs.readFile(dataPath, "utf8"));
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(templatePath));

const navy = "#07172B";
const blue = "#1D4B73";
const red = "#E52833";
const paleBlue = "#EAF5F8";
const paleRed = "#FDECEE";
const border = "#D7E1EA";
const text = "#26364B";

function lastRow(rows) {
  return Math.max(5, rows.length + 4);
}

function styleDataSheet(sheet, lastColumn, rows, widths, validations = []) {
  const finalRow = lastRow(rows);
  sheet.showGridLines = false;
  sheet.freezePanes.freezeRows(4);
  sheet.getRange(`A5:${lastColumn}1000`).clear({ applyTo: "contents" });
  if (rows.length > 0) {
    sheet.getRange(`A5:${lastColumn}${finalRow}`).values = rows;
  }

  const dataRange = sheet.getRange(`A5:${lastColumn}${finalRow}`);
  dataRange.format = {
    fill: "#FFFFFF",
    font: { color: text, size: 9, italic: false },
    verticalAlignment: "top",
    wrapText: true,
    borders: {
      insideHorizontal: { style: "thin", color: border },
      insideVertical: { style: "thin", color: border },
      bottom: { style: "thin", color: border },
    },
  };
  dataRange.conditionalFormats.deleteAll();
  dataRange.conditionalFormats.addCustom("=MOD(ROW(),2)=0", { fill: paleBlue });
  dataRange.format.rowHeight = 28;

  const header = sheet.getRange(`A4:${lastColumn}4`);
  header.format = {
    fill: red,
    font: { bold: true, color: "#FFFFFF", size: 9 },
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "inside", style: "thin", color: "#FFFFFF" },
  };
  header.format.rowHeight = 30;

  widths.forEach(([column, width]) => {
    sheet.getRange(`${column}:${column}`).format.columnWidth = width;
  });

  validations.forEach(({ range, values }) => {
    sheet.getRange(`${range}5:${range}${Math.max(finalRow, 500)}`).dataValidation = {
      rule: { type: "list", values },
    };
  });
}

const instructions = workbook.worksheets.getItem("Instructions");
instructions.getRange("A1").values = [["Mutsimoto 1 Series Catalogue — Import Workbook"]];
instructions.getRange("A2").values = [["Converted from FINAL 1 SERIES CATALOGUE.xlsx. Review draft records in the dashboard before publishing; extracted images are supplied in the companion images folder."]];
instructions.getRange("C5").values = [["Review the 73 mapped product rows. Part number, product name, category, and application type are required before import."]];
instructions.getRange("C6").values = [["Specifications, references, applications, and available image filenames have already been mapped. Repeat the part number when adding more related rows."]];
instructions.getRange("A29:H31").clear({ applyTo: "contents" });
instructions.getRange("A29:H29").unmerge();
instructions.getRange("A29:H29").merge();
instructions.getRange("A29").values = [["Conversion summary"]];
instructions.getRange("A29:H29").format = { fill: blue, font: { bold: true, color: "#FFFFFF" } };
instructions.getRange("A30:F31").values = [
  ["Products", "Specifications", "References", "Vehicle applications", "Equipment applications", "Extracted images"],
  [data.summary.products, data.summary.specifications, data.summary.references, data.summary.vehicleApplications, data.summary.equipmentApplications, data.summary.images],
];
instructions.getRange("A30:F30").format = { fill: red, font: { bold: true, color: "#FFFFFF", size: 9 }, wrapText: true };
instructions.getRange("A31:F31").format = { fill: paleBlue, font: { bold: true, color: navy, size: 11 }, horizontalAlignment: "center" };
instructions.getRange("A30:F31").format.borders = { preset: "all", style: "thin", color: border };
instructions.getRange("A:A").format.columnWidth = 24;
instructions.getRange("B:B").format.columnWidth = 28;
instructions.getRange("C:C").format.columnWidth = 55;
instructions.getRange("D:F").format.columnWidth = 24;
instructions.getRange("G:H").format.columnWidth = 18;
instructions.getRange("A1:H1").format.rowHeight = 38;
instructions.getRange("A2:H2").format.rowHeight = 34;
instructions.getRange("A5:C11").format.rowHeight = 54;
instructions.getRange("A15:C20").format.rowHeight = 34;
instructions.getRange("A23:C27").format.rowHeight = 48;
instructions.getRange("A30:F31").format.rowHeight = 30;

const products = workbook.worksheets.getItem("Products");
products.getRange("A2").values = [["73 products mapped from the 1 Series source catalogue. Required headers are red; all products will be imported as drafts for review."]];
styleDataSheet(products, "K", data.products, [
  ["A", 17], ["B", 31], ["C", 17], ["D", 16], ["E", 24], ["F", 11],
  ["G", 42], ["H", 48], ["I", 34], ["J", 42], ["K", 28],
], [
  { range: "C", values: ["Oil Element", "Oil Spin On", "Fuel Elements", "Fuel Spin On", "Air Cleaners"] },
  { range: "D", values: ["Automotive", "Industrial", "Both"] },
  { range: "F", values: ["Yes", "No"] },
]);
products.getRange(`A5:A${lastRow(data.products)}`).setNumberFormat("@");
products.getRange(`A5:K${lastRow(data.products)}`).format.rowHeight = 42;

const specifications = workbook.worksheets.getItem("Specifications");
specifications.getRange("A2").values = [["Dimensions, gasket information, usage notes, and source filter types mapped from the 1 Series catalogue. Repeat the part number when adding a specification."]];
styleDataSheet(specifications, "E", data.specifications, [
  ["A", 18], ["B", 27], ["C", 42], ["D", 12], ["E", 14],
]);
specifications.getRange(`A5:A${lastRow(data.specifications)}`).setNumberFormat("@");
specifications.getRange(`E5:E${lastRow(data.specifications)}`).setNumberFormat("0");

const references = workbook.worksheets.getItem("References");
references.getRange("A2").values = [["OEM, competitor, and alternative references mapped from the source catalogue. Repeat the Mutsimoto part number on every added row."]];
styleDataSheet(references, "D", data.references, [
  ["A", 18], ["B", 16], ["C", 24], ["D", 34],
], [
  { range: "B", values: ["OEM", "Competitor", "Alternative"] },
]);
references.getRange(`A5:A${lastRow(data.references)}`).setNumberFormat("@");
references.getRange(`D5:D${lastRow(data.references)}`).setNumberFormat("@");

const vehicles = workbook.worksheets.getItem("Vehicle Applications");
vehicles.getRange("A2").values = [["Automotive application make and model details mapped from the source catalogue. Leave years blank where they were not supplied."]];
styleDataSheet(vehicles, "H", data.vehicleApplications, [
  ["A", 18], ["B", 23], ["C", 36], ["D", 23], ["E", 25], ["F", 12], ["G", 12], ["H", 42],
]);
vehicles.getRange(`A5:A${lastRow(data.vehicleApplications)}`).setNumberFormat("@");
vehicles.getRange(`F5:G${lastRow(data.vehicleApplications)}`).setNumberFormat("0");

const equipment = workbook.worksheets.getItem("Equipment Applications");
equipment.getRange("A2").values = [["Industrial, power-generation, agricultural, and rail applications inferred from the source make and usage descriptions; review before publication."]];
styleDataSheet(equipment, "H", data.equipmentApplications, [
  ["A", 18], ["B", 25], ["C", 20], ["D", 23], ["E", 36], ["F", 23], ["G", 25], ["H", 42],
]);
equipment.getRange(`A5:A${lastRow(data.equipmentApplications)}`).setNumberFormat("@");

const images = workbook.worksheets.getItem("Images");
images.getRange("A2").values = [["22 embedded source photos were extracted into the companion images folder. Filenames below match those extracted files."]];
styleDataSheet(images, "E", data.images, [
  ["A", 18], ["B", 30], ["C", 52], ["D", 14], ["E", 14],
], [
  { range: "E", values: ["Yes", "No"] },
]);
images.getRange(`A5:A${lastRow(data.images)}`).setNumberFormat("@");
images.getRange(`D5:D${lastRow(data.images)}`).setNumberFormat("0");

const sourceNotes = workbook.worksheets.add("Source Notes");
sourceNotes.showGridLines = false;
sourceNotes.getRange("A1:F1").merge();
sourceNotes.getRange("A1").values = [["Source catalogue audit notes"]];
sourceNotes.getRange("A1:F1").format = { fill: navy, font: { bold: true, color: "#FFFFFF", size: 16 } };
sourceNotes.getRange("A2:F2").merge();
sourceNotes.getRange("A2").values = [["For review only — this worksheet is ignored by the website importer and preserves internal source fields from FINAL 1 SERIES CATALOGUE.xlsx."]];
sourceNotes.getRange("A2:F2").format = { fill: navy, font: { color: "#CCD7E4", size: 10 }, wrapText: true };
sourceNotes.getRange("A4:F4").values = [["part_number", "source_row", "source_serial", "source_catalogue_note", "additional_oem_count", "original_subcategory"]];
sourceNotes.getRange("A4:F4").format = { fill: red, font: { bold: true, color: "#FFFFFF", size: 9 }, wrapText: true };
sourceNotes.getRange(`A5:F${lastRow(data.sourceNotes)}`).values = data.sourceNotes;
sourceNotes.getRange(`A5:F${lastRow(data.sourceNotes)}`).format = {
  fill: "#FFFFFF",
  font: { color: text, size: 9, italic: false },
  verticalAlignment: "top",
  wrapText: true,
  borders: {
    insideHorizontal: { style: "thin", color: border },
    insideVertical: { style: "thin", color: border },
  },
};
sourceNotes.getRange(`A5:F${lastRow(data.sourceNotes)}`).conditionalFormats.addCustom("=MOD(ROW(),2)=0", { fill: paleRed });
sourceNotes.getRange("A:A").format.columnWidth = 18;
sourceNotes.getRange("B:C").format.columnWidth = 14;
sourceNotes.getRange("D:D").format.columnWidth = 48;
sourceNotes.getRange("E:E").format.columnWidth = 20;
sourceNotes.getRange("F:F").format.columnWidth = 28;
sourceNotes.freezePanes.freezeRows(4);
sourceNotes.getRange(`A5:A${lastRow(data.sourceNotes)}`).setNumberFormat("@");

await fs.mkdir(previewDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

const checks = [
  ["Products", `A1:K${Math.min(lastRow(data.products), 18)}`],
  ["Specifications", `A1:E${Math.min(lastRow(data.specifications), 22)}`],
  ["References", `A1:D${Math.min(lastRow(data.references), 22)}`],
  ["Vehicle Applications", `A1:H${Math.min(lastRow(data.vehicleApplications), 18)}`],
  ["Equipment Applications", `A1:H${Math.min(lastRow(data.equipmentApplications), 18)}`],
  ["Images", `A1:E${Math.min(lastRow(data.images), 20)}`],
  ["Source Notes", `A1:F${Math.min(lastRow(data.sourceNotes), 18)}`],
  ["Instructions", "A1:H31"],
];
for (const [sheetName, range] of checks) {
  const preview = await workbook.render({ sheetName, range, scale: 1, format: "png" });
  const filename = sheetName.replaceAll(" ", "-");
  await fs.writeFile(`${previewDir}/${filename}.png`, new Uint8Array(await preview.arrayBuffer()));
}

console.log((await workbook.inspect({
  kind: "table",
  range: `Products!A1:K${lastRow(data.products)}`,
  include: "values,formulas",
  tableMaxRows: 12,
  tableMaxCols: 11,
  maxChars: 12000,
})).ndjson);
console.log((await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
})).ndjson);
console.log(JSON.stringify({ outputPath, summary: data.summary }));
