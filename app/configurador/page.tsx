import { Metadata } from 'next';
import ConfiguradorWizard from '@/components/configurador/ConfiguradorWizard';

export const metadata: Metadata = {
  title: 'Configurador TodoSombra',
  description: 'Personaliza tu toldo, pérgola o estructura a medida',
};

export default function ConfiguradorPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#faf9f6] to-[#f5f2ed]">
      <ConfiguradorWizard />
    </main>
  );
}
