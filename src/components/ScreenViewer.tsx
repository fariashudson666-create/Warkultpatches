import { useState } from 'react';
import { 
  Smartphone, 
  Monitor, 
  Square, 
  Copy, 
  Check, 
  ExternalLink, 
  Code, 
  Layers,
  Sparkles
} from 'lucide-react';
import { ScreenItem } from '../types';

interface ScreenViewerProps {
  screen: ScreenItem;
  onDelete?: (id: string) => void;
}

export function ScreenViewer({ screen }: ScreenViewerProps) {
  const [deviceFrame, setDeviceFrame] = useState<'mobile' | 'desktop' | 'raw'>(
    screen.aspectRatio === 'desktop' ? 'desktop' : 'mobile'
  );
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showCodePreview, setShowCodePreview] = useState(false);

  const htmlSnippet = `<img \n  src="${screen.imageUrl}" \n  alt="${screen.title}" \n  referrerpolicy="no-referrer" \n  class="w-full h-auto object-cover rounded-xl shadow-lg" \n/>`;

  const copyToClipboard = (text: string, type: 'code' | 'url') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              {screen.category}
            </span>
            <div className="flex gap-1.5">
              {screen.tags.map((tag, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-900">{screen.title}</h2>
          {screen.description && (
            <p className="text-sm text-slate-600 mt-0.5 max-w-2xl">{screen.description}</p>
          )}
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-slate-600 text-xs">
            <button
              id="btn-frame-mobile"
              onClick={() => setDeviceFrame('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                deviceFrame === 'mobile' ? 'bg-white text-blue-600 font-semibold shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Mobile</span>
            </button>
            <button
              id="btn-frame-desktop"
              onClick={() => setDeviceFrame('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                deviceFrame === 'desktop' ? 'bg-white text-blue-600 font-semibold shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Desktop</span>
            </button>
            <button
              id="btn-frame-raw"
              onClick={() => setDeviceFrame('raw')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                deviceFrame === 'raw' ? 'bg-white text-blue-600 font-semibold shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              <Square className="w-4 h-4" />
              <span>Original</span>
            </button>
          </div>
        </div>
      </div>

      {/* Screen Frame Mockup Area */}
      <div className="my-6 py-8 px-4 bg-radial from-slate-100 to-slate-200/60 rounded-xl flex items-center justify-center min-h-[440px] overflow-hidden border border-slate-200/80">
        {deviceFrame === 'mobile' && (
          <div className="w-[300px] h-[580px] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-700/80 relative flex flex-col items-center">
            {/* Dynamic island / speaker */}
            <div className="w-24 h-4 bg-black rounded-full mb-2 z-10"></div>
            {/* Screen content container */}
            <div className="w-full h-full bg-slate-800 rounded-[32px] overflow-hidden relative flex flex-col">
              <img
                src={screen.imageUrl}
                alt={screen.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top"
              />
            </div>
            {/* Home indicator bar */}
            <div className="w-28 h-1 bg-white/40 rounded-full mt-2"></div>
          </div>
        )}

        {deviceFrame === 'desktop' && (
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col">
            {/* Browser top header */}
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              <div className="flex-1 max-w-sm mx-auto bg-white border border-slate-200 rounded px-2 py-0.5 text-[11px] text-slate-500 font-mono truncate text-center">
                {screen.imageUrl}
              </div>
            </div>
            {/* Browser window body */}
            <div className="aspect-16/10 w-full overflow-hidden bg-slate-100 flex items-center justify-center">
              <img
                src={screen.imageUrl}
                alt={screen.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>
        )}

        {deviceFrame === 'raw' && (
          <div className="max-w-xl max-h-[500px] rounded-xl overflow-hidden shadow-xl border border-slate-200 bg-white">
            <img
              src={screen.imageUrl}
              alt={screen.title}
              referrerPolicy="no-referrer"
              className="max-h-[500px] w-auto object-contain mx-auto"
            />
          </div>
        )}
      </div>

      {/* Direct Link Actions & Snippet Bar */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-2 truncate max-w-md">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Link Direto:</span>
            <code className="text-xs font-mono text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded truncate">
              {screen.imageUrl}
            </code>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-copy-url"
              onClick={() => copyToClipboard(screen.imageUrl, 'url')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'URL Copiada!' : 'Copiar URL'}</span>
            </button>

            <a
              href={screen.imageUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir Original</span>
            </a>

            <button
              id="btn-toggle-snippet"
              onClick={() => setShowCodePreview(!showCodePreview)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-xs"
            >
              <Code className="w-3.5 h-3.5" />
              <span>{showCodePreview ? 'Ocultar HTML' : 'Ver Código HTML/JSX'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible HTML Snippet */}
        {showCodePreview && (
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Código HTML / JSX com Link Direto para esta tela:
              </span>
              <button
                id="btn-copy-html-snippet"
                onClick={() => copyToClipboard(htmlSnippet, 'code')}
                className="inline-flex items-center gap-1 text-xs text-blue-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-md transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copiado!' : 'Copiar Snippet'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre">
              {htmlSnippet}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
