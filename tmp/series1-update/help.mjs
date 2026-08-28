import { Workbook } from "@oai/artifact-tool";
const workbook = Workbook.create();
console.log(workbook.help("*", { search: "RangeFormat|fontSize|font\.size|rowHeight", include: "index,examples,notes", maxChars: 5000 }).ndjson);
