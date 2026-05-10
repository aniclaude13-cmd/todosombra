import ConfiguradorAres from '@/components/ares/ConfiguradorAres';
import Link from 'next/link';

export const metadata = {
  title: 'Configurador toldo ARES — TodoSombra',
  description: 'Configura tu toldo cofre ARES a medida y recíbelo en 4 semanas.',
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
      <ConfiguradorAres />
    </main>
  );
}
