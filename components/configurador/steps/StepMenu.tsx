import { WizardState, WizardAction } from '@/lib/configurador/state';

interface Props {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
}

export default function StepMenu({ dispatch }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#e5e1d8] p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#1a1917]">TodoSombra</h1>
        <p className="text-[#7a756f] mt-2">Configura tu toldo, pérgola o estructura a medida</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => {
            dispatch({ type: 'SET_RUTA', ruta: 'buscar' });
            dispatch({ type: 'SET_STEP', step: 'buscar' });
          }}
          className="w-full p-4 rounded-lg border-2 border-[#e5e1d8] hover:border-[#d4a034] hover:bg-[#fdf6e8] transition text-left"
        >
          <div className="font-semibold text-[#1a1917]">🔍 Busco modelo exacto</div>
          <div className="text-sm text-[#7a756f] mt-1">Sé qué modelo quiero (ej: ARES, NEXUS)</div>
        </button>

        <button
          onClick={() => {
            dispatch({ type: 'SET_RUTA', ruta: 'tipo' });
            dispatch({ type: 'SET_STEP', step: 'tipo' });
          }}
          className="w-full p-4 rounded-lg border-2 border-[#e5e1d8] hover:border-[#d4a034] hover:bg-[#fdf6e8] transition text-left"
        >
          <div className="font-semibold text-[#1a1917]">💡 Ayúdame a elegir</div>
          <div className="text-sm text-[#7a756f] mt-1">Cuéntame qué necesitas, te sugiero modelos</div>
        </button>

        <button
          onClick={() => {
            dispatch({ type: 'SET_RUTA', ruta: 'complementos' });
            dispatch({ type: 'SET_STEP', step: 'complementos' });
          }}
          className="w-full p-4 rounded-lg border-2 border-[#e5e1d8] hover:border-[#d4a034] hover:bg-[#fdf6e8] transition text-left"
        >
          <div className="font-semibold text-[#1a1917]">🔧 Solo complementos</div>
          <div className="text-sm text-[#7a756f] mt-1">LED, tejadillos, mandos...</div>
        </button>
      </div>
    </div>
  );
}
