import { Product, EventPost, HeaderBanner, SidebarBanner } from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_EVENTS, 
  INITIAL_HEADER_BANNERS, 
  INITIAL_SIDEBAR_BANNERS 
} from '../data/initialData';

const STORAGE_KEYS = {
  PRODUCTS: 'site_products_data_v1',
  EVENTS: 'site_events_data_v1',
  HEADER_BANNERS: 'site_header_banners_v1',
  SIDEBAR_BANNERS: 'site_sidebar_banners_v1'
};

export function loadStoredData<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Failed to parse ${key} from localStorage, using fallback.`, error);
    return fallback;
  }
}

export function saveStoredData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn(`Failed to save ${key} to localStorage`, error);
  }
}

export function getInitialOrStoredProducts(): Product[] {
  return loadStoredData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
}

export function saveProducts(products: Product[]): void {
  saveStoredData(STORAGE_KEYS.PRODUCTS, products);
}

export function getInitialOrStoredEvents(): EventPost[] {
  return loadStoredData<EventPost[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
}

export function saveEvents(events: EventPost[]): void {
  saveStoredData(STORAGE_KEYS.EVENTS, events);
}

export function getInitialOrStoredHeaderBanners(): HeaderBanner[] {
  return loadStoredData<HeaderBanner[]>(STORAGE_KEYS.HEADER_BANNERS, INITIAL_HEADER_BANNERS);
}

export function saveHeaderBanners(banners: HeaderBanner[]): void {
  saveStoredData(STORAGE_KEYS.HEADER_BANNERS, banners);
}

export function getInitialOrStoredSidebarBanners(): SidebarBanner[] {
  return loadStoredData<SidebarBanner[]>(STORAGE_KEYS.SIDEBAR_BANNERS, INITIAL_SIDEBAR_BANNERS);
}

export function saveSidebarBanners(banners: SidebarBanner[]): void {
  saveStoredData(STORAGE_KEYS.SIDEBAR_BANNERS, banners);
}

export function resetAllDataToDefaults(): {
  products: Product[];
  events: EventPost[];
  headerBanners: HeaderBanner[];
  sidebarBanners: SidebarBanner[];
} {
  saveProducts(INITIAL_PRODUCTS);
  saveEvents(INITIAL_EVENTS);
  saveHeaderBanners(INITIAL_HEADER_BANNERS);
  saveSidebarBanners(INITIAL_SIDEBAR_BANNERS);
  return {
    products: INITIAL_PRODUCTS,
    events: INITIAL_EVENTS,
    headerBanners: INITIAL_HEADER_BANNERS,
    sidebarBanners: INITIAL_SIDEBAR_BANNERS
  };
}
