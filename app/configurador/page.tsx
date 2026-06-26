import { Metadata } from 'next';
import ConfiguradorWrapper from '@/components/configurador/ConfiguradorWrapper';
import { PanelParticular, PanelProfesional } from '@/components/configurador/BeneficiosLaterales';
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
        <div className="relative w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 flex items-start justify-center gap-8">
          <PanelParticular />
          <div className="flex-shrink-0">
            <ConfiguradorWrapper />
          </div>
          <PanelProfesional />
        </div>
      </main>
      <Footer />
    </>
  );
}
