import { Metadata } from 'next';
import ConfiguradorWizard from '@/components/configurador/ConfiguradorWizard';

export const metadata: Metadata = {
  title: 'Configurador TodoSombra',
  description: 'Personaliza tu toldo, pérgola o estructura a medida',
};

export default function ConfiguradorPage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#faf9f6] to-[#f5f2ed] overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.32]"
        style={{
          backgroundImage: "url('/blueprint-pattern.svg')",
          backgroundRepeat: 'repeat',
          backgroundSize: '420px 420px',
        }}
        aria-hidden
      />
      <div className="relative">
        <ConfiguradorWizard />
      </div>
    </main>
  );
}
