import type { Metadata } from "next";
import { headers } from "next/headers";
import { SiteShell } from "@/components/layout/site-shell";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");
  const origin = host ? `${protocol}://${host}` : "https://mutsimoto.example.com";

  return {
    metadataBase: new URL(origin),
    title: {
      default: "Mutsimoto Motor Company | Powered by Passion",
      template: "%s | Mutsimoto Motor Company",
    },
    description: "Oil, fuel, and air filtration solutions for automotive fleets and industrial equipment.",
    keywords: ["oil filters", "fuel filters", "air filters", "automotive filtration", "industrial filters", "Mutsimoto"],
    icons: {
      icon: "/favicon.png",
      shortcut: "/favicon.png",
      apple: "/favicon.png",
    },
    openGraph: {
      title: "Mutsimoto Motor Company | Powered by Passion",
      description: "Oil, fuel, and air filtration solutions for automotive fleets and industrial equipment.",
      url: origin,
      siteName: "Mutsimoto Motor Company",
      type: "website",
      images: [{ url: `${origin}/og.png`, width: 1734, height: 899, alt: "Mutsimoto Powered by Passion" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Mutsimoto Motor Company | Powered by Passion",
      description: "Oil, fuel, and air filtration solutions for automotive fleets and industrial equipment.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
