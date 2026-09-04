import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { BrandMark } from "@/components/ui/brand-mark";
import { COMPANY_CONTACT } from "@/data/company-contact";

const productLinks = ["Oil Element", "Oil Spin On", "Fuel Elements", "Fuel Spin On", "Air Cleaners"];
const companyLinks = [{ label: "About Us", href: "/about" }, { label: "Applications", href: "/applications" }, { label: "Downloads", href: "/downloads" }, { label: "Contact", href: "/contact" }];

export function Footer() {
  return (
    <footer className="dark-panel mt-8 border-t-[3px] border-[#ef3340] bg-[#080a0c] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_0.8fr_1fr] lg:px-10 lg:py-20">
        <div>
          <BrandMark light />
          <p className="mt-6 max-w-sm text-sm leading-7 text-[#b9bec2]">Purpose-built oil, fuel, and air filtration for automotive fleets, industrial equipment, and the people who keep them moving.</p>
        </div>
        <div>
          <h2 className="footer-title">Products</h2>
          <ul className="mt-5 space-y-3 text-sm text-[#b9bec2]">{productLinks.map((label) => <li key={label}><Link href={`/products?category=${encodeURIComponent(label)}`} className="hover:text-white">{label}</Link></li>)}</ul>
        </div>
        <div>
          <h2 className="footer-title">Company</h2>
          <ul className="mt-5 space-y-3 text-sm text-[#b9bec2]">{companyLinks.map((item) => <li key={item.href}><Link href={item.href} className="hover:text-white">{item.label}</Link></li>)}</ul>
          <h2 className="footer-title mt-8">Branches</h2>
          <p className="mt-4 text-sm leading-6 text-[#b9bec2]"><Link href="/branches" className="hover:text-white">Nairobi · Mombasa · Nakuru</Link></p>
        </div>
        <div>
          <h2 className="footer-title">Contact</h2>
          <div className="mt-5 space-y-4 text-sm text-[#b9bec2]">
            <p className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-[#ef3340]" />Nakuru Head Office, Nakuru, Kenya</p>
            <a href={COMPANY_CONTACT.phone.href} className="flex gap-3 hover:text-white"><Phone className="size-4 shrink-0 text-[#ef3340]" />{COMPANY_CONTACT.phone.label}</a>
            <a href={COMPANY_CONTACT.hotline.href} className="flex gap-3 hover:text-white"><Phone className="size-4 shrink-0 text-[#ef3340]" />{COMPANY_CONTACT.hotline.label}</a>
            <a href="mailto:sales@mutsimoto.com" className="flex gap-3 hover:text-white"><Mail className="size-4 shrink-0 text-[#ef3340]" />sales@mutsimoto.com</a>
          </div>
        </div>
      </div>
      <div className="border-t border-[#353d43]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-[#8f979c] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10"><p>© {new Date().getFullYear()} Mutsimoto Motor Company. All rights reserved.</p><p>Design and Built by Mwangi Ngugi</p></div>
      </div>
    </footer>
  );
}
