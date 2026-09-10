import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, ImageOff } from 'lucide-react';
import { HeaderBanner, ActivePage } from '../types';

interface TopBannerSliderProps {
  banners: HeaderBanner[];
  onNavigate: (page: ActivePage) => void;
}

export function TopBannerSlider({ banners, onNavigate }: TopBannerSliderProps) {
  const activeBanners = banners.filter(b => b.active);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto slide
  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeBanners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [activeBanners.length, isPaused]);

  // Reset index if out of bounds
  useEffect(() => {
    if (currentIndex >= activeBanners.length) {
      setCurrentIndex(0);
    }
  }, [activeBanners.length, currentIndex]);

  if (activeBanners.length === 0) {
    return (
      <div className="bg-slate-800 text-white rounded-2xl p-8 my-6 text-center border border-slate-700 flex flex-col items-center justify-center min-h-[220px]">
        <ImageOff className="w-10 h-10 text-slate-400 mb-2" />
        <h3 className="font-bold text-lg">Nenhum banner ativo no cabeçalho</h3>
        <p className="text-sm text-slate-300 max-w-md mt-1">
          Você pode adicionar múltiplos banners com imagens pelo Painel Admin para criar um carrossel no topo do site.
        </p>
        <button
          onClick={() => onNavigate('admin')}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-2"
        >
          Adicionar Banner no Painel Admin
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const current = activeBanners[currentIndex];

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? activeBanners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % activeBanners.length);
  };

  const handleActionClick = (target?: string) => {
    if (target === 'catalogo' || target === 'eventos' || target === 'admin') {
      onNavigate(target as ActivePage);
    } else if (target && (target.startsWith('http') || target.startsWith('/'))) {
      window.open(target, '_blank');
    } else {
      onNavigate('catalogo');
    }
  };

  return (
    <div 
      className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200/80 my-4 bg-slate-950 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Banner Slide Frame */}
      <div className="relative h-[280px] sm:h-[360px] md:h-[420px] w-full overflow-hidden">
        <img
          key={current.id}
          src={current.imageUrl}
          alt={current.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transition-all duration-700 brightness-[0.75]"
        />

        {/* Gradient Overlay for Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/50 to-transparent flex flex-col justify-center px-6 sm:px-12 md:px-16">
          <div className="max-w-xl text-white space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Destaque Especial</span>
            </div>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-sm">
              {current.title}
            </h2>

            {current.subtitle && (
              <p className="text-sm sm:text-base text-slate-200 line-clamp-2 max-w-lg leading-relaxed drop-shadow-xs">
                {current.subtitle}
              </p>
            )}

            {current.buttonText && (
              <div className="pt-2">
                <button
                  id={`btn-banner-cta-${current.id}`}
                  onClick={() => handleActionClick(current.buttonLink)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-md hover:shadow-lg hover:translate-x-0.5 active:translate-y-0.5"
                >
                  <span>{current.buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Controls (If multiple banners) */}
      {activeBanners.length > 1 && (
        <>
          <button
            id="btn-prev-banner"
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105"
            aria-label="Banner anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            id="btn-next-banner"
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105"
            aria-label="Próximo banner"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/30 backdrop-blur-xs px-3 py-1.5 rounded-full">
            {activeBanners.map((b, idx) => (
              <button
                key={b.id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'w-6 bg-blue-500' : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Ir para banner ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
