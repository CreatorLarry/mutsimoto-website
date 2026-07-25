export interface ApplicationMedia {
  src: string;
  alt: string;
}

export const applicationMedia: Record<string, ApplicationMedia> = {
  passenger: {
    src: "/images/applications/passenger-vehicles.webp",
    alt: "Graphite passenger SUV in a professional service workshop",
  },
  commercial: {
    src: "/images/applications/commercial-vehicles.webp",
    alt: "Heavy-duty commercial truck fleet in a maintenance depot",
  },
  construction: {
    src: "/images/applications/construction-equipment.webp",
    alt: "Heavy-duty excavator working at a quarry",
  },
  agriculture: {
    src: "/images/applications/agricultural-machinery.webp",
    alt: "Modern agricultural tractor prepared for field work",
  },
  generators: {
    src: "/images/applications/generators.webp",
    alt: "Industrial diesel generator installation",
  },
  industrial: {
    src: "/images/applications/industrial-equipment.webp",
    alt: "Industrial compressor and pump equipment in a manufacturing plant",
  },
};
