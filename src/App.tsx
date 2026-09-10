import { useState, useEffect, CSSProperties } from 'react';
import { Lock, Check, Instagram, MessageCircle } from 'lucide-react';
import { ActivePage, Product, EventPost, HeaderBanner, SidebarBanner, SiteSettings } from './types';
import { 
  getInitialOrStoredProducts, 
  saveProducts,
  getInitialOrStoredEvents, 
  saveEvents,
  getInitialOrStoredHeaderBanners, 
  saveHeaderBanners,
  getInitialOrStoredSidebarBanners, 
  saveSidebarBanners,
  getInitialOrStoredSiteSettings,
  saveSiteSettings,
  resetAllDataToDefaults
} from './utils/storage';
import { getStoredSession, clearSession, AdminSession } from './utils/auth';

import { Header } from './components/Header';
import { TopBannerSlider } from './components/TopBannerSlider';
import { RightSidebar } from './components/RightSidebar';
import { ProductCatalog } from './components/ProductCatalog';
import { EventsGallery } from './components/EventsGallery';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('catalogo');

  // Authentication State
  const [session, setSession] = useState<AdminSession | null>(getStoredSession);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [appToast, setAppToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setAppToast(msg);
    setTimeout(() => setAppToast(null), 3500);
  };

  // State initialized from localStorage
  const [products, setProducts] = useState<Product[]>(getInitialOrStoredProducts);
  const [events, setEvents] = useState<EventPost[]>(getInitialOrStoredEvents);
  const [headerBanners, setHeaderBanners] = useState<HeaderBanner[]>(getInitialOrStoredHeaderBanners);
  const [sidebarBanners, setSidebarBanners] = useState<SidebarBanner[]>(getInitialOrStoredSidebarBanners);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(getInitialOrStoredSiteSettings);

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

  const handleUpdateSiteSettings = (updated: SiteSettings) => {
    setSiteSettings(updated);
    saveSiteSettings(updated);
  };

  const handleResetAll = () => {
    const data = resetAllDataToDefaults();
    setProducts(data.products);
    setEvents(data.events);
    setHeaderBanners(data.headerBanners);
    setSidebarBanners(data.sidebarBanners);
    setSiteSettings(data.siteSettings);
  };

  // Navigation Guard: Open login if user tries to enter admin without credentials
  const handleNavigate = (page: ActivePage) => {
    if (page === 'admin' && !session) {
      setIsLoginModalOpen(true);
      return;
    }
    setActivePage(page);
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
    if (activePage === 'admin') {
      setActivePage('catalogo');
    }
    showToast('Sessão administrativa encerrada.');
  };

  const handleLoginSuccess = (username: string) => {
    const currentSession = getStoredSession();
    setSession(currentSession);
    setIsLoginModalOpen(false);
    setActivePage('admin');
    showToast(`Bem-vindo, ${username}! Acesso administrativo liberado.`);
  };

  const handleOpenChangePassword = () => {
    if (!session) {
      setIsLoginModalOpen(true);
      return;
    }
    setIsChangePasswordModalOpen(true);
  };

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePage]);

  // Check active sidebar banners count
  const activeSidebarBanners = sidebarBanners.filter(b => b.active);

  const isDarkFooter = siteSettings.footerTextColor === 'light';
  const footerBg = siteSettings.footerBgColor || '#ffffff';

  // Dynamic background style
  const rootBgStyle: CSSProperties = {
    backgroundColor: siteSettings.backgroundColor || '#f8fafc',
    ...(siteSettings.backgroundImageUrl ? {
      backgroundImage: `url(${siteSettings.backgroundImageUrl})`,
      backgroundRepeat: siteSettings.backgroundRepeat === 'repeat' ? 'repeat' : 'no-repeat',
      backgroundSize: siteSettings.backgroundRepeat === 'cover' ? 'cover' : siteSettings.backgroundRepeat === 'contain' ? 'contain' : siteSettings.backgroundRepeat === 'repeat' ? 'auto' : 'cover',
      backgroundPosition: 'center top',
      backgroundAttachment: 'fixed',
    } : {})
  };

  return (
    <div 
      style={rootBgStyle}
      className="min-h-screen text-slate-800 flex flex-col font-sans antialiased relative transition-colors duration-200"
    >
      {/* Background Overlay if image exists */}
      {siteSettings.backgroundImageUrl && (siteSettings.backgroundOverlayOpacity ?? 0) > 0 && (
        <div 
          className="fixed inset-0 pointer-events-none z-0 transition-opacity" 
          style={{ backgroundColor: `rgba(0, 0, 0, ${(siteSettings.backgroundOverlayOpacity ?? 0) / 100})` }} 
        />
      )}

      {/* Toast Alert */}
      {appToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{appToast}</span>
        </div>
      )}

      {/* Top Navbar */}
      <div className="relative z-40">
        <Header
          activePage={activePage}
          onNavigate={handleNavigate}
          productCount={products.length}
          eventCount={events.length}
          sidebarBannersCount={activeSidebarBanners.length}
          isAuthenticated={!!session}
          adminUsername={session?.username}
          onRequestLogin={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
          onOpenChangePassword={handleOpenChangePassword}
          siteSettings={siteSettings}
        />
      </div>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col relative z-10">
        {/* Top Header Banner Slider (Visible on public pages) */}
        {activePage !== 'admin' && (
          <section aria-label="Banners Principais">
            <TopBannerSlider
              banners={headerBanners}
              onNavigate={handleNavigate}
            />
          </section>
        )}

        {/* Content Layout: Main + Conditional Right Sidebar */}
        {activePage === 'admin' ? (
          session ? (
            <AdminPanel
              products={products}
              events={events}
              headerBanners={headerBanners}
              sidebarBanners={sidebarBanners}
              siteSettings={siteSettings}
              onUpdateProducts={handleUpdateProducts}
              onUpdateEvents={handleUpdateEvents}
              onUpdateHeaderBanners={handleUpdateHeaderBanners}
              onUpdateSidebarBanners={handleUpdateSidebarBanners}
              onUpdateSiteSettings={handleUpdateSiteSettings}
              onResetAllData={handleResetAll}
              adminUsername={session.username}
              onLogout={handleLogout}
              onOpenChangePasswordModal={() => setIsChangePasswordModalOpen(true)}
            />
          ) : (
            <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 shadow-xs text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Área Administrativa Restrita</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Este painel é de acesso restrito e não é visível para o público em geral.
                Por favor, faça login com suas credenciais de administrador para continuar.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Fazer Login de Administrador
                </button>
                <button
                  onClick={() => setActivePage('catalogo')}
                  className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Voltar para o Catálogo Público
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-start mt-2">
            {/* Main Center Area: Product Catalog or Events Gallery */}
            <div className="flex-1 min-w-0 w-full">
              {activePage === 'catalogo' && (
                <ProductCatalog 
                  products={products}
                  whatsappNumber={siteSettings.whatsappNumber}
                  whatsappCustomMessage={siteSettings.whatsappCustomMessage}
                />
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

      {/* Footer: Strictly Brand Logo + Instagram Icon + WhatsApp Icon */}
      <footer 
        style={{ backgroundColor: footerBg }}
        className={`mt-12 py-6 border-t relative z-10 transition-colors duration-200 ${
          isDarkFooter ? 'border-slate-800/80 text-white' : 'border-slate-200 text-slate-800'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo da Marca */}
          <div className="flex items-center">
            {siteSettings.logoUrl ? (
              <img
                src={siteSettings.logoUrl}
                alt={siteSettings.siteName || 'Logo'}
                referrerPolicy="no-referrer"
                style={{ height: `${siteSettings.logoHeight ? Math.min(siteSettings.logoHeight, 48) : 40}px` }}
                className="max-h-12 w-auto object-contain"
              />
            ) : (
              <span className={`text-base sm:text-lg font-black tracking-tight ${isDarkFooter ? 'text-white' : 'text-slate-900'}`}>
                {siteSettings.siteName || 'PortalHub'}
              </span>
            )}
          </div>

          {/* Ícones de Redirecionamento: Instagram e WhatsApp */}
          <div className="flex items-center gap-3">
            <a
              id="footer-instagram-btn"
              href={
                siteSettings.instagramUrl && siteSettings.instagramUrl.startsWith('http')
                  ? siteSettings.instagramUrl
                  : siteSettings.instagramUrl
                    ? `https://instagram.com/${siteSettings.instagramUrl.replace(/^@/, '')}`
                    : 'https://instagram.com'
              }
              target="_blank"
              rel="noopener noreferrer"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105 cursor-pointer ${
                isDarkFooter 
                  ? 'text-slate-300 hover:text-white bg-white/10 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600' 
                  : 'text-slate-600 hover:text-white bg-slate-100 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600'
              }`}
              title="Instagram da Loja"
              aria-label="Instagram da Loja"
            >
              <Instagram className="w-5 h-5" />
            </a>

            <a
              id="footer-whatsapp-btn"
              href={`https://wa.me/${(siteSettings.whatsappNumber || '5511999999999').replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105 cursor-pointer ${
                isDarkFooter
                  ? 'text-slate-300 hover:text-white bg-white/10 hover:bg-emerald-600'
                  : 'text-slate-600 hover:text-white bg-slate-100 hover:bg-emerald-600'
              }`}
              title="WhatsApp da Loja"
              aria-label="WhatsApp da Loja"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Change Password Modal (Floating popup) */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        onSuccess={(newUsername) => {
          const updatedSession = getStoredSession();
          if (updatedSession) setSession(updatedSession);
          showToast(`Senha alterada com sucesso! Login atual: ${newUsername}`);
        }}
      />
    </div>
  );
}
