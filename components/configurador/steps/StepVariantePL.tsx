import { WizardState, WizardAction } from '@/lib/configurador/state';

interface Props {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
}

const VARIANTES = [
  { id: '', label: 'Palillo simple', desc: 'Configuración estándar' },
  { id: '_D', label: 'Palillo doble', desc: 'Doble palillería para mayor cobertura' },
  { id: '_M', label: 'Palillo simple + Motor', desc: 'Con motorización' },
  { id: '_DM', label: 'Palillo doble + Motor', desc: 'Doble + motorizado (premium)' },
];

export default function StepVariantePL({ dispatch }: Props) {
  const handleSeleccionar = (variante: string) => {
    dispatch({ type: 'SET_VARIANTE_PL', variante });
    dispatch({ type: 'SET_STEP', step: 'color_aluminio' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#e5e1d8] p-6">
      <h2 className="text-2xl font-semibold text-[#1a1917] mb-4">Variante de palillería</h2>
      <p className="text-sm text-[#7a756f] mb-6">Elige la configuración de palillos</p>

      <div className="space-y-3">
        {VARIANTES.map((v) => (
          <button
            key={v.id}
            onClick={() => handleSeleccionar(v.id)}
            className="w-full p-4 rounded-lg border-2 border-[#e5e1d8] hover:border-[#d4a034] hover:bg-[#fdf6e8] transition text-left"
          >
            <div className="font-semibold text-[#1a1917]">{v.label}</div>
            <div className="text-sm text-[#7a756f] mt-1">{v.desc}</div>
          </button>
        ))}
      </div>

    </div>
  );
}
