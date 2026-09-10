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

export type ActivePage = 'catalogo' | 'eventos' | 'admin';
