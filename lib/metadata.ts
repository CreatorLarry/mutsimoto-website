import type { Metadata } from "next";

export const SITE_NAME = "Mutsimoto Motor Company";
export const SITE_ORIGIN = "https://bearinghouse.biz";
export const DEFAULT_DESCRIPTION =
  "Oil, fuel, and air filtration solutions for automotive fleets and industrial equipment.";

const DEFAULT_SOCIAL_IMAGE = {
  url: `${SITE_ORIGIN}/og.png`,
  width: 1734,
  height: 907,
  alt: "Mutsimoto Motor Company filtration solutions",
};

interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
}

export function createPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: PageMetadataOptions): Metadata {
  const canonical = new URL(path, SITE_ORIGIN).toString();
  const socialTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical },
    openGraph: {
      title: socialTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "en_KE",
      type: "website",
      images: [DEFAULT_SOCIAL_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [DEFAULT_SOCIAL_IMAGE.url],
    },
  };
}

