import { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Layers, 
  Image as ImageIcon,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { ScreenItem } from './types';
import { INITIAL_SCREENS } from './data/defaultScreens';
import { DirectLinkGuide } from './components/DirectLinkGuide';
import { ScreenViewer } from './components/ScreenViewer';
import { ScreenGrid } from './components/ScreenGrid';
import { AddScreenModal } from './components/AddScreenModal';

export default function App() {
  const [screens, setScreens] = useState<ScreenItem[]>(INITIAL_SCREENS);
  const [selectedScreenId, setSelectedScreenId] = useState<string>(INITIAL_SCREENS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Derive categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(screens.map(s => s.category)));
    return ['Todas', ...cats];
  }, [screens]);

  // Filtered screens
  const filteredScreens = useMemo(() => {
    return screens.filter(s => {
      const matchesCategory = selectedCategory === 'Todas' || s.category === selectedCategory;
      const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [screens, selectedCategory, searchQuery]);

  const activeScreen = useMemo(() => {
    return screens.find(s => s.id === selectedScreenId) || screens[0];
  }, [screens, selectedScreenId]);

  const handleAddScreen = (newScreen: ScreenItem) => {
    setScreens(prev => [newScreen, ...prev]);
    setSelectedScreenId(newScreen.id);
  };

  const handleDeleteScreen = (id: string) => {
    const updated = screens.filter(s => s.id !== id);
    setScreens(updated);
    if (selectedScreenId === id && updated.length > 0) {
      setSelectedScreenId(updated[0].id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-lg leading-tight">
                Visualizador de Telas & Links Diretos
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Renderização de imagens por URL, pré-visualização em dispositivos e exportação HTML
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-add-screen-header"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-xs sm:text-sm transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Link de Imagem</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Direct Link Guide Banner */}
        <DirectLinkGuide />

        {/* Active Screen Mockup Viewer */}
        {activeScreen && (
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Pré-visualização Ativa
              </span>
            </div>
            <ScreenViewer
              screen={activeScreen}
              onDelete={handleDeleteScreen}
            />
          </section>
        )}

        {/* Gallery / Filter Section */}
        <section className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                Galeria de Telas ({filteredScreens.length})
              </h3>
              <p className="text-xs text-slate-500">
                Selecione uma tela para carregar na moldura ou copie o link direto.
              </p>
            </div>

            {/* Search & Category Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="input-search-screens"
                  type="text"
                  placeholder="Buscar tela..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-44 sm:w-56"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto py-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    id={`btn-cat-${cat}`}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Screens Grid */}
          {filteredScreens.length > 0 ? (
            <ScreenGrid
              screens={filteredScreens}
              selectedScreenId={selectedScreenId}
              onSelectScreen={(screen) => setSelectedScreenId(screen.id)}
              onDeleteScreen={handleDeleteScreen}
            />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-2">
              <p className="text-sm font-medium text-slate-700">Nenhuma tela encontrada com esses filtros</p>
              <p className="text-xs text-slate-500">Tente buscar por outro termo ou adicione uma nova tela com link direto.</p>
              <button
                id="btn-clear-filters"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('Todas');
                }}
                className="mt-2 text-xs text-blue-600 font-semibold hover:underline"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </section>

        {/* Prompt Guidance Note */}
        <section className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0 mt-0.5 sm:mt-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">
                Quer recriar telas específicas para o seu app?
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Você pode colar links diretos de imagens ou descrever as telas desejadas no chat. O assistente pode gerar o layout em código interativo ou renderizar as imagens diretamente via HTML.
              </p>
            </div>
          </div>
          <button
            id="btn-add-screen-bottom"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
          >
            Testar Novo Link Direto
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        Visualizador de Telas • Suporte a Links Diretos no HTML & JSX
      </footer>

      {/* Add Screen Modal */}
      <AddScreenModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddScreen}
      />
    </div>
  );
}
