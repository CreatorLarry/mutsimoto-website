import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#07172b] px-5 py-10 sm:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl overflow-hidden rounded-[30px] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.3)] lg:grid-cols-[0.88fr_1.12fr]">
        <section className="relative hidden overflow-hidden bg-[#0b213b] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 blueprint-grid-dark opacity-60" />
          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-4" aria-label="Return to Mutsimoto website">
              <span className="grid size-16 place-items-center rounded-2xl bg-white p-2">
                <Image src="/images/main-logo.png" alt="Mutsimoto logo" width={56} height={56} />
              </span>
              <span><strong className="block tracking-[0.12em]">MUTSIMOTO</strong><small className="mt-1 block tracking-[0.2em] text-[#9fb0c4]">STAFF CONTROL CENTRE</small></span>
            </Link>
          </div>
          <div className="relative">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff7f88]">Secure administration</p>
            <h2 className="mt-4 max-w-md text-4xl font-black tracking-[-0.05em]">Catalogue control, technical accuracy, and customer follow-up.</h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#b6c2d1]">Access is limited to invited Mutsimoto staff. Every sensitive action is validated on the server and governed by database permissions.</p>
          </div>
        </section>
        <section className="flex items-center px-6 py-12 sm:px-12 lg:px-16">
          <div className="w-full max-w-lg">
            <Link href="/" className="mb-10 inline-flex items-center gap-3 lg:hidden"><Image src="/images/main-logo.png" alt="Mutsimoto logo" width={48} height={48} /><strong className="text-[#07172b]">MUTSIMOTO</strong></Link>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#d51f2a]">Administration</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] text-[#07172b]">{title}</h1>
            <p className="mt-4 text-sm leading-7 text-[#647185]">{description}</p>
            <div className="mt-8">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}

