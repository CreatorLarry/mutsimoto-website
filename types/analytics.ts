export interface AnalyticsSeriesPoint {
  label: string;
  searches: number;
  productViews: number;
  downloads: number;
  enquiries: number;
}

export interface AnalyticsRankedItem {
  label: string;
  detail: string;
  value: number;
}

export interface CatalogueAnalytics {
  days: number;
  totals: {
    searches: number;
    noResultSearches: number;
    productViews: number;
    downloads: number;
    enquiries: number;
  };
  series: AnalyticsSeriesPoint[];
  topSearches: AnalyticsRankedItem[];
  topProducts: AnalyticsRankedItem[];
  topDownloads: AnalyticsRankedItem[];
  enquiryStatuses: AnalyticsRankedItem[];
  canSeeEnquiries: boolean;
}
