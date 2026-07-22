import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole, Mail } from "lucide-react";
import { AuthShell } from "@/components/admin/auth-shell";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { signIn } from "../actions";

export const metadata: Metadata = { title: "Staff login" };

interface LoginPageProps {
  searchParams: Promise<{ message?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { message } = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <AuthShell title="Staff sign in" description="Use the account issued by a Mutsimoto super administrator. Public registration is disabled.">
      {message && <p className="mb-5 rounded-xl border border-[#f2c5c8] bg-[#fff2f3] px-4 py-3 text-sm text-[#9f1e27]" role="status">{message}</p>}
      {!configured && <div className="mb-5 rounded-xl border border-[#ead5a6] bg-[#fff7df] px-4 py-3 text-sm leading-6 text-[#75530d]"><strong className="block">Supabase connection required</strong>Add the project URL and publishable key to the local environment before testing staff access.</div>}
      <form action={signIn} className="space-y-5">
        <label className="block text-xs font-black uppercase tracking-[0.1em] text-[#435166]">Email address<span className="relative mt-2 block"><Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8190a4]" /><input required type="email" name="email" autoComplete="email" className="h-13 w-full rounded-xl border border-[#dbe2ea] pl-11 pr-4 text-sm outline-none focus:border-[#e52833] focus:ring-4 focus:ring-[#e52833]/10" /></span></label>
        <label className="block text-xs font-black uppercase tracking-[0.1em] text-[#435166]">Password<span className="relative mt-2 block"><LockKeyhole className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8190a4]" /><input required type="password" name="password" autoComplete="current-password" className="h-13 w-full rounded-xl border border-[#dbe2ea] pl-11 pr-4 text-sm outline-none focus:border-[#e52833] focus:ring-4 focus:ring-[#e52833]/10" /></span></label>
        <div className="flex items-center justify-between gap-4"><Link href="/admin/forgot-password" className="text-sm font-bold text-[#526176] hover:text-[#d51f2a]">Forgot password?</Link><button type="submit" disabled={!configured} className="button-primary disabled:cursor-not-allowed disabled:opacity-50">Sign in</button></div>
      </form>
    </AuthShell>
  );
}

