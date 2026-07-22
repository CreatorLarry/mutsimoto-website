import type { DownloadResource } from "@/types";

export const downloads: DownloadResource[] = [
  { id: "complete", title: "Complete Product Catalogue", description: "The full Mutsimoto oil, fuel, and air filter range.", category: "Product catalogue", type: "PDF", fileSize: "Request latest edition", actionUrl: "/contact?subject=Complete%20catalogue", available: false },
  { id: "oil", title: "Oil Filter Catalogue", description: "Oil filter specifications, applications, and cross-references.", category: "Oil filters", type: "PDF", fileSize: "Request latest edition", actionUrl: "/contact?subject=Oil%20filter%20catalogue", available: false },
  { id: "fuel", title: "Fuel Filter Catalogue", description: "Fuel filter coverage for automotive and industrial engines.", category: "Fuel filters", type: "PDF", fileSize: "Request latest edition", actionUrl: "/contact?subject=Fuel%20filter%20catalogue", available: false },
  { id: "air", title: "Air Filter Catalogue", description: "Air filter dimensions and application listings.", category: "Air filters", type: "PDF", fileSize: "Request latest edition", actionUrl: "/contact?subject=Air%20filter%20catalogue", available: false },
  { id: "cross", title: "Cross-reference Guide", description: "Match common OEM numbers to Mutsimoto part numbers.", category: "Cross-reference", type: "PDF", fileSize: "Request latest edition", actionUrl: "/contact?subject=Cross-reference%20guide", available: false },
  { id: "technical", title: "Technical Data Sheets", description: "Product-level performance and dimensional data sheets.", category: "Technical guide", type: "PDF", fileSize: "Available by part number", actionUrl: "/contact?subject=Technical%20data%20sheet", available: false },
];
