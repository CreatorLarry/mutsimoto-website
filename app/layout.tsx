import type { Metadata, Viewport } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { RealtimeCatalogueRefresh } from "@/components/realtime-catalogue-refresh";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_ORIGIN } from "@/lib/metadata";
import "./globals.css";

const themeScript = `
  (() => {
    try {
      const savedTheme = localStorage.getItem("mutsimoto-theme");
      const systemTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
      const theme = savedTheme === "light" || savedTheme === "dark" ? savedTheme : systemTheme;
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch {
      document.documentElement.dataset.theme = "dark";
    }
  })();
`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: `${SITE_NAME} | Oil, Fuel & Air Filtration`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png", sizes: "160x160" },
    ],
    shortcut: [{ url: "/favicon.png", type: "image/png", sizes: "160x160" }],
    apple: [{ url: "/favicon.png", type: "image/png", sizes: "160x160" }],
  },
  openGraph: {
    title: `${SITE_NAME} | Oil, Fuel & Air Filtration`,
    description: DEFAULT_DESCRIPTION,
    siteName: SITE_NAME,
    locale: "en_KE",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1734,
        height: 907,
        alt: "Mutsimoto Motor Company filtration solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Oil, Fuel & Air Filtration`,
    description: DEFAULT_DESCRIPTION,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0d0f" },
    { media: "(prefers-color-scheme: light)", color: "#eef1f2" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <RealtimeCatalogueRefresh />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
