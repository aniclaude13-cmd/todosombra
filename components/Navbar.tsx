'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="bg-white border-b border-[#e5e1d8] sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Home */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition">
            <div className="text-xl font-bold text-[#d4a034]">TodoSombra</div>
          </Link>

          {/* Centro - Links a productos */}
          <div className="hidden sm:flex items-center space-x-8">
            <Link href="/" className="text-[#7a756f] hover:text-[#1a1917] transition text-sm font-medium">
              Inicio
            </Link>
            <Link href="/configurador" className="text-[#1a1917] font-medium text-sm">
              Configurador
            </Link>
          </div>

          {/* Derecha - Botón de volver */}
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-1 px-4 py-2 rounded-lg border border-[#e5e1d8] hover:bg-[#fdf6e8] hover:border-[#d4a034] transition text-[#7a756f] text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Atrás</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
