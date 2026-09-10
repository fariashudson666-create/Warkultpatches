import { ExternalLink, Tag, Sparkles } from 'lucide-react';
import { SidebarBanner } from '../types';

interface RightSidebarProps {
  banners: SidebarBanner[];
}

export function RightSidebar({ banners }: RightSidebarProps) {
  const activeBanners = banners.filter(b => b.active);

  // Exact user requirement: "se não colocarnao aparece nada"
  if (activeBanners.length === 0) {
    return null;
  }

  return (
    <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-4">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Destaques Laterais ({activeBanners.length})
        </span>
      </div>

      <div className="space-y-4">
        {activeBanners.map((banner) => {
          const content = (
            <div className="relative group overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all duration-300">
              {/* Banner Image */}
              <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Badge if present */}
                {banner.badge && (
                  <div className="absolute top-2.5 left-2.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-600 text-white shadow-xs">
                      <Tag className="w-3 h-3" />
                      {banner.badge}
                    </span>
                  </div>
                )}

                {banner.linkUrl && (
                  <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="p-1.5 bg-white/90 backdrop-blur-xs text-slate-800 rounded-md shadow-xs block">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </div>
                )}
              </div>

              {/* Banner Info */}
              <div className="p-4">
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors line-clamp-1">
                  {banner.title}
                </h4>
                {banner.subtitle && (
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {banner.subtitle}
                  </p>
                )}
              </div>
            </div>
          );

          if (banner.linkUrl && banner.linkUrl !== '#') {
            return (
              <a
                key={banner.id}
                id={`sidebar-banner-${banner.id}`}
                href={banner.linkUrl}
                target="_blank"
                rel="noreferrer"
                className="block focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-2xl"
              >
                {content}
              </a>
            );
          }

          return (
            <div key={banner.id} id={`sidebar-banner-${banner.id}`}>
              {content}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
