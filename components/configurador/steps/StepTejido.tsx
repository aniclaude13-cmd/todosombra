'use client';

import { useState } from 'react';
import { WizardState, WizardAction } from '@/lib/configurador/state';
import { CATEGORIAS_SAULEDA } from '@/lib/configurador/colores-sauleda';

interface Props {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
}

export default function StepTejido({ dispatch }: Props) {
  const [categoria, setCategoria] = useState<string | null>(null);

  const handleSeleccionarColor = (color: string) => {
    dispatch({ type: 'SET_COLOR_CATEGORIA', categoria: categoria! });
    dispatch({ type: 'SET_COLOR_TELA', color });
    dispatch({ type: 'SET_STEP', step: 'resumen' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#e5e1d8] p-6">
      <h2 className="text-2xl font-semibold text-[#1a1917] mb-4">Color del tejido</h2>
      <p className="text-sm text-[#7a756f] mb-4">Catálogo Sauleda PLAINS (incluido en precio)</p>

      {!categoria ? (
        <div className="space-y-2">
          {Object.keys(CATEGORIAS_SAULEDA).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoria(cat)}
              className="w-full p-3 rounded-lg border-2 border-[#e5e1d8] hover:border-[#d4a034] hover:bg-[#fdf6e8] transition text-left"
            >
              <div className="font-semibold text-[#1a1917]">{cat}</div>
              <div className="text-xs text-[#a09a94] mt-1">
                {CATEGORIAS_SAULEDA[cat as keyof typeof CATEGORIAS_SAULEDA].length} colores
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <div className="text-sm font-medium text-[#1a1917] mb-3">{categoria}</div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {CATEGORIAS_SAULEDA[categoria as keyof typeof CATEGORIAS_SAULEDA].map((color) => (
              <button
                key={color}
                onClick={() => handleSeleccionarColor(color)}
                className="p-2 rounded-lg border border-[#e5e1d8] hover:border-[#d4a034] hover:bg-[#fdf6e8] transition text-sm text-[#1a1917]"
              >
                {color}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCategoria(null)}
            className="text-[#d4a034] text-sm"
          >
            ← Cambiar categoría
          </button>
        </div>
      )}

    </div>
  );
}
