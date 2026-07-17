import type { DownloadResource } from "@/types";

export const downloads: DownloadResource[] = [
  { id: "complete", title: "Complete Product Catalogue", description: "The full Mutsimoto oil, fuel, and air filter range.", type: "PDF", fileSize: "Request latest edition", requestUrl: "/contact?subject=Complete%20catalogue" },
  { id: "oil", title: "Oil Filter Catalogue", description: "Oil filter specifications, applications, and cross-references.", type: "PDF", fileSize: "Request latest edition", requestUrl: "/contact?subject=Oil%20filter%20catalogue" },
  { id: "fuel", title: "Fuel Filter Catalogue", description: "Fuel filter coverage for automotive and industrial engines.", type: "PDF", fileSize: "Request latest edition", requestUrl: "/contact?subject=Fuel%20filter%20catalogue" },
  { id: "air", title: "Air Filter Catalogue", description: "Air filter dimensions and application listings.", type: "PDF", fileSize: "Request latest edition", requestUrl: "/contact?subject=Air%20filter%20catalogue" },
  { id: "cross", title: "Cross-reference Guide", description: "Match common OEM numbers to Mutsimoto part numbers.", type: "PDF", fileSize: "Request latest edition", requestUrl: "/contact?subject=Cross-reference%20guide" },
  { id: "technical", title: "Technical Data Sheets", description: "Product-level performance and dimensional data sheets.", type: "PDF", fileSize: "Available by part number", requestUrl: "/contact?subject=Technical%20data%20sheet" },
];
