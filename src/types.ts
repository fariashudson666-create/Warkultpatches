export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  description: string;
  imageUrl: string;
  status: 'available' | 'promotion' | 'new' | 'out_of_stock' | 'featured';
  tags: string[];
  featured?: boolean;
}

export interface EventPost {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  coverImage: string;
  images: string[];
  category: string;
}

export interface HeaderBanner {
  id: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  imageUrl: string;
  active: boolean;
}

export interface SidebarBanner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  badge?: string;
  active: boolean;
}

export interface SiteSettings {
  siteName: string;
  logoUrl: string;
  logoMode: 'logo-only' | 'logo-and-name' | 'name-only';
  logoHeight: number;
  whatsappNumber: string;
  whatsappCustomMessage?: string;
  instagramUrl?: string;

  // Background and Layout Theme Customizations
  backgroundColor?: string;
  backgroundImageUrl?: string;
  backgroundRepeat?: 'cover' | 'repeat' | 'contain' | 'no-repeat';
  backgroundOverlayOpacity?: number; // 0 to 100
  headerBgColor?: string;
  headerTextColor?: 'dark' | 'light';
  footerBgColor?: string;
  footerTextColor?: 'dark' | 'light';
}

export type ActivePage = 'catalogo' | 'eventos' | 'admin';
