import { Trash2, Eye, ExternalLink, Copy, Check } from 'lucide-react';
import { useState, MouseEvent } from 'react';
import { ScreenItem } from '../types';

interface ScreenGridProps {
  screens: ScreenItem[];
  selectedScreenId: string;
  onSelectScreen: (screen: ScreenItem) => void;
  onDeleteScreen: (id: string) => void;
}

export function ScreenGrid({
  screens,
  selectedScreenId,
  onSelectScreen,
  onDeleteScreen
}: ScreenGridProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (e: MouseEvent, id: string, url: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {screens.map((screen) => {
        const isSelected = screen.id === selectedScreenId;
        return (
          <div
            key={screen.id}
            id={`card-screen-${screen.id}`}
            onClick={() => onSelectScreen(screen)}
            className={`group cursor-pointer bg-white rounded-xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
              isSelected
                ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div>
              {/* Image Preview */}
              <div className="relative aspect-4/3 bg-slate-100 overflow-hidden border-b border-slate-100">
                <img
                  src={screen.imageUrl}
                  alt={screen.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-white/90 backdrop-blur-xs text-slate-800 rounded-md shadow-xs">
                    {screen.category}
                  </span>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    id={`btn-copy-card-${screen.id}`}
                    onClick={(e) => handleCopyLink(e, screen.id, screen.imageUrl)}
                    className="p-1.5 bg-white/90 hover:bg-white text-slate-700 rounded-md shadow-xs hover:text-blue-600"
                    title="Copiar Link da Imagem"
                  >
                    {copiedId === screen.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={screen.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 bg-white/90 hover:bg-white text-slate-700 rounded-md shadow-xs hover:text-blue-600"
                    title="Abrir imagem em nova aba"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Card Meta */}
              <div className="p-3.5">
                <h4 className="font-semibold text-slate-800 text-sm line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">
                  {screen.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {screen.description || 'Sem descrição.'}
                </p>
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-3.5 pb-3 pt-1 flex items-center justify-between border-t border-slate-50 text-[11px] text-slate-400">
              <span className="capitalize">{screen.aspectRatio || 'mobile'}</span>
              <div className="flex items-center gap-1">
                <button
                  id={`btn-view-${screen.id}`}
                  onClick={() => onSelectScreen(screen)}
                  className="px-2 py-1 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 rounded text-slate-600 font-medium inline-flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  Visualizar
                </button>
                {screens.length > 1 && (
                  <button
                    id={`btn-delete-${screen.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteScreen(screen.id);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                    title="Remover tela"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
