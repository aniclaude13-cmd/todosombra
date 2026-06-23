import { Metadata } from 'next';
import ConfiguradorWizard from '@/components/configurador/ConfiguradorWizard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Configurador TodoSombra',
  description: 'Personaliza tu toldo, pérgola o estructura a medida',
};

export default function ConfiguradorPage() {
  return (
    <>
      <Navbar />
      <main className="relative w-full flex-1 bg-gradient-to-br from-[#faf9f6] to-[#f5f2ed] overflow-y-auto flex items-center justify-center">
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.32]"
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
      <Footer />
    </>
  );
}
