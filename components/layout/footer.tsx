import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { BrandMark } from "@/components/ui/brand-mark";

const productLinks = ["Oil Filters", "Fuel Filters", "Air Filters"];
const companyLinks = [{ label: "About Us", href: "/about" }, { label: "Applications", href: "/applications" }, { label: "Downloads", href: "/downloads" }, { label: "Contact", href: "/contact" }];

export function Footer() {
  return (
    <footer className="dark-panel mt-8 border-t-4 border-[#e52833] bg-[#061326] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_0.8fr_1fr] lg:px-10 lg:py-20">
        <div>
          <BrandMark light />
          <p className="mt-6 max-w-sm text-sm leading-7 text-[#aeb9c8]">Purpose-built oil, fuel, and air filtration for automotive fleets, industrial equipment, and the people who keep them moving.</p>
          <div className="mt-6 flex gap-2" aria-label="Social media placeholders">
            {[{ label: "Facebook", mark: "f" }, { label: "Instagram", mark: "ig" }, { label: "LinkedIn", mark: "in" }].map((social) => <a key={social.label} href="/contact" aria-label={social.label} className="grid size-10 place-items-center rounded-full border border-[#2b3b52] text-xs font-black uppercase text-[#b7c2d0] transition-colors hover:border-[#e52833] hover:bg-[#e52833] hover:text-white">{social.mark}</a>)}
          </div>
        </div>
        <div>
          <h2 className="footer-title">Products</h2>
          <ul className="mt-5 space-y-3 text-sm text-[#aeb9c8]">{productLinks.map((label) => <li key={label}><Link href={`/products?category=${encodeURIComponent(label)}`} className="hover:text-white">{label}</Link></li>)}</ul>
        </div>
        <div>
          <h2 className="footer-title">Company</h2>
          <ul className="mt-5 space-y-3 text-sm text-[#aeb9c8]">{companyLinks.map((item) => <li key={item.href}><Link href={item.href} className="hover:text-white">{item.label}</Link></li>)}</ul>
          <h2 className="footer-title mt-8">Branches</h2>
          <p className="mt-4 text-sm leading-6 text-[#aeb9c8]"><Link href="/branches" className="hover:text-white">Nairobi · Mombasa · Nakuru</Link></p>
        </div>
        <div>
          <h2 className="footer-title">Contact</h2>
          <div className="mt-5 space-y-4 text-sm text-[#aeb9c8]">
            <p className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-[#c81920]" />Nakuru Head Office, Nakuru, Kenya</p>
            <a href="tel:+254721901129" className="flex gap-3 hover:text-white"><Phone className="size-4 shrink-0 text-[#c81920]" />+254 721 901 129</a>
            <a href="mailto:sales@mutsimoto.co.ke" className="flex gap-3 hover:text-white"><Mail className="size-4 shrink-0 text-[#c81920]" />sales@mutsimoto.co.ke</a>
          </div>
        </div>
      </div>
      <div className="border-t border-[#25354b]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-[#8190a4] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10"><p>© {new Date().getFullYear()} Mutsimoto Motor Company. All rights reserved.</p><p>Design and Built by Mwangi Ngugi</p></div>
      </div>
    </footer>
  );
}
