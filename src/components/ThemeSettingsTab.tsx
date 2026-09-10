import { useState, FormEvent } from 'react';
import { Palette, Check, RotateCcw, Image as ImageIcon, Eye, Sun, Moon, Sparkles } from 'lucide-react';
import { SiteSettings } from '../types';
import { ImageUploadInput } from './ImageUploadInput';

interface ThemeSettingsTabProps {
  siteSettings: SiteSettings;
  onSave: (updatedSettings: SiteSettings) => void;
  showToast: (msg: string) => void;
}

export function ThemeSettingsTab({
  siteSettings,
  onSave,
  showToast
}: ThemeSettingsTabProps) {
  // Theme state
  const [bgColor, setBgColor] = useState(siteSettings.backgroundColor || '#f8fafc');
  const [bgImageUrl, setBgImageUrl] = useState(siteSettings.backgroundImageUrl || '');
  const [bgRepeat, setBgRepeat] = useState<SiteSettings['backgroundRepeat']>(siteSettings.backgroundRepeat || 'cover');
  const [bgOverlayOpacity, setBgOverlayOpacity] = useState<number>(siteSettings.backgroundOverlayOpacity ?? 0);

  const [headerBg, setHeaderBg] = useState(siteSettings.headerBgColor || '#ffffff');
  const [headerText, setHeaderText] = useState<SiteSettings['headerTextColor']>(siteSettings.headerTextColor || 'dark');

  const [footerBg, setFooterBg] = useState(siteSettings.footerBgColor || '#ffffff');
  const [footerText, setFooterText] = useState<SiteSettings['footerTextColor']>(siteSettings.footerTextColor || 'dark');

  // Palette suggestions
  const bgPalette = [
    { name: 'Cinza Suave', hex: '#f8fafc' },
    { name: 'Branco Puro', hex: '#ffffff' },
    { name: 'Cinza Neutro', hex: '#f1f5f9' },
    { name: 'Areia Suave', hex: '#faf7f2' },
    { name: 'Azul Gelado', hex: '#f0f4f8' },
    { name: 'Slate Noturno', hex: '#0f172a' },
    { name: 'Preto Grafite', hex: '#18181b' }
  ];

  const headerFooterPalette = [
    { name: 'Branco', hex: '#ffffff', text: 'dark' as const },
    { name: 'Slate Escuro', hex: '#0f172a', text: 'light' as const },
    { name: 'Preto Absoluto', hex: '#111827', text: 'light' as const },
    { name: 'Azul Marinho', hex: '#1e3a8a', text: 'light' as const },
    { name: 'Cinza Escuro', hex: '#1e293b', text: 'light' as const },
    { name: 'Grafite Nobre', hex: '#27272a', text: 'light' as const },
    { name: 'Azul Royal', hex: '#2563eb', text: 'light' as const }
  ];

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    const updated: SiteSettings = {
      ...siteSettings,
      backgroundColor: bgColor,
      backgroundImageUrl: bgImageUrl.trim(),
      backgroundRepeat: bgRepeat,
      backgroundOverlayOpacity: Number(bgOverlayOpacity),
      headerBgColor: headerBg,
      headerTextColor: headerText,
      footerBgColor: footerBg,
      footerTextColor: footerText
    };
    onSave(updated);
    showToast('Cores e imagem de fundo do site salvas com sucesso!');
  };

  const handleResetDefaults = () => {
    if (window.confirm('Deseja restaurar as cores para o padrão original (Cabeçalho e Rodapé Brancos, Fundo Claro sem imagem)?')) {
      setBgColor('#f8fafc');
      setBgImageUrl('');
      setBgRepeat('cover');
      setBgOverlayOpacity(0);
      setHeaderBg('#ffffff');
      setHeaderText('dark');
      setFooterBg('#ffffff');
      setFooterText('dark');

      const updated: SiteSettings = {
        ...siteSettings,
        backgroundColor: '#f8fafc',
        backgroundImageUrl: '',
        backgroundRepeat: 'cover',
        backgroundOverlayOpacity: 0,
        headerBgColor: '#ffffff',
        headerTextColor: 'dark',
        footerBgColor: '#ffffff',
        footerTextColor: 'dark'
      };
      onSave(updated);
      showToast('Cores restauradas para o padrão inicial.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Personalização de Cores, Fundo & Tema</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Escolha as cores ou envie uma imagem para o fundo do site, e configure as cores do cabeçalho e do rodapé.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Cores Padrão</span>
          </button>
        </div>
      </div>

      {/* Real-time Interactive Simulation Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            Pré-visualização da Combinação Visual
          </h4>
          <span className="text-[11px] text-slate-400">
            Simulação em escala das cores escolhidas
          </span>
        </div>

        <div 
          style={{
            backgroundColor: bgColor,
            ...(bgImageUrl ? {
              backgroundImage: `url(${bgImageUrl})`,
              backgroundRepeat: bgRepeat === 'repeat' ? 'repeat' : 'no-repeat',
              backgroundSize: bgRepeat === 'cover' ? 'cover' : bgRepeat === 'contain' ? 'contain' : 'auto',
              backgroundPosition: 'center'
            } : {})
          }}
          className="relative rounded-2xl border border-slate-300 overflow-hidden shadow-inner p-4 space-y-4 min-h-[220px] flex flex-col justify-between"
        >
          {/* Background Overlay Simulator */}
          {bgImageUrl && bgOverlayOpacity > 0 && (
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{ backgroundColor: `rgba(0,0,0,${bgOverlayOpacity / 100})` }}
            />
          )}

          {/* Simulated Header */}
          <div 
            style={{ backgroundColor: headerBg }}
            className={`relative z-10 px-4 py-2.5 rounded-xl border flex items-center justify-between shadow-xs transition-colors ${
              headerText === 'light' ? 'border-slate-700 text-white' : 'border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                {siteSettings.siteName?.[0] || 'L'}
              </div>
              <span className="font-extrabold text-xs">{siteSettings.siteName || 'Sua Loja'}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-semibold opacity-80">
              <span>Catálogo</span>
              <span>Eventos</span>
            </div>
          </div>

          {/* Simulated Body Content Cards */}
          <div className="relative z-10 grid grid-cols-3 gap-2">
            <div className="bg-white/90 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200 shadow-2xs text-center">
              <div className="w-full h-8 bg-slate-100 rounded-md mb-1.5" />
              <div className="h-2 w-3/4 bg-slate-200 rounded mx-auto mb-1" />
              <div className="h-2 w-1/2 bg-blue-200 rounded mx-auto" />
            </div>
            <div className="bg-white/90 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200 shadow-2xs text-center">
              <div className="w-full h-8 bg-slate-100 rounded-md mb-1.5" />
              <div className="h-2 w-3/4 bg-slate-200 rounded mx-auto mb-1" />
              <div className="h-2 w-1/2 bg-blue-200 rounded mx-auto" />
            </div>
            <div className="bg-white/90 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200 shadow-2xs text-center">
              <div className="w-full h-8 bg-slate-100 rounded-md mb-1.5" />
              <div className="h-2 w-3/4 bg-slate-200 rounded mx-auto mb-1" />
              <div className="h-2 w-1/2 bg-blue-200 rounded mx-auto" />
            </div>
          </div>

          {/* Simulated Footer */}
          <div 
            style={{ backgroundColor: footerBg }}
            className={`relative z-10 px-4 py-2.5 rounded-xl border flex items-center justify-between shadow-xs transition-colors ${
              footerText === 'light' ? 'border-slate-700 text-white' : 'border-slate-200 text-slate-900'
            }`}
          >
            <span className="font-bold text-xs">{siteSettings.siteName || 'Sua Loja'}</span>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold opacity-80">
              <span className="px-1.5 py-0.5 rounded bg-black/10">Instagram</span>
              <span className="px-1.5 py-0.5 rounded bg-black/10">WhatsApp</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Cabeçalho (Header) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              1. Cor do Cabeçalho (Topo)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Defina a cor de fundo da barra superior do site e o contraste dos textos e ícones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Cor de Fundo do Cabeçalho
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={headerBg}
                  onChange={(e) => setHeaderBg(e.target.value)}
                  className="w-10 h-10 rounded-xl border border-slate-300 p-0.5 cursor-pointer"
                />
                <input
                  type="text"
                  value={headerBg}
                  onChange={(e) => setHeaderBg(e.target.value)}
                  placeholder="#ffffff"
                  className="w-32 p-2.5 border border-slate-300 rounded-xl font-mono text-xs uppercase"
                />
              </div>

              {/* Palette */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {headerFooterPalette.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setHeaderBg(item.hex);
                      setHeaderText(item.text);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-white text-[11px] text-slate-700 cursor-pointer"
                  >
                    <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: item.hex }} />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Contraste do Texto do Cabeçalho
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setHeaderText('dark')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    headerText === 'dark'
                      ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Texto Escuro (Fundo claro)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHeaderText('light')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    headerText === 'light'
                      ? 'border-blue-600 bg-slate-900 text-white ring-2 ring-blue-500/20'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Texto Claro (Fundo escuro)</span>
                </button>
              </div>
              <span className="text-[11px] text-slate-400 mt-1.5 block">
                Se você escolher um cabeçalho preto, azul escuro ou grafite, marque &quot;Texto Claro&quot;.
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Fundo da Página (Background) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              2. Fundo Geral do Site (Cor ou Imagem de Fundo)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Altere a cor de fundo padrão ou envie uma foto/textura direta do seu computador.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Cor de Fundo da Página
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-10 rounded-xl border border-slate-300 p-0.5 cursor-pointer"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  placeholder="#f8fafc"
                  className="w-32 p-2.5 border border-slate-300 rounded-xl font-mono text-xs uppercase"
                />
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {bgPalette.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setBgColor(item.hex)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-white text-[11px] text-slate-700 cursor-pointer"
                  >
                    <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: item.hex }} />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ajuste da Imagem de Fundo
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBgRepeat('cover')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    bgRepeat === 'cover'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Cobrir Tela (Cover)
                </button>
                <button
                  type="button"
                  onClick={() => setBgRepeat('repeat')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    bgRepeat === 'repeat'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Repetir Textura (Pattern)
                </button>
                <button
                  type="button"
                  onClick={() => setBgRepeat('contain')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    bgRepeat === 'contain'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Conter (Contain)
                </button>
              </div>

              {/* Dark Overlay Slider */}
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Película Escura sobre a Imagem (Overlay)
                  </label>
                  <span className="text-xs font-bold text-slate-900">{bgOverlayOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="5"
                  value={bgOverlayOpacity}
                  onChange={(e) => setBgOverlayOpacity(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Escurece suavemente a imagem de fundo para que os textos e produtos continuem legíveis.
                </span>
              </div>
            </div>
          </div>

          {/* Direct File or URL Upload for Background Image */}
          <div className="pt-2">
            <ImageUploadInput
              label="Arquivo ou Imagem de Fundo do Site (Opcional)"
              value={bgImageUrl}
              onChange={setBgImageUrl}
              helpText="Selecione um arquivo de imagem ou textura do seu computador, ou cole uma URL."
              aspectRatioClass="aspect-21/9"
            />
          </div>
        </div>

        {/* Section 3: Rodapé (Footer) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
              3. Cor do Rodapé (Final da Página)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure a cor de fundo do rodapé onde ficam a logo da sua marca, o Instagram e o WhatsApp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Cor de Fundo do Rodapé
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={footerBg}
                  onChange={(e) => setFooterBg(e.target.value)}
                  className="w-10 h-10 rounded-xl border border-slate-300 p-0.5 cursor-pointer"
                />
                <input
                  type="text"
                  value={footerBg}
                  onChange={(e) => setFooterBg(e.target.value)}
                  placeholder="#ffffff"
                  className="w-32 p-2.5 border border-slate-300 rounded-xl font-mono text-xs uppercase"
                />
              </div>

              {/* Palette */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {headerFooterPalette.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setFooterBg(item.hex);
                      setFooterText(item.text);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-slate-200 hover:border-purple-400 bg-slate-50 hover:bg-white text-[11px] text-slate-700 cursor-pointer"
                  >
                    <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: item.hex }} />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Contraste do Texto do Rodapé
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFooterText('dark')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    footerText === 'dark'
                      ? 'border-purple-600 bg-purple-50 text-purple-800 ring-2 ring-purple-500/20'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Texto Escuro (Fundo claro)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFooterText('light')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    footerText === 'light'
                      ? 'border-purple-600 bg-slate-900 text-white ring-2 ring-purple-500/20'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Texto Claro (Fundo escuro)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <p className="text-xs text-slate-600">
            Clique em salvar para aplicar imediatamente as novas cores e imagem de fundo no site.
          </p>
          <button
            id="btn-save-theme-settings"
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Salvar Aparência, Fundo & Cores</span>
          </button>
        </div>
      </form>
    </div>
  );
}
