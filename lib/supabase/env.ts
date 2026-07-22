const PUBLIC_ENV_NAMES = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

export function isSupabaseConfigured(): boolean {
  return PUBLIC_ENV_NAMES.every((name) => Boolean(process.env[name]?.trim()));
}

export function getSupabasePublicEnv(): { url: string; publishableKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !publishableKey) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return { url, publishableKey };
}

export function getSupabaseSecretKey(): string {
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();

  if (!secretKey) {
    throw new Error("SUPABASE_SECRET_KEY is not configured on the server.");
  }

  return secretKey;
}

export function isSupabaseSecretConfigured(): boolean {
  return Boolean(process.env.SUPABASE_SECRET_KEY?.trim());
}
