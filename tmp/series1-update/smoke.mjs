import { Workbook } from "@oai/artifact-tool";
console.log("before");
const workbook = Workbook.create();
workbook.worksheets.add("Test");
console.log("after", workbook.worksheets.items.length);
