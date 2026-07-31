import "server-only";

import { headers } from "next/headers";

function cleanHost(value: string | null): string | null {
  const host = value?.split(",")[0]?.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  return host || null;
}

function cleanOrigin(value: string | undefined): string | null {
  const candidate = value?.trim();
  if (!candidate) return null;

  try {
    const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
    return url.origin;
  } catch {
    return null;
  }
}

function isLocalOrigin(origin: string): boolean {
  try {
    const hostname = new URL(origin).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

export async function getSiteOrigin(): Promise<string> {
  const configuredOrigin = cleanOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  const productionOrigin = cleanOrigin(
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL,
  );

  if (configuredOrigin && (!isLocalOrigin(configuredOrigin) || process.env.NODE_ENV !== "production")) {
    return configuredOrigin;
  }
  if (productionOrigin) return productionOrigin;

  const requestHeaders = await headers();
  const host = cleanHost(
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host"),
  );
  if (host) {
    const protocol =
      requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
      (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
    return `${protocol}://${host}`;
  }

  return configuredOrigin ?? "http://localhost:3000";
}
