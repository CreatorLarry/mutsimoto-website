import type { Metadata } from "next";
import { AuthShell } from "@/components/admin/auth-shell";
import { updatePassword } from "../actions";

export const metadata: Metadata = { title: "Choose a new password" };

interface ResetPasswordPageProps {
  searchParams: Promise<{ message?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { message } = await searchParams;
  return (
    <AuthShell title="Choose a new password" description="Use at least 12 characters and avoid reusing a password from another service.">
      {message && <p className="mb-5 rounded-xl border border-[#f2c5c8] bg-[#fff2f3] px-4 py-3 text-sm text-[#9f1e27]" role="status">{message}</p>}
      <form action={updatePassword} className="space-y-5"><label className="block text-xs font-black uppercase tracking-[0.1em] text-[#435166]">New password<input required minLength={12} type="password" name="password" autoComplete="new-password" className="mt-2 h-13 w-full rounded-xl border border-[#dbe2ea] px-4 text-sm outline-none focus:border-[#e52833] focus:ring-4 focus:ring-[#e52833]/10" /></label><label className="block text-xs font-black uppercase tracking-[0.1em] text-[#435166]">Confirm password<input required minLength={12} type="password" name="confirmation" autoComplete="new-password" className="mt-2 h-13 w-full rounded-xl border border-[#dbe2ea] px-4 text-sm outline-none focus:border-[#e52833] focus:ring-4 focus:ring-[#e52833]/10" /></label><button type="submit" className="button-primary">Update password</button></form>
    </AuthShell>
  );
}

