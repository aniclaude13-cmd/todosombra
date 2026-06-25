'use client';

import { useState } from 'react';
import { WizardState, WizardAction } from '@/lib/configurador/state';
import { filtrarPorMedidas } from '@/lib/configurador/catalog';

interface Props {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
  setLoading: (bool: boolean) => void;
}

export default function StepMedidas({ state, dispatch, setLoading }: Props) {
  const [linea, setLinea] = useState<string>(state.linea?.toString() || '400');
  const [salida, setSalida] = useState<string>(state.salida?.toString() || '250');
  const [error, setError] = useState<string | null>(null);

  const handleBuscar = async () => {
    setError(null);
    const lin = parseInt(linea);
    const sal = parseInt(salida);

    if (!lin || !sal) {
      setError('Indica el ancho y la salida en cm.');
      return;
    }
    if (lin < 100 || lin > 1500) {
      setError('El ancho debe estar entre 100 y 1500 cm.');
      return;
    }
    if (sal < 100 || sal > 800) {
      setError('La salida debe estar entre 100 y 800 cm.');
      return;
    }

    setLoading(true);
    dispatch({ type: 'SET_MEDIDAS', linea: lin, salida: sal });

    try {
      if (state.tipoBusqueda) {
        const compatibles = await filtrarPorMedidas(state.tipoBusqueda.tipo, lin, sal, state.tipoBusqueda.subtipos);
        dispatch({ type: 'SET_COMPATIBLES', compatibles });
      }
    } finally {
      setLoading(false);
      dispatch({ type: 'SET_STEP', step: 'elegir_modelo' });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#e5e1d8] p-6">
      <h2 className="text-2xl font-semibold text-[#1a1917] mb-2">¿Qué medidas necesitas?</h2>
      <p className="text-sm text-[#7a756f] mb-6">
        Mide la fachada o el hueco donde va el toldo. Si no estás seguro, deja las que vienen y ajustamos en la visita técnica.
      </p>

      {/* Diagrama */}
      <div className="bg-[#faf9f6] rounded-lg p-4 mb-5 flex items-center justify-center">
        <svg viewBox="0 0 200 130" className="w-44 h-28">
          <rect x="35" y="20" width="130" height="14" fill="#1a1917" rx="2" />
          <polygon points="35,34 165,34 180,90 20,90" fill="#d4a034" fillOpacity="0.85" />
          <line x1="20" y1="100" x2="180" y2="100" stroke="#7a756f" strokeWidth="1" />
          <line x1="20" y1="96" x2="20" y2="104" stroke="#7a756f" strokeWidth="1" />
          <line x1="180" y1="96" x2="180" y2="104" stroke="#7a756f" strokeWidth="1" />
          <text x="100" y="115" textAnchor="middle" fontSize="10" fill="#7a756f">Ancho (línea)</text>
          <line x1="190" y1="34" x2="190" y2="90" stroke="#7a756f" strokeWidth="1" />
          <line x1="186" y1="34" x2="194" y2="34" stroke="#7a756f" strokeWidth="1" />
          <line x1="186" y1="90" x2="194" y2="90" stroke="#7a756f" strokeWidth="1" />
          <text x="195" y="65" fontSize="10" fill="#7a756f">Salida</text>
        </svg>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#1a1917] mb-2">
            Ancho <span className="text-[#a09a94] font-normal">(línea, en cm)</span>
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={linea}
            onChange={(e) => { setLinea(e.target.value); setError(null); }}
            className="w-full px-4 py-2 border border-[#e5e1d8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4a034]/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1a1917] mb-2">
            Salida <span className="text-[#a09a94] font-normal">(profundidad, en cm)</span>
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={salida}
            onChange={(e) => { setSalida(e.target.value); setError(null); }}
            className="w-full px-4 py-2 border border-[#e5e1d8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4a034]/20"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      <button
        onClick={handleBuscar}
        className="mt-6 w-full bg-[#d4a034] text-[#0d0c0b] rounded-lg py-3 font-medium hover:bg-[#e8b442] transition"
      >
        Buscar modelos compatibles →
      </button>
    </div>
  );
}
