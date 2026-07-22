export interface AboutPageContent {
  eyebrow: string;
  title: string;
  summary: string;
  overviewTitle: string;
  overviewBody: string;
  expertiseTitle: string;
  expertiseBody: string;
  oilFilterTitle: string;
  oilFilterBody: string;
  fuelFilterTitle: string;
  fuelFilterBody: string;
  airFilterTitle: string;
  airFilterBody: string;
  missionTitle: string;
  missionBody: string;
  visionTitle: string;
  visionBody: string;
  qualityTitle: string;
  qualityBody: string;
}

export interface AdminAboutPageContent extends AboutPageContent {
  id: string | null;
  publicationStatus: "draft" | "review" | "published" | "archived";
  updatedAt: string | null;
}

export interface LeadershipProfile {
  id: string;
  fullName: string;
  title: string;
  biography: string;
  message: string | null;
  displayOrder: number;
  published: boolean;
  updatedAt: string;
}
