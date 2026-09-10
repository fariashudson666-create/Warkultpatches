import { useState, useEffect } from 'react';
import { ActivePage, Product, EventPost, HeaderBanner, SidebarBanner } from './types';
import { 
  getInitialOrStoredProducts, 
  saveProducts,
  getInitialOrStoredEvents, 
  saveEvents,
  getInitialOrStoredHeaderBanners, 
  saveHeaderBanners,
  getInitialOrStoredSidebarBanners, 
  saveSidebarBanners,
  resetAllDataToDefaults
} from './utils/storage';

import { Header } from './components/Header';
import { TopBannerSlider } from './components/TopBannerSlider';
import { RightSidebar } from './components/RightSidebar';
import { ProductCatalog } from './components/ProductCatalog';
import { EventsGallery } from './components/EventsGallery';
import { AdminPanel } from './components/AdminPanel';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('catalogo');

  // State initialized from localStorage
  const [products, setProducts] = useState<Product[]>(getInitialOrStoredProducts);
  const [events, setEvents] = useState<EventPost[]>(getInitialOrStoredEvents);
  const [headerBanners, setHeaderBanners] = useState<HeaderBanner[]>(getInitialOrStoredHeaderBanners);
  const [sidebarBanners, setSidebarBanners] = useState<SidebarBanner[]>(getInitialOrStoredSidebarBanners);

  // Synchronize state updates with storage
  const handleUpdateProducts = (updated: Product[]) => {
    setProducts(updated);
    saveProducts(updated);
  };

  const handleUpdateEvents = (updated: EventPost[]) => {
    setEvents(updated);
    saveEvents(updated);
  };

  const handleUpdateHeaderBanners = (updated: HeaderBanner[]) => {
    setHeaderBanners(updated);
    saveHeaderBanners(updated);
  };

  const handleUpdateSidebarBanners = (updated: SidebarBanner[]) => {
    setSidebarBanners(updated);
    saveSidebarBanners(updated);
  };

  const handleResetAll = () => {
    const data = resetAllDataToDefaults();
    setProducts(data.products);
    setEvents(data.events);
    setHeaderBanners(data.headerBanners);
    setSidebarBanners(data.sidebarBanners);
  };

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePage]);

  // Check active sidebar banners count
  const activeSidebarBanners = sidebarBanners.filter(b => b.active);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans antialiased">
      {/* Top Navbar */}
      <Header
        activePage={activePage}
        onNavigate={setActivePage}
        productCount={products.length}
        eventCount={events.length}
        sidebarBannersCount={activeSidebarBanners.length}
      />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col">
        {/* Top Header Banner Slider (Visible on public pages) */}
        {activePage !== 'admin' && (
          <section aria-label="Banners Principais">
            <TopBannerSlider
              banners={headerBanners}
              onNavigate={setActivePage}
            />
          </section>
        )}

        {/* Content Layout: Main + Conditional Right Sidebar */}
        {activePage === 'admin' ? (
          <AdminPanel
            products={products}
            events={events}
            headerBanners={headerBanners}
            sidebarBanners={sidebarBanners}
            onUpdateProducts={handleUpdateProducts}
            onUpdateEvents={handleUpdateEvents}
            onUpdateHeaderBanners={handleUpdateHeaderBanners}
            onUpdateSidebarBanners={handleUpdateSidebarBanners}
            onResetAllData={handleResetAll}
          />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-start mt-2">
            {/* Main Center Area: Product Catalog or Events Gallery */}
            <div className="flex-1 min-w-0 w-full">
              {activePage === 'catalogo' && (
                <ProductCatalog products={products} />
              )}
              {activePage === 'eventos' && (
                <EventsGallery events={events} />
              )}
            </div>

            {/* Right Sidebar Banners (Strictly: If 0 banners, it does not render at all) */}
            {activeSidebarBanners.length > 0 && (
              <RightSidebar banners={activeSidebarBanners} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800 text-sm">PortalHub</span>
            <span>•</span>
            <span>Catálogo, Galeria de Eventos & Gestão de Banners</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActivePage('catalogo')}
              className={`hover:text-blue-600 transition-colors ${activePage === 'catalogo' ? 'font-bold text-blue-600' : ''}`}
            >
              Catálogo
            </button>
            <button
              onClick={() => setActivePage('eventos')}
              className={`hover:text-blue-600 transition-colors ${activePage === 'eventos' ? 'font-bold text-blue-600' : ''}`}
            >
              Eventos & Fotos
            </button>
            <button
              onClick={() => setActivePage('admin')}
              className={`hover:text-blue-600 transition-colors ${activePage === 'admin' ? 'font-bold text-blue-600' : ''}`}
            >
              Painel Admin
            </button>
          </div>

          <div className="text-slate-400 text-[11px]">
            {activeSidebarBanners.length > 0 
              ? `${activeSidebarBanners.length} banners laterais ativos` 
              : 'Sem banners laterais ativos'}
          </div>
        </div>
      </footer>
    </div>
  );
}
