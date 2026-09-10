import { useState } from 'react';
import { ShoppingBag, Camera, Settings, Menu, X, Store, Lock, LogOut, ShieldCheck, KeyRound } from 'lucide-react';
import { ActivePage, SiteSettings } from '../types';

interface HeaderProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  productCount: number;
  eventCount: number;
  sidebarBannersCount: number;
  isAuthenticated: boolean;
  adminUsername?: string;
  onRequestLogin: () => void;
  onLogout: () => void;
  onOpenChangePassword?: () => void;
  siteSettings: SiteSettings;
}

export function Header({
  activePage,
  onNavigate,
  productCount,
  eventCount,
  sidebarBannersCount,
  isAuthenticated,
  adminUsername,
  onRequestLogin,
  onLogout,
  onOpenChangePassword,
  siteSettings
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (page: ActivePage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const isDarkHeader = siteSettings.headerTextColor === 'light';
  const headerBg = siteSettings.headerBgColor || '#ffffff';

  return (
    <header 
      style={{ backgroundColor: headerBg }}
      className={`border-b sticky top-0 z-40 shadow-xs transition-colors duration-200 ${
        isDarkHeader ? 'border-slate-800/80 text-white' : 'border-slate-200 text-slate-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            onClick={() => handleNav('catalogo')}
            className="flex items-center gap-3 cursor-pointer group select-none py-1"
            title="Ir para o início"
          >
            {siteSettings.logoMode === 'logo-only' && siteSettings.logoUrl ? (
              <div className="flex items-center">
                <img
                  src={siteSettings.logoUrl}
                  alt={siteSettings.siteName || 'Logo'}
                  referrerPolicy="no-referrer"
                  style={{ height: `${siteSettings.logoHeight || 40}px` }}
                  className="max-h-12 w-auto object-contain transition-transform group-hover:scale-105"
                />
              </div>
            ) : siteSettings.logoMode === 'logo-and-name' && siteSettings.logoUrl ? (
              <div className="flex items-center gap-2.5">
                <img
                  src={siteSettings.logoUrl}
                  alt={siteSettings.siteName}
                  referrerPolicy="no-referrer"
                  style={{ height: `${siteSettings.logoHeight || 36}px` }}
                  className="max-h-11 w-auto object-contain transition-transform group-hover:scale-105"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`font-extrabold text-lg tracking-tight ${isDarkHeader ? 'text-white' : 'text-slate-900'}`}>
                      {siteSettings.siteName || 'PortalHub'}
                    </span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                      isDarkHeader ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' : 'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}>
                      Online
                    </span>
                  </div>
                  <p className={`text-[11px] hidden sm:block ${isDarkHeader ? 'text-slate-300' : 'text-slate-500'}`}>
                    Catálogo, Galeria de Eventos & Gestão
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`font-extrabold text-lg tracking-tight ${isDarkHeader ? 'text-white' : 'text-slate-900'}`}>
                      {siteSettings?.siteName || 'PortalHub'}
                    </span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                      isDarkHeader ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' : 'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}>
                      Online
                    </span>
                  </div>
                  <p className={`text-[11px] hidden sm:block ${isDarkHeader ? 'text-slate-300' : 'text-slate-500'}`}>
                    Catálogo, Galeria de Eventos & Gestão
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              id="nav-btn-catalogo"
              onClick={() => handleNav('catalogo')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activePage === 'catalogo'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isDarkHeader
                    ? 'text-slate-200 hover:text-white hover:bg-white/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Catálogo de Produtos</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                activePage === 'catalogo' 
                  ? 'bg-blue-700/80 text-blue-100' 
                  : isDarkHeader 
                    ? 'bg-white/15 text-slate-200' 
                    : 'bg-slate-100 text-slate-600'
              }`}>
                {productCount}
              </span>
            </button>

            <button
              id="nav-btn-eventos"
              onClick={() => handleNav('eventos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activePage === 'eventos'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isDarkHeader
                    ? 'text-slate-200 hover:text-white hover:bg-white/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Eventos & Fotos</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                activePage === 'eventos' 
                  ? 'bg-blue-700/80 text-blue-100' 
                  : isDarkHeader 
                    ? 'bg-white/15 text-slate-200' 
                    : 'bg-slate-100 text-slate-600'
              }`}>
                {eventCount}
              </span>
            </button>

            {isAuthenticated ? (
              <div className={`flex items-center gap-2 ml-2 pl-2 border-l ${isDarkHeader ? 'border-white/15' : 'border-slate-200'}`}>
                <button
                  id="nav-btn-admin"
                  onClick={() => handleNav('admin')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all border cursor-pointer ${
                    activePage === 'admin'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : isDarkHeader
                        ? 'border-white/20 text-white hover:bg-white/10 hover:border-white/40'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <Settings className="w-4 h-4 text-amber-500" />
                  <span>Painel Admin</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                    Gerenciar
                  </span>
                </button>

                {onOpenChangePassword && (
                  <button
                    id="nav-btn-change-password"
                    onClick={onOpenChangePassword}
                    title="Trocar a senha do administrador"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors shadow-2xs cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                    <span>Trocar Senha</span>
                  </button>
                )}

                <div className="flex items-center gap-1.5 pl-1">
                  <span className={`hidden lg:inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${
                    isDarkHeader ? 'text-slate-200 bg-white/10' : 'text-slate-500 bg-slate-100'
                  }`}>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className={`font-semibold ${isDarkHeader ? 'text-white' : 'text-slate-700'}`}>{adminUsername || 'admin'}</span>
                  </span>

                  <button
                    id="nav-btn-logout"
                    onClick={onLogout}
                    title="Encerrar sessão de admin"
                    className={`p-2 rounded-xl transition-colors border cursor-pointer ${
                      isDarkHeader 
                        ? 'text-rose-400 hover:text-white hover:bg-rose-600/30 border-transparent' 
                        : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50 border-transparent hover:border-rose-100'
                    }`}
                    aria-label="Sair da conta"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className={`ml-2 pl-2 border-l ${isDarkHeader ? 'border-white/15' : 'border-slate-200'}`}>
                <button
                  id="nav-btn-login-open"
                  onClick={onRequestLogin}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    isDarkHeader ? 'text-slate-200 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Acesso exclusivo para administradores"
                >
                  <Lock className={`w-3.5 h-3.5 ${isDarkHeader ? 'text-slate-300' : 'text-slate-500'}`} />
                  <span>Área Restrita</span>
                </button>
              </div>
            )}
          </nav>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated ? (
              <>
                {onOpenChangePassword && (
                  <button
                    id="mobile-btn-change-password-quick"
                    onClick={onOpenChangePassword}
                    className="p-2 text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg cursor-pointer"
                    title="Trocar Senha do Admin"
                  >
                    <KeyRound className="w-5 h-5 text-amber-600" />
                  </button>
                )}
                <button
                  id="mobile-btn-admin-quick"
                  onClick={() => handleNav('admin')}
                  className={`p-2 rounded-lg cursor-pointer ${isDarkHeader ? 'text-amber-400 hover:bg-white/10' : 'text-amber-600 hover:bg-slate-100'}`}
                  title="Painel Admin"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                id="mobile-btn-login-quick"
                onClick={onRequestLogin}
                className={`p-2 rounded-lg cursor-pointer ${isDarkHeader ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                title="Acesso Restrito"
              >
                <Lock className="w-5 h-5" />
              </button>
            )}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg cursor-pointer ${isDarkHeader ? 'text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className={`md:hidden py-3 border-t space-y-1 ${isDarkHeader ? 'border-white/10' : 'border-slate-100'}`}>
            <button
              onClick={() => handleNav('catalogo')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                activePage === 'catalogo' 
                  ? 'bg-blue-600 text-white' 
                  : isDarkHeader 
                    ? 'text-slate-200 hover:bg-white/10' 
                    : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4" />
                <span>Catálogo de Produtos</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${isDarkHeader ? 'bg-white/20 text-white' : 'bg-slate-200/60 text-slate-700'}`}>
                {productCount}
              </span>
            </button>

            <button
              onClick={() => handleNav('eventos')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                activePage === 'eventos' 
                  ? 'bg-blue-600 text-white' 
                  : isDarkHeader 
                    ? 'text-slate-200 hover:bg-white/10' 
                    : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Camera className="w-4 h-4" />
                <span>Eventos & Fotos</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${isDarkHeader ? 'bg-white/20 text-white' : 'bg-slate-200/60 text-slate-700'}`}>
                {eventCount}
              </span>
            </button>

            {isAuthenticated ? (
              <div className={`pt-2 mt-2 border-t space-y-1 ${isDarkHeader ? 'border-white/10' : 'border-slate-100'}`}>
                <button
                  onClick={() => handleNav('admin')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                    activePage === 'admin' 
                      ? 'bg-slate-900 text-white' 
                      : isDarkHeader 
                        ? 'text-white bg-white/10' 
                        : 'text-slate-800 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className="w-4 h-4 text-amber-500" />
                    <span>Painel Admin (Postagens & Banners)</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded">
                    Admin
                  </span>
                </button>

                {onOpenChangePassword && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenChangePassword();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors font-bold cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4 text-amber-600" />
                    <span>Trocar Senha do Admin</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors font-medium cursor-pointer ${
                    isDarkHeader ? 'text-rose-400 hover:bg-rose-500/20' : 'text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair do Acesso Administrativo</span>
                </button>
              </div>
            ) : (
              <div className={`pt-2 mt-2 border-t ${isDarkHeader ? 'border-white/10' : 'border-slate-100'}`}>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onRequestLogin();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium ${
                    isDarkHeader ? 'text-slate-200 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Lock className={`w-4 h-4 ${isDarkHeader ? 'text-slate-300' : 'text-slate-500'}`} />
                  <span>Área Restrita (Acesso Admin)</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
