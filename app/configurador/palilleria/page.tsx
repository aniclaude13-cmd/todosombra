import ConfiguradorPalilleria from '@/components/palilleria/ConfiguradorPalilleria';
import Link from 'next/link';

export const metadata = {
  title: 'Configurador palillería 80×40 — TodoSombra',
  description: 'Configura tu pérgola de palillería 80×40 a medida y recíbela en 4 semanas.',
};

export default function Page() {
  return (
    <main className="min-h-screen bg-stone-100 p-4 lg:p-8">
      <header className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-stone-900 font-bold text-xl tracking-tight">
          TodoSombra
        </Link>
        <Link href="/" className="text-sm text-stone-500 hover:text-stone-900 transition">
          ← Volver
        </Link>
      </header>
      <ConfiguradorPalilleria />
    </main>
  );
}
