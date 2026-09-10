import { useState, FormEvent } from 'react';
import { X, Image as ImageIcon, Link as LinkIcon, Check } from 'lucide-react';
import { ScreenItem } from '../types';

interface AddScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (screen: ScreenItem) => void;
}

const PRESET_SUGGESTIONS = [
  {
    name: 'Dashboard Moderno',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    aspectRatio: 'desktop' as const
  },
  {
    name: 'App Mobile E-commerce',
    url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
    aspectRatio: 'mobile' as const
  },
  {
    name: 'Tela de Login / Autenticação',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    aspectRatio: 'mobile' as const
  }
];

export function AddScreenModal({ isOpen, onClose, onAdd }: AddScreenModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Geral');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'mobile' | 'desktop' | 'square'>('mobile');
  const [tagInput, setTagInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    const tags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const newScreen: ScreenItem = {
      id: `screen-${Date.now()}`,
      title: title.trim(),
      category: category.trim() || 'Geral',
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      aspectRatio,
      tags: tags.length > 0 ? tags : ['Nova Tela']
    };

    onAdd(newScreen);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 sticky top-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Adicionar Nova Tela com Link Direto</h3>
              <p className="text-xs text-slate-500">Insira a URL direta da imagem para renderizar a tela</p>
            </div>
          </div>
          <button
            id="btn-close-modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Link Direto da Imagem (URL)*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <LinkIcon className="w-4 h-4" />
              </div>
              <input
                id="input-screen-image-url"
                type="url"
                required
                placeholder="https://exemplo.com/tela.png"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-xs"
              />
            </div>

            {/* Quick preset suggestions */}
            <div className="mt-2">
              <span className="text-[11px] text-slate-400 block mb-1">Sugestões de teste:</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_SUGGESTIONS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setImageUrl(preset.url);
                      setTitle(preset.name);
                      setAspectRatio(preset.aspectRatio);
                    }}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded transition-colors"
                  >
                    + {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {imageUrl && (
            <div className="border border-slate-200 rounded-lg p-2 bg-slate-50">
              <span className="text-[11px] font-medium text-slate-500 block mb-1.5">Pré-visualização do Link:</span>
              <div className="max-h-40 overflow-hidden rounded flex items-center justify-center bg-slate-200">
                <img
                  src={imageUrl}
                  alt="Prévia"
                  referrerPolicy="no-referrer"
                  className="max-h-40 w-auto object-contain rounded"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<span class="text-xs text-rose-500 p-3">Não foi possível carregar a imagem desta URL. Verifique se o link direto é público.</span>';
                    }
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Título da Tela*
            </label>
            <input
              id="input-screen-title"
              type="text"
              required
              placeholder="Ex: Tela de Checkout, Dashboard Financeiro"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Categoria
              </label>
              <input
                id="input-screen-category"
                type="text"
                placeholder="Ex: Auth, Dashboard, Vendas"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Formato da Moldura
              </label>
              <select
                id="select-screen-aspect-ratio"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as 'mobile' | 'desktop' | 'square')}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="mobile">Mobile (Vertical)</option>
                <option value="desktop">Desktop (Horizontal)</option>
                <option value="square">Quadrado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Descrição ou Notas
            </label>
            <textarea
              id="textarea-screen-desc"
              rows={2}
              placeholder="Descreva os componentes ou objetivo desta tela..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Tags (separadas por vírgula)
            </label>
            <input
              id="input-screen-tags"
              type="text"
              placeholder="Mobile, Login, UI"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              id="btn-cancel-add-screen"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-submit-add-screen"
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              <Check className="w-4 h-4" />
              Adicionar Tela
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
