'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import AnimateIn from '@/components/AnimateIn';

type GalleryItem = {
  img: string;
  title: string;
  type: 'bioclim' | 'cofre' | 'pergola' | 'doble';
};

const ITEMS: GalleryItem[] = [
  { img: '/gallery/bioclim-1.jpg', title: 'Pérgola bioclimática — patio', type: 'bioclim' },
  { img: '/gallery/cofre-2.jpg', title: 'Toldo cofre con LED', type: 'cofre' },
  { img: '/gallery/bioclim-2.jpg', title: 'Pérgola bioclimática junto a piscina', type: 'bioclim' },
  { img: '/gallery/cofre-1.jpg', title: 'Toldo cofre sobre piscina', type: 'cofre' },
  { img: '/gallery/pergola-1.jpg', title: 'Pérgola con cubierta decorativa', type: 'pergola' },
  { img: '/gallery/cofre-3.jpg', title: 'Toldo cofre con vertical', type: 'cofre' },
  { img: '/gallery/bioclim-3.jpg', title: 'Pérgola bioclimática en terraza', type: 'bioclim' },
  { img: '/gallery/doble-1.jpg', title: 'Toldo doble brazo libre', type: 'doble' },
  { img: '/gallery/pergola-2.jpg', title: 'Pergotenda — cubierta textil', type: 'pergola' },
  { img: '/gallery/cofre-4.jpg', title: 'Toldo cofre — terraza ático', type: 'cofre' },
];

const FILTERS: { id: 'all' | GalleryItem['type']; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'bioclim', label: 'Bioclimáticas' },
  { id: 'cofre', label: 'Toldos cofre' },
  { id: 'pergola', label: 'Pérgolas' },
  { id: 'doble', label: 'Doble brazo' },
];

const WHATSAPP = 'https://wa.me/34644592007?text=Hola%2C%20me%20interesa%20un%20toldo%20o%20p%C3%A9rgola';

export default function Gallery() {
  const [filter, setFilter] = useState<'all' | GalleryItem['type']>('all');
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const filtered = filter === 'all' ? ITEMS : ITEMS.filter((i) => i.type === filter);

  const close = useCallback(() => setLightboxIdx(null), []);
  const next = useCallback(
    () => setLightboxIdx((i) => (i === null ? null : (i + 1) % filtered.length)),
    [filtered.length],
  );
  const prev = useCallback(
    () => setLightboxIdx((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length)),
    [filtered.length],
  );

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    document.addEventListener('keydown', onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = original;
    };
  }, [lightboxIdx, close, next, prev]);

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`text-sm px-4 py-2 rounded-full border transition ${
                active
                  ? 'bg-[#1a1917] text-white border-[#1a1917]'
                  : 'bg-white text-[#7a756f] border-[#e5e1d8] hover:border-[#d4a034] hover:text-[#1a1917]'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {filtered.map((item, i) => (
          <AnimateIn key={item.img} delay={i * 60}>
            <button
              type="button"
              onClick={() => setLightboxIdx(i)}
              className="relative h-64 w-full rounded-2xl overflow-hidden border border-[#e5e1d8] bg-gradient-to-br from-[#e5e1d8] to-[#d4d1cc] group cursor-zoom-in hover:shadow-lg hover:shadow-[#d4a034]/10 transition-all duration-300"
              aria-label={`Ver ${item.title}`}
            >
              <Image
                src={item.img}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0c0b]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-start p-4">
                <p className="text-white text-sm font-medium text-left">{item.title}</p>
              </div>
            </button>
          </AnimateIn>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-[#7a756f] mt-8">No hay instalaciones en esta categoría.</p>
      )}

      <div className="mt-8 text-center text-sm text-[#7a756f]">
        <p>
          ¿Tienes instalaciones que quieras compartir?{' '}
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#d4a034] hover:text-[#e8b442] font-medium"
          >
            Envíalas por WhatsApp →
          </a>
        </p>
      </div>

      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl flex items-center justify-center transition"
            aria-label="Cerrar"
          >
            ×
          </button>

          {filtered.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl flex items-center justify-center transition"
                aria-label="Anterior"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl flex items-center justify-center transition"
                aria-label="Siguiente"
              >
                ›
              </button>
            </>
          )}

          <div
            className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-[70vh]">
              <Image
                src={filtered[lightboxIdx].img}
                alt={filtered[lightboxIdx].title}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
            <p className="text-white/80 text-sm mt-4 text-center">
              {filtered[lightboxIdx].title}
              <span className="text-white/40 ml-3">
                {lightboxIdx + 1} / {filtered.length}
              </span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
