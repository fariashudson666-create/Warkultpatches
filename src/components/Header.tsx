import { useState } from 'react';
import { ShoppingBag, Camera, Settings, Menu, X, Sparkles, Store } from 'lucide-react';
import { ActivePage } from '../types';

interface HeaderProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  productCount: number;
  eventCount: number;
  sidebarBannersCount: number;
}

export function Header({
  activePage,
  onNavigate,
  productCount,
  eventCount,
  sidebarBannersCount
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (page: ActivePage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            onClick={() => handleNav('catalogo')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">PortalHub</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Catálogo, Galeria de Eventos & Gestão
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              id="nav-btn-catalogo"
              onClick={() => handleNav('catalogo')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activePage === 'catalogo'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Catálogo de Produtos</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                activePage === 'catalogo' ? 'bg-blue-700/80 text-blue-100' : 'bg-slate-100 text-slate-600'
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
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Eventos & Fotos</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                activePage === 'eventos' ? 'bg-blue-700/80 text-blue-100' : 'bg-slate-100 text-slate-600'
              }`}>
                {eventCount}
              </span>
            </button>

            <button
              id="nav-btn-admin"
              onClick={() => handleNav('admin')}
              className={`flex items-center gap-2 ml-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                activePage === 'admin'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <Settings className="w-4 h-4 text-amber-500" />
              <span>Painel Admin</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                Gerenciar
              </span>
            </button>
          </nav>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="mobile-btn-admin-quick"
              onClick={() => handleNav('admin')}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
              title="Painel Admin"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-100 space-y-1">
            <button
              onClick={() => handleNav('catalogo')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                activePage === 'catalogo' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4" />
                <span>Catálogo de Produtos</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-700">
                {productCount}
              </span>
            </button>

            <button
              onClick={() => handleNav('eventos')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                activePage === 'eventos' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Camera className="w-4 h-4" />
                <span>Eventos & Fotos</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-700">
                {eventCount}
              </span>
            </button>

            <button
              onClick={() => handleNav('admin')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                activePage === 'admin' ? 'bg-slate-900 text-white' : 'text-slate-800 bg-slate-50 hover:bg-slate-100'
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
          </div>
        )}
      </div>
    </header>
  );
}
