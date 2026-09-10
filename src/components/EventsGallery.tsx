import { useState, MouseEvent } from 'react';
import { 
  Camera, 
  Calendar, 
  MapPin, 
  Image as ImageIcon, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Search
} from 'lucide-react';
import { EventPost } from '../types';

interface EventsGalleryProps {
  events: EventPost[];
}

export function EventsGallery({ events }: EventsGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<{ eventId: string; photoIdx: number } | null>(null);

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeLightboxEvent = selectedPhotoIndex 
    ? events.find(e => e.id === selectedPhotoIndex.eventId)
    : null;

  const currentLightboxImage = activeLightboxEvent && selectedPhotoIndex
    ? activeLightboxEvent.images[selectedPhotoIndex.photoIdx]
    : null;

  const handleNextPhoto = (e: MouseEvent) => {
    e.stopPropagation();
    if (!activeLightboxEvent || !selectedPhotoIndex) return;
    const nextIdx = (selectedPhotoIndex.photoIdx + 1) % activeLightboxEvent.images.length;
    setSelectedPhotoIndex({ eventId: activeLightboxEvent.id, photoIdx: nextIdx });
  };

  const handlePrevPhoto = (e: MouseEvent) => {
    e.stopPropagation();
    if (!activeLightboxEvent || !selectedPhotoIndex) return;
    const prevIdx = selectedPhotoIndex.photoIdx === 0 
      ? activeLightboxEvent.images.length - 1 
      : selectedPhotoIndex.photoIdx - 1;
    setSelectedPhotoIndex({ eventId: activeLightboxEvent.id, photoIdx: prevIdx });
  };

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            Galeria de Eventos & Fotos
          </h2>
          <p className="text-xs text-slate-500">
            Confira a cobertura fotográfica completa e os melhores momentos dos nossos eventos
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="search-events-input"
            type="text"
            placeholder="Buscar eventos ou locais..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-8">
        {filteredEvents.map((event) => (
          <article
            key={event.id}
            id={`event-post-${event.id}`}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-sm transition-shadow"
          >
            {/* Event Header Banner */}
            <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900">
              <img
                src={event.coverImage || event.images[0]}
                alt={event.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover brightness-[0.7] hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-6 text-white">
                <div className="flex flex-wrap items-center gap-3 text-xs mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-semibold">
                    {event.category}
                  </span>
                  <div className="flex items-center gap-1 text-slate-300">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-300">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{event.location}</span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-black leading-tight text-white">
                  {event.title}
                </h3>
              </div>
            </div>

            {/* Event Body & Photo Gallery Grid */}
            <div className="p-6 space-y-5">
              <p className="text-sm text-slate-700 leading-relaxed max-w-4xl">
                {event.description}
              </p>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    Fotos do Evento ({event.images.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Clique em uma foto para ampliar
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {event.images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedPhotoIndex({ eventId: event.id, photoIdx: idx })}
                      className="group relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 cursor-pointer border border-slate-200"
                    >
                      <img
                        src={imgUrl}
                        alt={`${event.title} - Foto ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Camera className="w-5 h-5 drop-shadow" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}

        {filteredEvents.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Camera className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Nenhum evento encontrado</p>
            <p className="text-xs text-slate-500 mt-1">Tente buscar por outro termo ou adicione novos eventos no Painel Admin.</p>
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {selectedPhotoIndex && activeLightboxEvent && currentLightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          {/* Close button */}
          <button
            id="btn-close-lightbox"
            onClick={() => setSelectedPhotoIndex(null)}
            className="absolute top-4 right-4 p-2.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Photo Counter */}
          <div className="absolute top-4 left-4 text-xs font-semibold text-white/80 bg-white/10 px-3 py-1.5 rounded-full z-10">
            {selectedPhotoIndex.photoIdx + 1} de {activeLightboxEvent.images.length} • {activeLightboxEvent.title}
          </div>

          {/* Previous button */}
          {activeLightboxEvent.images.length > 1 && (
            <button
              id="btn-lightbox-prev"
              onClick={handlePrevPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Image */}
          <div 
            className="max-w-4xl max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentLightboxImage}
              alt="Ampliada"
              referrerPolicy="no-referrer"
              className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Next button */}
          {activeLightboxEvent.images.length > 1 && (
            <button
              id="btn-lightbox-next"
              onClick={handleNextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
