"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

function redirectWithMessage(path: string, message: string): never {
  redirect(`${path}?message=${encodeURIComponent(message)}`);
}

export async function signIn(formData: FormData): Promise<never> {
  if (!isSupabaseConfigured()) {
    redirectWithMessage("/admin/login", "Connect Supabase before signing in.");
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    redirectWithMessage("/admin/login", "Enter your email address and password.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirectWithMessage("/admin/login", "The email or password was not accepted.");
  redirect("/admin");
}

export async function requestPasswordReset(formData: FormData): Promise<never> {
  if (!isSupabaseConfigured()) {
    redirectWithMessage("/admin/forgot-password", "Connect Supabase before requesting a reset.");
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) redirectWithMessage("/admin/forgot-password", "Enter your staff email address.");

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? `${protocol}://${host}`;
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/admin/reset-password`,
  });

  redirectWithMessage(
    "/admin/forgot-password",
    "If that address belongs to an active staff account, a reset link has been sent.",
  );
}

export async function updatePassword(formData: FormData): Promise<never> {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");
  if (password.length < 12) {
    redirectWithMessage("/admin/reset-password", "Use a password with at least 12 characters.");
  }
  if (password !== confirmation) {
    redirectWithMessage("/admin/reset-password", "The password confirmation does not match.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirectWithMessage("/admin/reset-password", "The reset session has expired. Request another link.");
  }
  redirectWithMessage("/admin/login", "Password updated. You can now sign in.");
}

