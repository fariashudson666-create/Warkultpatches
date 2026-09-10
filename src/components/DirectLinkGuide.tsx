import { useState } from 'react';
import { Code, Copy, Check, ChevronDown, ChevronUp, Link as LinkIcon, AlertCircle } from 'lucide-react';

export function DirectLinkGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const snippets = [
    {
      title: 'HTML Tradicional',
      description: 'Tag padrão HTML <img> com referrerpolicy para URLs externas:',
      code: '<img \n  src="https://exemplo.com/sua-imagem.png" \n  alt="Descrição da Tela" \n  referrerpolicy="no-referrer" \n  class="w-full h-auto rounded-lg" \n/>'
    },
    {
      title: 'React / JSX',
      description: 'Uso em componentes React com suporte a classes Tailwind:',
      code: '<img \n  src="https://exemplo.com/sua-imagem.png" \n  alt="Tela do App" \n  referrerPolicy="no-referrer" \n  className="w-full object-cover rounded-xl shadow-md" \n/>'
    },
    {
      title: 'Arquivo Local no Projeto (/public)',
      description: 'Coloque a imagem na pasta public/ e referencie pelo caminho relativo:',
      code: '<img \n  src="/assets/telas/dashboard.png" \n  alt="Dashboard do App" \n  className="w-full rounded-lg" \n/>'
    }
  ];

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden mb-6">
      <button
        id="btn-toggle-guide"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between bg-slate-50/80 hover:bg-slate-100/80 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
            <LinkIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-base">
              Sim! É possível adicionar links diretos para as imagens no HTML
            </h3>
            <p className="text-sm text-slate-500">
              Clique para ver como usar URLs diretas, tags &lt;img&gt; e exemplos prontos para copiar.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <span className="text-xs font-medium uppercase tracking-wider hidden sm:inline">
            {isOpen ? 'Ocultar Guia' : 'Ver Exemplos'}
          </span>
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-5 border-t border-slate-200 space-y-4 bg-white">
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium">Dica de Compatibilidade para URLs Externas</p>
              <p className="text-amber-800 text-xs mt-0.5">
                Sempre inclua <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">referrerPolicy="no-referrer"</code> ao carregar links diretos de servidores externos para evitar bloqueios de hotlinking.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {snippets.map((item, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-blue-600" />
                      {item.title}
                    </span>
                    <button
                      id={`btn-copy-snippet-${idx}`}
                      onClick={() => handleCopy(item.code, idx)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-blue-600 bg-white border border-slate-200 px-2 py-0.5 rounded hover:bg-slate-50 transition-colors"
                      title="Copiar código"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-slate-500 text-[11px] mb-2 leading-relaxed">{item.description}</p>
                </div>
                <pre className="p-2.5 bg-slate-900 text-slate-100 rounded text-[11px] font-mono overflow-x-auto whitespace-pre leading-snug">
                  {item.code}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
