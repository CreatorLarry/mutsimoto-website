"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpenCheck,
  Boxes,
  Building2,
  ChevronRight,
  CircleGauge,
  Download,
  FileSearch,
  LogOut,
  MailQuestion,
  Settings,
  Users,
} from "lucide-react";
import { signOut } from "@/app/admin/actions";
import { hasPermission, roleLabel } from "@/lib/auth/permissions";
import { cn } from "@/lib/cn";
import type { AdminPermission, StaffProfile } from "@/types/admin";

interface NavigationItem {
  label: string;
  href: string;
  icon: typeof CircleGauge;
  permission: AdminPermission;
}

const navigation: NavigationItem[] = [
  { label: "Overview", href: "/admin", icon: CircleGauge, permission: "dashboard:read" },
  { label: "Products", href: "/admin/products", icon: Boxes, permission: "products:read" },
  { label: "Applications", href: "/admin/applications", icon: BookOpenCheck, permission: "products:read" },
  { label: "References", href: "/admin/references", icon: FileSearch, permission: "products:read" },
  { label: "Enquiries", href: "/admin/enquiries", icon: MailQuestion, permission: "enquiries:manage" },
  { label: "Downloads", href: "/admin/downloads", icon: Download, permission: "content:manage" },
  { label: "Branches", href: "/admin/branches", icon: Building2, permission: "content:manage" },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3, permission: "analytics:read" },
  { label: "Users", href: "/admin/users", icon: Users, permission: "users:manage" },
  { label: "Settings", href: "/admin/settings", icon: Settings, permission: "content:manage" },
];

export function AdminNavigation({ profile }: { profile: StaffProfile }) {
  const pathname = usePathname();
  const visibleItems = navigation.filter((item) => hasPermission(profile, item.permission));

  return (
    <aside className="border-b border-[#20344c] bg-[#07172b] text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[280px] lg:flex-col lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between px-5 py-5 lg:px-6 lg:py-7">
        <Link href="/admin" className="inline-flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-white p-1.5"><Image src="/images/main-logo.png" alt="Mutsimoto logo" width={38} height={38} /></span>
          <span><strong className="block text-sm tracking-[0.1em]">MUTSIMOTO</strong><small className="mt-1 block text-[8px] font-bold tracking-[0.16em] text-[#8ea0b7]">CONTROL CENTRE</small></span>
        </Link>
        <Link href="/" className="rounded-full border border-white/15 px-3 py-2 text-[10px] font-bold text-[#c1ccda] hover:bg-white/10 lg:hidden">View site</Link>
      </div>
      <nav className="flex gap-2 overflow-x-auto px-5 pb-5 lg:block lg:flex-1 lg:space-y-1 lg:overflow-y-auto lg:px-4" aria-label="Administration navigation">
        {visibleItems.map(({ label, href, icon: Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return <Link key={href} href={href} className={cn("inline-flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-[#aebbd0] transition hover:bg-white/[0.07] hover:text-white lg:flex", active && "bg-[#e52833] text-white shadow-[0_8px_24px_rgba(229,40,51,0.2)]")}><Icon className="size-4.5" />{label}<ChevronRight className="ml-auto hidden size-4 opacity-60 lg:block" /></Link>;
        })}
      </nav>
      <div className="hidden border-t border-white/10 p-5 lg:block">
        <p className="truncate text-sm font-bold">{profile.fullName}</p>
        <p className="mt-1 truncate text-xs text-[#8fa0b7]">{profile.email}</p>
        <div className="mt-4 flex items-center justify-between gap-3"><span className="rounded-full bg-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] text-[#d1d9e5]">{roleLabel(profile.role)}</span><form action={signOut}><button type="submit" className="grid size-9 place-items-center rounded-full border border-white/15 text-[#aebbd0] hover:border-[#e52833] hover:bg-[#e52833] hover:text-white" aria-label="Sign out"><LogOut className="size-4" /></button></form></div>
      </div>
    </aside>
  );
}

