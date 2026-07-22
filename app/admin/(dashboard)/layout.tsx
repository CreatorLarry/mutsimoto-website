import type { ReactNode } from "react";
import { AdminNavigation } from "@/components/admin/admin-navigation";
import { requireStaff } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const profile = await requireStaff();
  return (
    <div className="min-h-screen bg-[#f4f6f8] lg:flex">
      <AdminNavigation profile={profile} />
      <main className="min-w-0 flex-1"><div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</div></main>
    </div>
  );
}

