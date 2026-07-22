import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/admin/auth-shell";
import { requestPasswordReset } from "../actions";

export const metadata: Metadata = { title: "Reset staff password" };

interface ForgotPasswordPageProps {
  searchParams: Promise<{ message?: string }>;
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const { message } = await searchParams;
  return (
    <AuthShell title="Reset your password" description="We will send password recovery instructions to an active staff account.">
      {message && <p className="mb-5 rounded-xl border border-[#d7e1eb] bg-[#f3f7fa] px-4 py-3 text-sm leading-6 text-[#526176]" role="status">{message}</p>}
      <form action={requestPasswordReset} className="space-y-5"><label className="block text-xs font-black uppercase tracking-[0.1em] text-[#435166]">Staff email address<input required type="email" name="email" autoComplete="email" className="mt-2 h-13 w-full rounded-xl border border-[#dbe2ea] px-4 text-sm outline-none focus:border-[#e52833] focus:ring-4 focus:ring-[#e52833]/10" /></label><div className="flex items-center justify-between gap-4"><Link href="/admin/login" className="text-sm font-bold text-[#526176] hover:text-[#d51f2a]">Back to sign in</Link><button type="submit" className="button-primary">Send reset link</button></div></form>
    </AuthShell>
  );
}

