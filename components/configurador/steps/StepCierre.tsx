import { WizardState } from '@/lib/configurador/state';

interface Props {
  state: WizardState;
}

export default function StepCierre({ state }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#e5e1d8] p-8 text-center">
      <div className="text-6xl mb-4">✨</div>
      <h2 className="text-3xl font-semibold text-[#1a1917] mb-3">¡Gracias, {state.cliente.nombre}!</h2>
      <p className="text-[#7a756f] mb-6">
        Hemos recibido tu solicitud. Un técnico te contactará en las próximas 24-48h para concertar
        la visita gratuita.
      </p>

      <div className="bg-[#faf9f6] rounded-lg p-4 mb-6 text-left text-sm">
        <div className="font-semibold text-[#1a1917] mb-2">Resumen de tu solicitud</div>
        <div className="text-[#7a756f]">Modelo: {state.productoId}</div>
        <div className="text-[#7a756f]">
          Medidas: {state.linea}×{state.salida} cm
        </div>
        <div className="text-[#7a756f]">Localidad: {state.cliente.localidad}</div>
      </div>

      <a
        href="/"
        className="inline-block bg-[#d4a034] text-[#0d0c0b] rounded-lg px-6 py-3 font-medium hover:bg-[#e8b442] transition"
      >
        Volver al inicio
      </a>
    </div>
  );
}
