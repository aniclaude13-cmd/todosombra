import { WizardState, WizardAction } from '@/lib/configurador/state';
import { getTiposProductoOptions } from '@/lib/configurador/tipos-producto';

interface Props {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
}

export default function StepTipo({ state, dispatch }: Props) {
  const tipos = getTiposProductoOptions();

  const handleSeleccionar = (tipo: string, subtipos: string[] | null) => {
    dispatch({ type: 'SET_TIPO_BUSQUEDA', tipo, subtipos });
    dispatch({ type: 'SET_STEP', step: 'medidas' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#e5e1d8] p-6">
      <h2 className="text-2xl font-semibold text-[#1a1917] mb-4">¿Qué necesitas?</h2>

      <div className="space-y-3">
        {tipos.map((tipo) => (
          <button
            key={tipo.label}
            onClick={() => handleSeleccionar(tipo.tipo, tipo.subtipos)}
            className="w-full p-4 rounded-lg border-2 border-[#e5e1d8] hover:border-[#d4a034] hover:bg-[#fdf6e8] transition text-left"
          >
            <div className="font-semibold text-[#1a1917]">{tipo.label}</div>
          </button>
        ))}
      </div>

    </div>
  );
}
