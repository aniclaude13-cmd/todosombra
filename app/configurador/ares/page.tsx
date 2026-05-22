import ConfiguradorAres from '@/components/ares/ConfiguradorAres';
import Link from 'next/link';

export const metadata = {
  title: 'Configurador toldo ARES — TodoSombra',
  description: 'Configura tu toldo cofre ARES a medida y recíbelo en 4 semanas.',
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#faf9f6] p-4 lg:p-8">
      <header className="mb-6 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight">
          <span className="text-[#d4a034]">Todo</span><span className="text-[#1a1917]">Sombra</span>
        </Link>
        <Link href="/" className="text-sm text-[#7a756f] hover:text-[#1a1917] transition">
          ← Volver
        </Link>
      </header>
      <ConfiguradorAres />
    </main>
  );
}
