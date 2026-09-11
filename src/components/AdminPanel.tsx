import { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import { 
  ShoppingBag, 
  Camera, 
  Layers, 
  PanelRight, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  RotateCcw, 
  Eye, 
  EyeOff,
  ExternalLink,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  KeyRound,
  LogOut,
  Lock,
  User,
  SlidersHorizontal,
  Image as ImageIcon,
  Upload,
  Phone,
  MessageCircle,
  Instagram,
  Palette,
  Loader2,
  Globe,
  GitBranch
} from 'lucide-react';
import { 
  Product, 
  EventPost, 
  HeaderBanner, 
  SidebarBanner,
  SiteSettings 
} from '../types';
import { 
  getAdminCredentials, 
  updateAdminCredentials, 
  resetAdminCredentials,
  isDefaultCredentials 
} from '../utils/auth';
import { ImageUploadInput } from './ImageUploadInput';
import { ThemeSettingsTab } from './ThemeSettingsTab';
import { GitHubSyncTab } from './GitHubSyncTab';
import { readFileAsOptimizedDataUrl } from '../utils/fileUpload';

export type AdminTab = 'header-banners' | 'sidebar-banners' | 'products' | 'events' | 'brand' | 'theme' | 'github' | 'security';

interface AdminPanelProps {
  products: Product[];
  events: EventPost[];
  headerBanners: HeaderBanner[];
  sidebarBanners: SidebarBanner[];
  siteSettings: SiteSettings;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateEvents: (events: EventPost[]) => void;
  onUpdateHeaderBanners: (banners: HeaderBanner[]) => void;
  onUpdateSidebarBanners: (banners: SidebarBanner[]) => void;
  onUpdateSiteSettings: (settings: SiteSettings) => void;
  onResetAllData: () => void;
  adminUsername?: string;
  onLogout?: () => void;
  initialTab?: AdminTab;
  onOpenChangePasswordModal?: () => void;
}

export function AdminPanel({
  products,
  events,
  headerBanners,
  sidebarBanners,
  siteSettings,
  onUpdateProducts,
  onUpdateEvents,
  onUpdateHeaderBanners,
  onUpdateSidebarBanners,
  onUpdateSiteSettings,
  onResetAllData,
  adminUsername,
  onLogout,
  initialTab,
  onOpenChangePasswordModal
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab || 'header-banners');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Modals state
  const [editingHeaderBanner, setEditingHeaderBanner] = useState<HeaderBanner | null>(null);
  const [isHeaderBannerModalOpen, setIsHeaderBannerModalOpen] = useState(false);

  const [editingSidebarBanner, setEditingSidebarBanner] = useState<SidebarBanner | null>(null);
  const [isSidebarBannerModalOpen, setIsSidebarBannerModalOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const [editingEvent, setEditingEvent] = useState<EventPost | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // Success message feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // ==========================================
  // BRAND & LOGO & WHATSAPP SETTINGS STATE
  // ==========================================
  const [brandNameInput, setBrandNameInput] = useState(siteSettings.siteName || 'PortalHub');
  const [logoUrlInput, setLogoUrlInput] = useState(siteSettings.logoUrl || '');
  const [logoModeInput, setLogoModeInput] = useState<SiteSettings['logoMode']>(siteSettings.logoMode || 'name-only');
  const [logoHeightInput, setLogoHeightInput] = useState<number>(siteSettings.logoHeight || 40);
  const [whatsappNumberInput, setWhatsappNumberInput] = useState(siteSettings.whatsappNumber || '5511999999999');
  const [whatsappMessageInput, setWhatsappMessageInput] = useState(siteSettings.whatsappCustomMessage || 'Olá! Tenho interesse no seguinte item do catálogo:');
  const [instagramUrlInput, setInstagramUrlInput] = useState(siteSettings.instagramUrl || 'https://instagram.com');
  const [browserTabTitleInput, setBrowserTabTitleInput] = useState(siteSettings.browserTabTitle || siteSettings.siteName || 'PortalHub - Catálogo & Eventos');
  const [faviconUrlInput, setFaviconUrlInput] = useState(siteSettings.faviconUrl || '');

  const handleLogoFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setLogoUrlInput(event.target.result);
        setLogoModeInput('logo-only');
        showToast('Imagem da logo carregada com sucesso!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBrandSettings = (e: FormEvent) => {
    e.preventDefault();
    const updated: SiteSettings = {
      ...siteSettings,
      siteName: brandNameInput.trim() || 'PortalHub',
      logoUrl: logoUrlInput.trim(),
      logoMode: logoModeInput,
      logoHeight: Number(logoHeightInput) || 40,
      whatsappNumber: whatsappNumberInput.trim() || '5511999999999',
      whatsappCustomMessage: whatsappMessageInput.trim(),
      instagramUrl: instagramUrlInput.trim() || 'https://instagram.com',
      browserTabTitle: browserTabTitleInput.trim(),
      faviconUrl: faviconUrlInput.trim()
    };
    onUpdateSiteSettings(updated);
    showToast('Configurações salvas: Logo, Aba do Navegador, WhatsApp e Instagram atualizados!');
  };

  // ==========================================
  // SECURITY & ACCESS STATE
  // ==========================================
  const [currentUser, setCurrentUser] = useState(() => getAdminCredentials().username);
  const [newUsernameInput, setNewUsernameInput] = useState(() => getAdminCredentials().username);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showSecPassword, setShowSecPassword] = useState(false);
  const [secError, setSecError] = useState<string | null>(null);
  const [secSuccess, setSecSuccess] = useState<string | null>(null);

  const handleUpdateSecurity = (e: FormEvent) => {
    e.preventDefault();
    setSecError(null);
    setSecSuccess(null);

    if (newPasswordInput !== confirmPasswordInput) {
      setSecError('A nova senha e a confirmação de senha não coincidem.');
      return;
    }

    const res = updateAdminCredentials(currentPasswordInput, newUsernameInput, newPasswordInput);
    if (!res.success) {
      setSecError(res.error || 'Erro ao alterar credenciais.');
      return;
    }

    setCurrentUser(newUsernameInput);
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setSecSuccess('Credenciais administrativas atualizadas com sucesso! Guarde suas novas informações com segurança.');
    showToast('Credenciais de login atualizadas com sucesso!');
  };

  const handleResetSecurityDefaults = () => {
    if (window.confirm('Tem certeza que deseja restaurar as credenciais para o padrão original de fábrica (usuário: admin / senha: admin123)?')) {
      resetAdminCredentials();
      const creds = getAdminCredentials();
      setCurrentUser(creds.username);
      setNewUsernameInput(creds.username);
      setCurrentPasswordInput(creds.password);
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setSecSuccess('Credenciais restauradas com sucesso para o padrão (admin / admin123).');
      showToast('Credenciais restauradas para o padrão de fábrica.');
    }
  };

  // ==========================================
  // HEADER BANNERS HANDLERS
  // ==========================================
  const handleSaveHeaderBanner = (bannerData: Partial<HeaderBanner>) => {
    if (editingHeaderBanner) {
      const updated = headerBanners.map(b => 
        b.id === editingHeaderBanner.id ? { ...b, ...bannerData } as HeaderBanner : b
      );
      onUpdateHeaderBanners(updated);
      showToast('Banner do cabeçalho atualizado com sucesso!');
    } else {
      const newBanner: HeaderBanner = {
        id: `banner-head-${Date.now()}`,
        title: bannerData.title || 'Novo Banner',
        subtitle: bannerData.subtitle || '',
        buttonText: bannerData.buttonText || 'Saiba Mais',
        buttonLink: bannerData.buttonLink || 'catalogo',
        imageUrl: bannerData.imageUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85',
        active: bannerData.active ?? true
      };
      onUpdateHeaderBanners([newBanner, ...headerBanners]);
      showToast('Novo banner adicionado ao cabeçalho!');
    }
    setIsHeaderBannerModalOpen(false);
    setEditingHeaderBanner(null);
  };

  const handleDeleteHeaderBanner = (id: string) => {
    onUpdateHeaderBanners(headerBanners.filter(b => b.id !== id));
    showToast('Banner do cabeçalho removido.');
  };

  const handleToggleHeaderBannerActive = (id: string) => {
    const updated = headerBanners.map(b => b.id === id ? { ...b, active: !b.active } : b);
    onUpdateHeaderBanners(updated);
  };

  // ==========================================
  // SIDEBAR BANNERS HANDLERS
  // ==========================================
  const handleSaveSidebarBanner = (bannerData: Partial<SidebarBanner>) => {
    if (editingSidebarBanner) {
      const updated = sidebarBanners.map(b => 
        b.id === editingSidebarBanner.id ? { ...b, ...bannerData } as SidebarBanner : b
      );
      onUpdateSidebarBanners(updated);
      showToast('Banner lateral atualizado com sucesso!');
    } else {
      const newBanner: SidebarBanner = {
        id: `side-banner-${Date.now()}`,
        title: bannerData.title || 'Novo Banner Lateral',
        subtitle: bannerData.subtitle || '',
        imageUrl: bannerData.imageUrl || 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
        linkUrl: bannerData.linkUrl || '#',
        badge: bannerData.badge || 'Destaque',
        active: bannerData.active ?? true
      };
      onUpdateSidebarBanners([...sidebarBanners, newBanner]);
      showToast('Novo banner lateral adicionado!');
    }
    setIsSidebarBannerModalOpen(false);
    setEditingSidebarBanner(null);
  };

  const handleDeleteSidebarBanner = (id: string) => {
    onUpdateSidebarBanners(sidebarBanners.filter(b => b.id !== id));
    showToast('Banner lateral removido.');
  };

  const handleClearAllSidebarBanners = () => {
    onUpdateSidebarBanners([]);
    showToast('Todos os banners laterais foram removidos. A barra lateral agora não aparecerá.');
  };

  const handleToggleSidebarBannerActive = (id: string) => {
    const updated = sidebarBanners.map(b => b.id === id ? { ...b, active: !b.active } : b);
    onUpdateSidebarBanners(updated);
  };

  // ==========================================
  // PRODUCTS HANDLERS
  // ==========================================
  const handleSaveProduct = (prodData: Partial<Product>) => {
    if (editingProduct) {
      const updated = products.map(p => 
        p.id === editingProduct.id ? { ...p, ...prodData } as Product : p
      );
      onUpdateProducts(updated);
      showToast('Produto atualizado com sucesso!');
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name: prodData.name || 'Novo Produto',
        category: prodData.category || 'Geral',
        price: prodData.price ?? 99.90,
        oldPrice: prodData.oldPrice,
        description: prodData.description || '',
        imageUrl: prodData.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        status: prodData.status || 'available',
        tags: prodData.tags || ['Novo']
      };
      onUpdateProducts([newProd, ...products]);
      showToast('Novo produto cadastrado no catálogo!');
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    onUpdateProducts(products.filter(p => p.id !== id));
    showToast('Produto removido do catálogo.');
  };

  // ==========================================
  // EVENTS HANDLERS
  // ==========================================
  const handleSaveEvent = (eventData: Partial<EventPost>) => {
    if (editingEvent) {
      const updated = events.map(e => 
        e.id === editingEvent.id ? { ...e, ...eventData } as EventPost : e
      );
      onUpdateEvents(updated);
      showToast('Evento atualizado com sucesso!');
    } else {
      const newEvent: EventPost = {
        id: `event-${Date.now()}`,
        title: eventData.title || 'Novo Evento',
        date: eventData.date || 'Data a definir',
        location: eventData.location || 'Local a definir',
        description: eventData.description || '',
        category: eventData.category || 'Evento',
        coverImage: eventData.coverImage || (eventData.images && eventData.images[0]) || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
        images: eventData.images && eventData.images.length > 0 ? eventData.images : ['https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80']
      };
      onUpdateEvents([newEvent, ...events]);
      showToast('Nova postagem de evento publicada!');
    }
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (id: string) => {
    onUpdateEvents(events.filter(e => e.id !== id));
    showToast('Evento removido.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Central de Postagens & Gestão</span>
            </div>

            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Conectado: <strong>{adminUsername || currentUser || 'admin'}</strong></span>
            </div>
          </div>

          <h2 className="text-2xl font-black tracking-tight">
            Painel Administrativo do Site
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Gerencie banners do topo (carrossel), banners laterais da direita, catálogo de produtos, galeria de eventos e segurança de acesso.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-admin-change-password-quick"
            onClick={() => setActiveTab('security')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              activeTab === 'security'
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs'
                : 'bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border-amber-500/40'
            }`}
            title="Trocar a senha de administrador"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Trocar Senha</span>
          </button>

          <button
            id="btn-admin-reset-defaults"
            onClick={() => {
              if (window.confirm('Deseja restaurar todos os dados e banners para os valores de exemplo iniciais?')) {
                onResetAllData();
                showToast('Dados de exemplo restaurados com sucesso!');
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Exemplos</span>
          </button>

          {onLogout && (
            <button
              id="btn-admin-logout"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors border border-rose-500/30 cursor-pointer"
              title="Encerrar sessão administrativa"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair do Painel</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          id="tab-admin-header-banners"
          onClick={() => setActiveTab('header-banners')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'header-banners'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Banners do Topo (Cabeçalho)</span>
          <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
            {headerBanners.length}
          </span>
        </button>

        <button
          id="tab-admin-sidebar-banners"
          onClick={() => setActiveTab('sidebar-banners')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'sidebar-banners'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <PanelRight className="w-4 h-4" />
          <span>Banners da Lateral Direita</span>
          <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
            {sidebarBanners.length}
          </span>
        </button>

        <button
          id="tab-admin-products"
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'products'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Catálogo de Produtos</span>
          <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
            {products.length}
          </span>
        </button>

        <button
          id="tab-admin-events"
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'events'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Postagens de Eventos & Fotos</span>
          <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
            {events.length}
          </span>
        </button>

        <button
          id="tab-admin-brand"
          onClick={() => setActiveTab('brand')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'brand'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
          <span>Minha Logo, Aba & WhatsApp</span>
          {siteSettings.logoMode === 'logo-only' && (
            <span className="px-1.5 py-0.2 bg-emerald-500 text-white rounded-full text-[10px]">
              Logo Ativa
            </span>
          )}
        </button>

        <button
          id="tab-admin-theme"
          onClick={() => setActiveTab('theme')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'theme'
              ? 'bg-purple-600 text-white shadow-xs ring-2 ring-purple-400/40'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Palette className="w-4 h-4 text-purple-500" />
          <span>Cores, Fundo & Tema</span>
          {(siteSettings.headerBgColor !== '#ffffff' || siteSettings.footerBgColor !== '#ffffff' || siteSettings.backgroundImageUrl) && (
            <span className="w-2 h-2 rounded-full bg-purple-500" title="Cores personalizadas ativas" />
          )}
        </button>

        <button
          id="tab-admin-github"
          onClick={() => setActiveTab('github')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'github'
              ? 'bg-slate-900 text-white shadow-xs ring-2 ring-slate-400/40'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <GitBranch className="w-4 h-4 text-emerald-500" />
          <span>Sincronizar com GitHub</span>
          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
            Direto
          </span>
        </button>

        <button
          id="tab-admin-security"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ml-auto cursor-pointer ${
            activeTab === 'security'
              ? 'bg-amber-500 text-slate-950 shadow-xs ring-2 ring-amber-400'
              : 'bg-white text-slate-800 border border-amber-300 hover:bg-amber-50'
          }`}
        >
          <KeyRound className="w-4 h-4 text-amber-600" />
          <span>Trocar Senha do Admin</span>
          <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded-full text-[10px] font-extrabold">
            Segurança
          </span>
          {isDefaultCredentials() && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Recomendado alterar senha padrão" />
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HEADER BANNERS (TOP CAROUSEL) */}
      {/* ========================================================================= */}
      {activeTab === 'header-banners' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                Banners do Cabeçalho (Carrossel de Imagens no Topo)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Adicione múltiplas imagens com títulos e botões de ação para o carrossel superior do site.
              </p>
            </div>
            <button
              id="btn-add-header-banner"
              onClick={() => {
                setEditingHeaderBanner(null);
                setIsHeaderBannerModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Banner do Cabeçalho</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {headerBanners.map((banner, index) => (
              <div
                key={banner.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-16/9 bg-slate-900 overflow-hidden">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 flex gap-1">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-black/60 text-white backdrop-blur-xs">
                        Slide #{index + 1}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        banner.active ? 'bg-emerald-600 text-white' : 'bg-slate-600 text-white'
                      }`}>
                        {banner.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h4 className="font-bold text-slate-900 text-sm">{banner.title}</h4>
                    {banner.subtitle && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{banner.subtitle}</p>
                    )}
                    <div className="mt-2 text-[11px] text-slate-400 font-mono truncate">
                      URL: {banner.imageUrl}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleHeaderBannerActive(banner.id)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                      banner.active 
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {banner.active ? 'Desativar' : 'Ativar'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingHeaderBanner(banner);
                        setIsHeaderBannerModalOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteHeaderBanner(banner.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SIDEBAR BANNERS */}
      {/* ========================================================================= */}
      {activeTab === 'sidebar-banners' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <PanelRight className="w-5 h-5 text-blue-600" />
                Banners da Lateral Direita ({sidebarBanners.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Quantos banners você cadastrar aqui vão aparecendo na coluna lateral direita. Se não colocar nenhum (ou excluir todos), ela não aparece no site!
              </p>
            </div>

            <div className="flex items-center gap-2">
              {sidebarBanners.length > 0 && (
                <button
                  id="btn-clear-all-sidebar-banners"
                  onClick={() => {
                    if (window.confirm('Remover todos os banners laterais para testar o site sem lateral direita?')) {
                      handleClearAllSidebarBanners();
                    }
                  }}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
                >
                  Remover Todos (Ocultar Barra)
                </button>
              )}

              <button
                id="btn-add-sidebar-banner"
                onClick={() => {
                  setEditingSidebarBanner(null);
                  setIsSidebarBannerModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Banner Lateral</span>
              </button>
            </div>
          </div>

          {/* Explanation Alert for User */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-blue-900 text-xs">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Regra dos Banners Laterais:</p>
              <p className="text-blue-800 mt-0.5 leading-relaxed">
                Atualmente existem <strong>{sidebarBanners.filter(b => b.active).length} banners ativos</strong> na lateral direita. 
                Se você adicionar 1, 2, 3 ou mais, todos eles aparecerão empilhados na direita. 
                Se você excluir ou desativar todos, <strong>a lateral direita desaparece por completo</strong> e o catálogo / eventos aproveitam 100% da largura da tela!
              </p>
            </div>
          </div>

          {sidebarBanners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sidebarBanners.map((banner, index) => (
                <div
                  key={banner.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-4/3 bg-slate-900 overflow-hidden">
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 flex gap-1">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-black/60 text-white backdrop-blur-xs">
                          Banner #{index + 1}
                        </span>
                        {banner.badge && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-600 text-white">
                            {banner.badge}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <h4 className="font-bold text-slate-900 text-sm">{banner.title}</h4>
                      {banner.subtitle && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{banner.subtitle}</p>
                      )}
                      {banner.linkUrl && (
                        <div className="mt-2 text-[11px] text-blue-600 flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          <span className="truncate">{banner.linkUrl}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleSidebarBannerActive(banner.id)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                        banner.active 
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {banner.active ? 'Ativo' : 'Inativo'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingSidebarBanner(banner);
                          setIsSidebarBannerModalOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSidebarBanner(banner.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
              <PanelRight className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-700">Sem banners laterais</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Como não há nenhum banner lateral cadastrado, a barra lateral direita não é renderizada no site e o conteúdo ocupa a tela toda.
              </p>
              <button
                onClick={() => {
                  setEditingSidebarBanner(null);
                  setIsSidebarBannerModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-700"
              >
                + Adicionar Primeiro Banner Lateral
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PRODUCTS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                Produtos Cadastrados ({products.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Crie novos produtos, altere preços, imagens e categorias do catálogo.
              </p>
            </div>
            <button
              id="btn-admin-add-product"
              onClick={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Produto</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Produto</th>
                    <th className="p-4">Categoria</th>
                    <th className="p-4">Preço</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 bg-slate-100 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{prod.name}</div>
                            <div className="text-[11px] text-slate-400 line-clamp-1">{prod.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-800">{prod.category}</td>
                      <td className="p-4 font-bold text-slate-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prod.price)}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {prod.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingProduct(prod);
                              setIsProductModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Editar"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: EVENTS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                Postagens de Eventos & Fotos ({events.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Publique coberturas completas de eventos adicionando várias fotos em cada post.
              </p>
            </div>
            <button
              id="btn-admin-add-event"
              onClick={() => {
                setEditingEvent(null);
                setIsEventModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Evento com Fotos</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-16/9 bg-slate-900 overflow-hidden">
                    <img
                      src={ev.coverImage}
                      alt={ev.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 flex gap-1">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-black/60 text-white backdrop-blur-xs">
                        {ev.category}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-600 text-white">
                        {ev.images.length} fotos
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="text-[11px] text-slate-400 font-medium">
                      {ev.date} • {ev.location}
                    </div>
                    <h4 className="font-bold text-slate-900 text-base">{ev.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{ev.description}</p>
                    
                    {/* Tiny thumbnails preview */}
                    <div className="flex gap-1.5 pt-1 overflow-x-auto">
                      {ev.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt="Thumb"
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-md object-cover border border-slate-200 shrink-0"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingEvent(ev);
                      setIsEventModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar Evento</span>
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(ev.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SECURITY & ACCESS CONTROL */}
      {/* ========================================================================= */}
      {activeTab === 'security' && (
        <div className="space-y-6 max-w-3xl">
          {/* Security Status Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Controle de Acesso & Segurança
                  </h3>
                  <p className="text-xs text-slate-500">
                    O painel de controle está bloqueado para visitantes comuns e requer login para ser visualizado.
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Painel Protegido
                </span>
              </div>
            </div>

            {isDefaultCredentials() && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 text-xs">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Atenção: Você ainda está usando a senha padrão de fábrica!</p>
                    <p className="text-amber-800 leading-relaxed">
                      Seu usuário atual é <span className="font-mono font-bold">admin</span> e a senha é <span className="font-mono font-bold">admin123</span>. 
                      Recomendamos definir uma nova senha pessoal abaixo para proteger seu catálogo e configurações.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPasswordInput('admin123');
                    showToast('Senha atual preenchida como admin123');
                  }}
                  className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-lg transition-colors shrink-0 text-xs cursor-pointer"
                >
                  Preencher Atual (admin123)
                </button>
              </div>
            )}
          </div>

          {/* Change Credentials Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>Trocar Senha do Administrador</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Atualize o nome de usuário ou defina uma nova senha para o acesso restrito.
                </p>
              </div>

              {onOpenChangePasswordModal && (
                <button
                  type="button"
                  onClick={onOpenChangePasswordModal}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir em Janela Flutuante</span>
                </button>
              )}
            </div>

            {secSuccess && (
              <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">{secSuccess}</span>
              </div>
            )}

            {secError && (
              <div className="mb-4 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-medium">{secError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateSecurity} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome de Usuário / Login*
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={newUsernameInput}
                      onChange={(e) => setNewUsernameInput(e.target.value)}
                      placeholder="Ex: hudson_admin"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-medium"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Identificação utilizada para entrar no painel. Atual: <span className="font-semibold text-slate-600">{currentUser}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Senha Atual*
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showSecPassword ? 'text' : 'password'}
                      required
                      value={currentPasswordInput}
                      onChange={(e) => setCurrentPasswordInput(e.target.value)}
                      placeholder="Digite a senha atual"
                      className="w-full pl-9 pr-9 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecPassword(!showSecPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showSecPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Necessária para confirmar que você é o administrador.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nova Senha*
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showSecPassword ? 'text' : 'password'}
                      required
                      minLength={4}
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="Mínimo de 4 caracteres"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-medium"
                    />
                  </div>
                  {newPasswordInput.length > 0 && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <div className="h-1 flex-1 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            newPasswordInput.length < 6 
                              ? 'w-1/3 bg-amber-500' 
                              : newPasswordInput.length < 9 
                                ? 'w-2/3 bg-blue-500' 
                                : 'w-full bg-emerald-500'
                          }`} 
                        />
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {newPasswordInput.length < 6 ? 'Curta' : newPasswordInput.length < 9 ? 'Boa' : 'Forte'}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirmar Nova Senha*
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showSecPassword ? 'text' : 'password'}
                      required
                      minLength={4}
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      placeholder="Repita a nova senha"
                      className={`w-full pl-9 pr-3 py-2 text-xs border rounded-xl focus:ring-2 focus:outline-hidden font-medium ${
                        confirmPasswordInput.length > 0 && confirmPasswordInput !== newPasswordInput
                          ? 'border-rose-300 focus:ring-rose-500'
                          : confirmPasswordInput.length > 0 && confirmPasswordInput === newPasswordInput
                            ? 'border-emerald-400 focus:ring-emerald-500'
                            : 'border-slate-300 focus:ring-blue-600'
                      }`}
                    />
                  </div>
                  {confirmPasswordInput.length > 0 && (
                    <p className={`text-[10px] mt-1 font-semibold flex items-center gap-1 ${
                      confirmPasswordInput === newPasswordInput ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {confirmPasswordInput === newPasswordInput ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Senhas coincidem</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3" />
                          <span>As senhas não são iguais</span>
                        </>
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Salvar Nova Senha</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetSecurityDefaults}
                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Restaurar credenciais originais (admin / admin123)"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Restaurar Padrão (admin123)</span>
                  </button>
                </div>

                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair do Painel Agora</span>
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Tips and security advice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <h5 className="font-bold text-xs text-slate-800 mb-1">Como funciona o sigilo?</h5>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Visitantes comuns não vêem o botão de admin aberto. O site exibe apenas um discreto cadeado de &quot;Área Restrita&quot;, e qualquer tentativa de acessar o painel exige validação de senha.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <h5 className="font-bold text-xs text-slate-800 mb-1">Dica de Encerramento</h5>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Ao terminar de adicionar produtos, fotos de eventos ou banners, utilize o botão &quot;Sair do Painel&quot; para travar o painel novamente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: BRAND, LOGO & WHATSAPP SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === 'brand' && (
        <div className="space-y-6">
          {/* Header Title */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Identidade Visual & WhatsApp</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Substitua o nome &quot;PortalHub&quot;, coloque apenas a sua logotipo no cabeçalho e configure o WhatsApp que receberá os pedidos dos produtos.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Personalização Ativa
              </span>
            </div>
          </div>

          {/* Real-time Header Simulation */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                Pré-visualização do Cabeçalho em Tempo Real
              </h4>
              <span className="text-[11px] text-slate-400">
                Assim é como os clientes verão o topo do seu site
              </span>
            </div>

            {/* Mocked Header Bar */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                {logoModeInput === 'logo-only' && logoUrlInput ? (
                  <div className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
                    <img
                      src={logoUrlInput}
                      alt={brandNameInput || 'Logo'}
                      referrerPolicy="no-referrer"
                      style={{ height: `${logoHeightInput || 40}px` }}
                      className="max-h-12 w-auto object-contain"
                    />
                  </div>
                ) : logoModeInput === 'logo-and-name' && logoUrlInput ? (
                  <div className="flex items-center gap-2.5">
                    <img
                      src={logoUrlInput}
                      alt={brandNameInput}
                      referrerPolicy="no-referrer"
                      style={{ height: `${logoHeightInput || 36}px` }}
                      className="max-h-11 w-auto object-contain"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                          {brandNameInput || 'PortalHub'}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                          Online
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Catálogo, Galeria de Eventos & Gestão
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                          {brandNameInput || 'PortalHub'}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                          Online
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Catálogo, Galeria de Eventos & Gestão
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400">
                <span className="px-3 py-1 bg-white rounded-lg border border-slate-200">Catálogo</span>
                <span className="px-3 py-1 bg-white rounded-lg border border-slate-200">Eventos</span>
              </div>
            </div>

            {logoModeInput === 'logo-only' && !logoUrlInput && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Você selecionou <strong>&quot;Apenas a minha logo&quot;</strong>, mas ainda não inseriu a URL ou fez upload da imagem. Adicione abaixo para que ela apareça.</span>
              </p>
            )}
          </div>

          {/* Form Settings */}
          <form onSubmit={handleSaveBrandSettings} className="space-y-6">
            {/* Section 1: Logo & Nome */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  1. Configuração do Logotipo e Nome da Loja
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Escolha como a sua marca será apresentada no cabeçalho de todas as páginas.
                </p>
              </div>

              {/* Mode Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Modo de Exibição no Cabeçalho
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label 
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      logoModeInput === 'logo-only' 
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="logoMode"
                      checked={logoModeInput === 'logo-only'}
                      onChange={() => setLogoModeInput('logo-only')}
                      className="mt-1 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">
                        Apenas a Minha Logo (Recomendado)
                      </span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">
                        Remove o texto &quot;PortalHub&quot; e exibe exclusivamente sua imagem de logotipo.
                      </span>
                    </div>
                  </label>

                  <label 
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      logoModeInput === 'logo-and-name' 
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="logoMode"
                      checked={logoModeInput === 'logo-and-name'}
                      onChange={() => setLogoModeInput('logo-and-name')}
                      className="mt-1 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">
                        Logo + Nome da Loja
                      </span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">
                        Exibe sua imagem de logotipo ao lado do nome comercial da loja.
                      </span>
                    </div>
                  </label>

                  <label 
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      logoModeInput === 'name-only' 
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="logoMode"
                      checked={logoModeInput === 'name-only'}
                      onChange={() => setLogoModeInput('name-only')}
                      className="mt-1 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">
                        Apenas Nome (Texto)
                      </span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">
                        Exibe o ícone padrão com o nome digitado por você.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Logo URL and File Upload */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Imagem da Logotipo (URL direta ou Carregar do Computador)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="input-logo-url"
                    type="url"
                    value={logoUrlInput}
                    onChange={(e) => setLogoUrlInput(e.target.value)}
                    placeholder="https://exemplo.com/minha-logo.png"
                    className="flex-1 px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                  />
                  
                  <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors whitespace-nowrap">
                    <Upload className="w-4 h-4" />
                    <span>Upload de Arquivo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                    />
                  </label>

                  {logoUrlInput && (
                    <button
                      type="button"
                      onClick={() => setLogoUrlInput('')}
                      className="px-3 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 cursor-pointer"
                      title="Limpar logo"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                {/* Quick Presets for Demo */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-400 font-medium">Logos de Exemplo para Teste:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setLogoUrlInput('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80');
                      setLogoModeInput('logo-only');
                    }}
                    className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    Design Minimalista
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLogoUrlInput('https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=300&q=80');
                      setLogoModeInput('logo-only');
                    }}
                    className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    Tech & Store
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLogoUrlInput('https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80');
                      setLogoModeInput('logo-only');
                    }}
                    className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    Boutique / Moda
                  </button>
                </div>
              </div>

              {/* Logo Height and Store Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Altura da Logo no Topo ({logoHeightInput}px)
                  </label>
                  <input
                    type="range"
                    min="28"
                    max="56"
                    step="2"
                    value={logoHeightInput}
                    onChange={(e) => setLogoHeightInput(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Pequena (28px)</span>
                    <span>Padrão (40px)</span>
                    <span>Grande (56px)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome da Loja (Substitui &quot;PortalHub&quot;)
                  </label>
                  <input
                    id="input-brand-name"
                    type="text"
                    value={brandNameInput}
                    onChange={(e) => setBrandNameInput(e.target.value)}
                    placeholder="Ex: Hudson Store, Minha Loja VIP"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Utilizado como título da página, texto alternativo e modo Logo + Nome.
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: WhatsApp dos Produtos */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">
                    2. WhatsApp dos Produtos (Botão &quot;Pedir no WhatsApp&quot;)
                  </h4>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure o número para onde os clientes serão redirecionados ao clicar no botão de WhatsApp em cada item do catálogo.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Número do WhatsApp Comercial (DDI + DDD + Número)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-600">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      id="input-whatsapp-number"
                      type="text"
                      value={whatsappNumberInput}
                      onChange={(e) => setWhatsappNumberInput(e.target.value)}
                      placeholder="5511999999999"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Exemplo no Brasil: <strong>5511999999999</strong> (sem espaços ou traços).
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teste do Link do WhatsApp
                  </label>
                  <div className="h-10 flex items-center">
                    <a
                      href={`https://wa.me/${whatsappNumberInput.replace(/\D/g, '')}?text=${encodeURIComponent(`${whatsappMessageInput}\n\n*Exemplo de Produto*\nPreço: R$ 199,00`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Testar Conexão WhatsApp</span>
                    </a>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Abre uma conversa de teste com o número informado.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mensagem Automática Padrão
                </label>
                <input
                  id="input-whatsapp-message"
                  type="text"
                  value={whatsappMessageInput}
                  onChange={(e) => setWhatsappMessageInput(e.target.value)}
                  placeholder="Olá! Tenho interesse no seguinte item do catálogo:"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  O nome e o preço do produto serão anexados automaticamente abaixo dessa frase.
                </span>
              </div>
            </div>

            {/* Section 3: Instagram da Loja */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">
                    3. Instagram da Loja (Link no Rodapé)
                  </h4>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure o endereço do perfil de Instagram da loja para direcionar os visitantes através do ícone no rodapé.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    URL ou @usuário do Instagram
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-rose-500">
                      <Instagram className="w-4 h-4" />
                    </div>
                    <input
                      id="input-instagram-url"
                      type="text"
                      value={instagramUrlInput}
                      onChange={(e) => setInstagramUrlInput(e.target.value)}
                      placeholder="https://instagram.com/sualoja ou @sualoja"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Ex: <strong>https://instagram.com/sualoja</strong> ou simplesmente <strong>@sualoja</strong>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teste do Link do Instagram
                  </label>
                  <div className="h-10 flex items-center">
                    <a
                      href={
                        instagramUrlInput.startsWith('http')
                          ? instagramUrlInput
                          : instagramUrlInput
                            ? `https://instagram.com/${instagramUrlInput.replace(/^@/, '')}`
                            : 'https://instagram.com'
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white rounded-xl text-xs font-bold transition-transform hover:scale-102 shadow-xs cursor-pointer"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      <span>Abrir Perfil do Instagram</span>
                    </a>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Abre o perfil em uma nova aba para conferência.
                  </span>
                </div>
              </div>
            </div>

            {/* Section 4: Identidade da Aba do Navegador (Título & Ícone / Favicon) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">
                    4. Aba do Navegador (Nome da Guia & Ícone / Favicon)
                  </h4>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Personalize o título que aparece na aba do navegador (Chrome, Safari, celular) e o ícone de atalho (favicon).
                </p>
              </div>

              {/* Realistic Browser Tab Mockup */}
              <div className="bg-slate-100/90 rounded-2xl p-4 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Simulação da Aba no Navegador:
                </span>
                <div className="inline-flex items-center gap-2.5 bg-white px-4 py-2 rounded-t-xl border-t-2 border-x border-slate-300 border-t-blue-500 shadow-xs max-w-sm">
                  {faviconUrlInput ? (
                    <img
                      src={faviconUrlInput}
                      alt="Favicon"
                      referrerPolicy="no-referrer"
                      className="w-4 h-4 object-contain rounded-xs shrink-0"
                    />
                  ) : (
                    <span className="text-sm leading-none shrink-0">🛍️</span>
                  )}
                  <span className="text-xs font-semibold text-slate-800 truncate">
                    {browserTabTitleInput || brandNameInput || 'PortalHub'}
                  </span>
                  <span className="text-slate-400 text-xs ml-auto font-bold pl-2">✕</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome que fica na Aba do Navegador (Título da Guia)*
                  </label>
                  <input
                    id="input-browser-tab-title"
                    type="text"
                    required
                    value={browserTabTitleInput}
                    onChange={(e) => setBrowserTabTitleInput(e.target.value)}
                    placeholder="Ex: Hudson Store - Catálogo Oficial 2026"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden text-slate-900 font-medium"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Esse texto é exibido no topo da guia do navegador no computador ou nas abas abertas no celular.
                  </span>
                </div>

                <div>
                  <ImageUploadInput
                    label="Ícone da Aba do Navegador (Favicon)"
                    value={faviconUrlInput}
                    onChange={setFaviconUrlInput}
                    helpText="Envie um arquivo quadrado (.png, .ico, .svg ou .jpg do seu computador) ou cole uma URL."
                    aspectRatioClass="aspect-square max-w-[120px]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Dica: Use uma imagem quadrada ou com fundo transparente para melhor nitidez no navegador.
                  </span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <p className="text-xs text-slate-600">
                Lembre-se de clicar em salvar para aplicar a marca, aba do navegador, WhatsApp e Instagram.
              </p>
              <button
                id="btn-save-brand-settings"
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Minha Marca, Aba & Contatos</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: THEME, BACKGROUND, HEADER & FOOTER COLOR CUSTOMIZATION */}
      {/* ========================================================================= */}
      {activeTab === 'theme' && (
        <ThemeSettingsTab
          siteSettings={siteSettings}
          onSave={onUpdateSiteSettings}
          showToast={showToast}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 8: DIRECT GITHUB SYNC */}
      {/* ========================================================================= */}
      {activeTab === 'github' && (
        <GitHubSyncTab
          products={products}
          events={events}
          headerBanners={headerBanners}
          sidebarBanners={sidebarBanners}
          siteSettings={siteSettings}
          showToast={showToast}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: HEADER BANNER MODAL */}
      {/* ========================================================================= */}
      {isHeaderBannerModalOpen && (
        <HeaderBannerFormModal
          banner={editingHeaderBanner}
          onClose={() => {
            setIsHeaderBannerModalOpen(false);
            setEditingHeaderBanner(null);
          }}
          onSave={handleSaveHeaderBanner}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SIDEBAR BANNER MODAL */}
      {/* ========================================================================= */}
      {isSidebarBannerModalOpen && (
        <SidebarBannerFormModal
          banner={editingSidebarBanner}
          onClose={() => {
            setIsSidebarBannerModalOpen(false);
            setEditingSidebarBanner(null);
          }}
          onSave={handleSaveSidebarBanner}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PRODUCT MODAL */}
      {/* ========================================================================= */}
      {isProductModalOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EVENT MODAL */}
      {/* ========================================================================= */}
      {isEventModalOpen && (
        <EventFormModal
          event={editingEvent}
          onClose={() => {
            setIsEventModalOpen(false);
            setEditingEvent(null);
          }}
          onSave={handleSaveEvent}
        />
      )}
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT MODALS
// =========================================================================

function HeaderBannerFormModal({
  banner,
  onClose,
  onSave
}: {
  banner: HeaderBanner | null;
  onClose: () => void;
  onSave: (data: Partial<HeaderBanner>) => void;
}) {
  const [title, setTitle] = useState(banner?.title || '');
  const [subtitle, setSubtitle] = useState(banner?.subtitle || '');
  const [imageUrl, setImageUrl] = useState(banner?.imageUrl || '');
  const [buttonText, setButtonText] = useState(banner?.buttonText || 'Ver Catálogo');
  const [buttonLink, setButtonLink] = useState(banner?.buttonLink || 'catalogo');
  const [active, setActive] = useState(banner?.active ?? true);

  const presets = [
    { title: 'Promoção Exclusiva', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85' },
    { title: 'Cobertura de Eventos', url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1600&q=85' },
    { title: 'Lançamentos Tech', url: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=1600&q=85' }
  ];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) return;
    onSave({ title, subtitle, imageUrl, buttonText, buttonLink, active });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h3 className="font-bold text-slate-900 text-base">
            {banner ? 'Editar Banner do Cabeçalho' : 'Novo Banner do Cabeçalho'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Título do Banner*</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Nova Temporada 2026"
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subtítulo / Descrição</label>
            <textarea
              rows={2}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Breve texto promocional ou explicativo"
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>

          <ImageUploadInput
            label="Imagem do Banner (Arquivo Direto ou URL)"
            required
            value={imageUrl}
            onChange={setImageUrl}
            presets={presets}
            helpText="Faça upload direto de uma imagem do seu computador ou cole o link direto."
            aspectRatioClass="aspect-16/9"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Texto do Botão</label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="Ex: Ver Catálogo"
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Destino do Botão</label>
              <select
                value={buttonLink}
                onChange={(e) => setButtonLink(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
              >
                <option value="catalogo">Página: Catálogo</option>
                <option value="eventos">Página: Eventos & Fotos</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="check-banner-active"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="check-banner-active" className="font-semibold text-slate-700">
              Banner Ativo no Carrossel
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
            >
              Salvar Banner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SidebarBannerFormModal({
  banner,
  onClose,
  onSave
}: {
  banner: SidebarBanner | null;
  onClose: () => void;
  onSave: (data: Partial<SidebarBanner>) => void;
}) {
  const [title, setTitle] = useState(banner?.title || '');
  const [subtitle, setSubtitle] = useState(banner?.subtitle || '');
  const [imageUrl, setImageUrl] = useState(banner?.imageUrl || '');
  const [linkUrl, setLinkUrl] = useState(banner?.linkUrl || '#');
  const [badge, setBadge] = useState(banner?.badge || 'Destaque');
  const [active, setActive] = useState(banner?.active ?? true);

  const presets = [
    { title: 'Promoção Relâmpago', url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80' },
    { title: 'Ingressos & Eventos', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80' },
    { title: 'Atendimento VIP', url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80' }
  ];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) return;
    onSave({ title, subtitle, imageUrl, linkUrl, badge, active });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h3 className="font-bold text-slate-900 text-base">
            {banner ? 'Editar Banner Lateral Direito' : 'Novo Banner Lateral Direito'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Título do Banner*</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Super Oferta de Acessórios"
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subtítulo / Texto de Apoio</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Ex: Até 30% OFF neste fim de semana"
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Etiqueta / Badge</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Ex: Destaque, VIP, Oferta"
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Link de Redirecionamento</label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <ImageUploadInput
            label="Imagem do Banner Lateral (Arquivo Direto ou URL)"
            required
            value={imageUrl}
            onChange={setImageUrl}
            presets={presets}
            helpText="Faça upload direto de uma foto do computador ou use uma URL."
            aspectRatioClass="aspect-4/3"
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="check-side-active"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="check-side-active" className="font-semibold text-slate-700">
              Banner Ativo na Lateral Direita
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
            >
              Salvar Banner Lateral
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProductFormModal({
  product,
  onClose,
  onSave
}: {
  product: Product | null;
  onClose: () => void;
  onSave: (data: Partial<Product>) => void;
}) {
  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState(product?.category || 'Eletrônicos');
  const [price, setPrice] = useState(product ? String(product.price) : '299.90');
  const [oldPrice, setOldPrice] = useState(product?.oldPrice ? String(product.oldPrice) : '');
  const [description, setDescription] = useState(product?.description || '');
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || '');
  const [status, setStatus] = useState<Product['status']>(product?.status || 'available');
  const [tagsInput, setTagsInput] = useState(product?.tags.join(', ') || 'Novo, Destaque');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !imageUrl) return;

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    onSave({
      name,
      category,
      price: parseFloat(price) || 0,
      oldPrice: oldPrice ? parseFloat(oldPrice) : undefined,
      description,
      imageUrl,
      status,
      tags: tags.length > 0 ? tags : ['Produto']
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h3 className="font-bold text-slate-900 text-base">
            {product ? 'Editar Produto' : 'Novo Produto para o Catálogo'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nome do Produto*</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Fone Bluetooth Pro"
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Categoria</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Eletrônicos, Moda, etc"
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
              >
                <option value="available">Disponível</option>
                <option value="promotion">Em Promoção</option>
                <option value="new">Novo Lançamento</option>
                <option value="featured">Destaque</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preço Atual (R$)*</label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="199.90"
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preço Anterior (R$)</label>
              <input
                type="number"
                step="0.01"
                value={oldPrice}
                onChange={(e) => setOldPrice(e.target.value)}
                placeholder="249.90 (opcional)"
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <ImageUploadInput
            label="Foto do Produto (Arquivo Direto ou URL)"
            required
            value={imageUrl}
            onChange={setImageUrl}
            helpText="Selecione o arquivo de foto do produto do seu computador ou informe um link direto."
            aspectRatioClass="aspect-4/3"
          />

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Descrição do Produto</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Especificações, material, benefícios..."
              className="w-full p-2.5 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tags (separadas por vírgula)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Áudio, Bluetooth, Promoção"
              className="w-full p-2.5 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
            >
              Salvar Produto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EventFormModal({
  event,
  onClose,
  onSave
}: {
  event: EventPost | null;
  onClose: () => void;
  onSave: (data: Partial<EventPost>) => void;
}) {
  const [title, setTitle] = useState(event?.title || '');
  const [date, setDate] = useState(event?.date || '25 de Abril, 2026');
  const [location, setLocation] = useState(event?.location || 'São Paulo, SP');
  const [category, setCategory] = useState(event?.category || 'Evento');
  const [description, setDescription] = useState(event?.description || '');
  const [coverImage, setCoverImage] = useState(event?.coverImage || '');
  const [imagesText, setImagesText] = useState(
    event ? event.images.join('\n') : 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80\nhttps://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80'
  );
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const galleryList = imagesText
    .split('\n')
    .map(u => u.trim())
    .filter(Boolean);

  const handleGalleryFilesUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingGallery(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const optimized = await readFileAsOptimizedDataUrl(file);
          newUrls.push(optimized);
        }
      }
      if (newUrls.length > 0) {
        setImagesText(prev => {
          const current = prev.trim();
          return current ? `${current}\n${newUrls.join('\n')}` : newUrls.join('\n');
        });
        if (!coverImage) {
          setCoverImage(newUrls[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    const updated = galleryList.filter((_, idx) => idx !== indexToRemove);
    setImagesText(updated.join('\n'));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const urls = imagesText
      .split('\n')
      .map(u => u.trim())
      .filter(Boolean);

    const mainCover = coverImage.trim() || (urls.length > 0 ? urls[0] : 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80');

    onSave({
      title,
      date,
      location,
      category,
      description,
      coverImage: mainCover,
      images: urls.length > 0 ? urls : [mainCover]
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h3 className="font-bold text-slate-900 text-base">
            {event ? 'Editar Evento & Galeria' : 'Nova Postagem de Evento com Fotos'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Título do Evento*</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Lançamento de Verão 2026"
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Data</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="20 de Maio, 2026"
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Local</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="São Paulo, SP"
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Categoria</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Workshop, Festa..."
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          {/* Cover image with direct file upload */}
          <ImageUploadInput
            label="Imagem de Capa Principal do Evento"
            value={coverImage}
            onChange={setCoverImage}
            helpText="Faça upload de uma foto de capa do computador ou cole uma URL (ou deixe vazio para usar a 1ª foto da galeria)."
            aspectRatioClass="aspect-16/9"
          />

          {/* Gallery Photos with direct multiple files upload */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block font-semibold text-slate-700">
                Fotos da Galeria do Evento ({galleryList.length})*
              </label>

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={isUploadingGallery}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer text-[11px]"
              >
                {isUploadingGallery ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Processando fotos...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3 h-3" />
                    <span>+ Enviar Fotos do Computador</span>
                  </>
                )}
              </button>
              <input
                ref={galleryInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleGalleryFilesUpload}
                className="hidden"
              />
            </div>

            {/* Gallery Thumbnails */}
            {galleryList.length > 0 && (
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                {galleryList.map((url, idx) => (
                  <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-slate-300 bg-white shrink-0 shadow-2xs">
                    <img src={url} alt={`Foto ${idx + 1}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(idx)}
                      className="absolute inset-0 bg-rose-900/70 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                      title="Remover esta foto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[8px] text-center text-white font-bold py-0.5">
                        Foto 1
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">
                Ou cole URLs diretamente (1 por linha):
              </label>
              <textarea
                rows={3}
                required={galleryList.length === 0}
                value={imagesText}
                onChange={(e) => setImagesText(e.target.value)}
                placeholder="https://exemplo.com/foto1.jpg&#10;https://exemplo.com/foto2.jpg"
                className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-xs leading-relaxed"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Descrição do Evento</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Conte como foi o evento, participantes, novidades..."
              className="w-full p-2.5 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
            >
              Publicar Evento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
