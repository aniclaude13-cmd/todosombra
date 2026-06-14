import { WizardState, WizardAction } from '@/lib/configurador/state';

interface Props {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
}

const COLORES_RAL = [
  { ral: '9016', nombre: 'Blanco tráfico', hex: '#f1f1ed' },
  { ral: '9006', nombre: 'Aluminio blanco', hex: '#a5a5a5' },
  { ral: '7016', nombre: 'Gris antracita', hex: '#383e42' },
  { ral: '8019', nombre: 'Marrón grisáceo', hex: '#3d3635' },
  { ral: '6005', nombre: 'Verde musgo', hex: '#2c5234' },
  { ral: '9005', nombre: 'Negro', hex: '#0d0d0d' },
  { ral: '8014', nombre: 'Marrón sepia', hex: '#3a2317' },
  { ral: 'OTRO', nombre: 'Otro RAL (sobreprecio)', hex: '#cccccc' },
];

export default function StepColorAluminio({ dispatch }: Props) {
  const handleSeleccionar = (color: string) => {
    dispatch({ type: 'SET_COLOR_ALUMINIO', color });
    dispatch({ type: 'SET_STEP', step: 'motor' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#e5e1d8] p-6">
      <h2 className="text-2xl font-semibold text-[#1a1917] mb-4">Color del aluminio</h2>

      <div className="grid grid-cols-2 gap-3">
        {COLORES_RAL.map((c) => (
          <button
            key={c.ral}
            onClick={() => handleSeleccionar(c.ral)}
            className="p-3 rounded-lg border-2 border-[#e5e1d8] hover:border-[#d4a034] transition text-left"
          >
            <div className="w-full h-12 rounded mb-2" style={{ backgroundColor: c.hex }} />
            <div className="text-sm font-medium text-[#1a1917]">{c.nombre}</div>
            <div className="text-xs text-[#a09a94]">RAL {c.ral}</div>
          </button>
        ))}
      </div>

    </div>
  );
}
