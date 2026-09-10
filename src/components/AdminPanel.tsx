import { useState, FormEvent } from 'react';
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
  ExternalLink,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { 
  Product, 
  EventPost, 
  HeaderBanner, 
  SidebarBanner 
} from '../types';

interface AdminPanelProps {
  products: Product[];
  events: EventPost[];
  headerBanners: HeaderBanner[];
  sidebarBanners: SidebarBanner[];
  onUpdateProducts: (products: Product[]) => void;
  onUpdateEvents: (events: EventPost[]) => void;
  onUpdateHeaderBanners: (banners: HeaderBanner[]) => void;
  onUpdateSidebarBanners: (banners: SidebarBanner[]) => void;
  onResetAllData: () => void;
}

type AdminTab = 'header-banners' | 'sidebar-banners' | 'products' | 'events';

export function AdminPanel({
  products,
  events,
  headerBanners,
  sidebarBanners,
  onUpdateProducts,
  onUpdateEvents,
  onUpdateHeaderBanners,
  onUpdateSidebarBanners,
  onResetAllData
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('header-banners');

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
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Central de Postagens & Gestão</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            Painel Administrativo do Site
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Gerencie banners do topo (carrossel), banners laterais da direita, produtos do catálogo e posts com fotos dos eventos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-admin-reset-defaults"
            onClick={() => {
              if (window.confirm('Deseja restaurar todos os dados e banners para os valores de exemplo iniciais?')) {
                onResetAllData();
                showToast('Dados de exemplo restaurados com sucesso!');
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Exemplos</span>
          </button>
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

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Link Direto da Imagem (URL)*</label>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://exemplo.com/banner.jpg"
              className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-xs"
            />

            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="text-slate-400 self-center">Sugestões rápidas:</span>
              {presets.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setImageUrl(p.url);
                    if (!title) setTitle(p.title);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px]"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          {imageUrl && (
            <div className="aspect-16/9 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img src={imageUrl} alt="Prévia" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            </div>
          )}

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

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Link Direto da Imagem (URL)*</label>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://exemplo.com/banner-lateral.jpg"
              className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-xs"
            />

            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="text-slate-400 self-center">Sugestões:</span>
              {presets.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setImageUrl(p.url);
                    if (!title) setTitle(p.title);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px]"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          {imageUrl && (
            <div className="aspect-4/3 max-h-40 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img src={imageUrl} alt="Prévia" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            </div>
          )}

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

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Link Direto da Imagem (URL)*</label>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://exemplo.com/produto.jpg"
              className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-xs"
            />
          </div>

          {imageUrl && (
            <div className="aspect-4/3 max-h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img src={imageUrl} alt="Prévia" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            </div>
          )}

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

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Imagem de Capa (URL)</label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://exemplo.com/capa.jpg (ou deixe vazio para usar a 1ª foto)"
              className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Links Diretos das Fotos da Galeria (1 URL por linha)*
            </label>
            <textarea
              rows={4}
              required
              value={imagesText}
              onChange={(e) => setImagesText(e.target.value)}
              placeholder="https://exemplo.com/foto1.jpg&#10;https://exemplo.com/foto2.jpg"
              className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-xs leading-relaxed"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Cole múltiplos links diretos de imagens, um por linha, para compor o álbum de fotos do evento.
            </p>
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
