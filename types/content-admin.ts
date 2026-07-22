export interface AdminBranch {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  phone: string;
  whatsapp: string;
  email: string;
  openingHours: string;
  latitude: number | null;
  longitude: number | null;
  active: boolean;
  updatedAt: string;
}

export interface AdminDownload {
  id: string;
  title: string;
  description: string;
  category: string;
  storagePath: string;
  publicUrl: string;
  fileType: string;
  fileSize: number;
  published: boolean;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}
