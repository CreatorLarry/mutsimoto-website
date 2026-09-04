import type { Branch } from "@/types";
import { COMPANY_CONTACT } from "@/data/company-contact";

export const branches: Branch[] = [
  
  {
    id: "nakuru",
    name: "Nakuru Head Office",
    location: "Biashara Street, Nakuru, Kenya",
    phone: COMPANY_CONTACT.phone.label,
    email: "sales@mutsimoto.com",
    openingHours: "Mon–Fri 8:00–17:00 · Sat 8:30–13:00",
    directionsUrl: "https://maps.app.goo.gl/njkjDXTSb9Q5UQZ18",
    whatsappUrl: COMPANY_CONTACT.whatsapp.href,
  },
  {
    id: "nairobi-industrial-area",
    name: "Nairobi Industrial Area",
    location: "10 Dar Es Salaam Road, Nairobi, Kenya",
    phone: "+254 726 692 705",
    email: "iabranch@mutsimoto.com",
    openingHours: "Mon–Fri 8:00–17:00 · Sat 8:30–13:00",
    directionsUrl: "https://maps.app.goo.gl/5JQ5JQ5JQ5JQ5JQ5",
    whatsappUrl: COMPANY_CONTACT.whatsapp.href,
  },
  {
    id: "nairobi-kirinyaga-road",
    name: "Nairobi Kirinyaga Road",
    location: "Kirinyaga Road, Nairobi, Kenya",
    phone: "+254 713 541 204",
    email: "krbranch@mutsimoto.com",
    openingHours: "Mon–Fri 8:00–17:00 · Sat 8:30–13:00",
    directionsUrl: "https://maps.app.goo.gl/5JQ5JQ5JQ5JQ5JQ5",
    whatsappUrl: COMPANY_CONTACT.whatsapp.href,
  },
  {
    id: "mombasa",
    name: "Mombasa Branch",
    location: "Jomo Kenyatta Avenue - Station Road, Mombasa, Kenya",
    phone: "+254 733 550 025",
    email: "msabranch@mutsimoto.com",
    openingHours: "Mon–Fri 8:00–17:00 · Sat 8:30–13:00",
    directionsUrl: "https://maps.app.goo.gl/5JQ5JQ5JQ5JQ5JQ5",
    whatsappUrl: COMPANY_CONTACT.whatsapp.href,
  },
];
