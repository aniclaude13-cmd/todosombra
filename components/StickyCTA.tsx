'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const WHATSAPP = 'https://wa.me/34644592007?text=Hola%2C%20me%20interesa%20un%20toldo%20o%20p%C3%A9rgola';

export default function StickyCTA() {
  const [visible, setVisible] = useState(false);
  const [hideOnConfig, setHideOnConfig] = useState(false);

  useEffect(() => {
    setHideOnConfig(window.location.pathname.startsWith('/configurador'));

    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (hideOnConfig) return null;

  const transitionClass = visible
    ? 'opacity-100 translate-y-0'
    : 'opacity-0 translate-y-4 pointer-events-none';

  return (
    <>
      <a
        href={WHATSAPP}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Hablar por WhatsApp"
        data-track="click_whatsapp"
        data-track-param-location="sticky_floating"
        className={`fixed bottom-4 left-4 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#1ebe57] rounded-full shadow-xl shadow-[#25D366]/30 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${transitionClass}`}
      >
        <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white" aria-hidden>
          <path d="M16.003 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.26.6 4.46 1.73 6.4l-1.83 6.7 6.86-1.8a12.74 12.74 0 0 0 6.04 1.54h.01c7.06 0 12.8-5.73 12.8-12.8 0-3.42-1.33-6.63-3.75-9.05a12.72 12.72 0 0 0-9.06-3.79zm0 23.36h-.01c-1.94 0-3.85-.52-5.52-1.51l-.4-.24-4.07 1.07 1.09-3.97-.26-.41a10.59 10.59 0 0 1-1.62-5.6c0-5.86 4.77-10.63 10.64-10.63 2.84 0 5.51 1.11 7.52 3.12a10.55 10.55 0 0 1 3.11 7.52c0 5.87-4.77 10.63-10.63 10.63zm5.83-7.95c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.71.16-.21.32-.82 1.04-1 1.25-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.57a9.58 9.58 0 0 1-1.77-2.2c-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.55-.08-.16-.71-1.7-.97-2.34-.26-.62-.52-.53-.71-.54l-.61-.01a1.18 1.18 0 0 0-.85.4c-.29.32-1.11 1.09-1.11 2.65 0 1.57 1.14 3.09 1.3 3.3.16.21 2.24 3.42 5.43 4.79.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.89-.77 2.15-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37z" />
        </svg>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#d4a034] rounded-full border-2 border-[#faf9f6] animate-pulse" />
      </a>

      <Link
        href="/configurador"
        className={`fixed bottom-4 right-4 z-50 hidden sm:inline-flex items-center gap-2 bg-[#1a1917] text-white font-semibold pl-5 pr-6 py-3 rounded-full shadow-xl shadow-black/20 hover:bg-[#0d0c0b] transition-all duration-300 hover:scale-105 active:scale-95 text-sm ${transitionClass}`}
      >
        <span className="text-[#d4a034] text-base">⚡</span>
        Cotizar en 1 minuto
      </Link>

      <Link
        href="/configurador"
        className={`fixed bottom-4 right-4 z-50 sm:hidden inline-flex items-center gap-2 bg-[#1a1917] text-white font-semibold pl-4 pr-5 py-2.5 rounded-full shadow-xl shadow-black/20 transition-all duration-300 text-xs ${transitionClass}`}
      >
        <span className="text-[#d4a034]">⚡</span>
        Cotizar en 1 min
      </Link>
    </>
  );
}
