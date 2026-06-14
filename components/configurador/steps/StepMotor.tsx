'use client';

import { useState } from 'react';
import { WizardState, WizardAction } from '@/lib/configurador/state';
import { getMotoresPorMarca, getManualOption } from '@/lib/configurador/motores';

interface Props {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
}

export default function StepMotor({ dispatch }: Props) {
  const [accionamiento, setAccionamiento] = useState<'manual' | 'motor' | null>(null);
  const motores = getMotoresPorMarca('somfy');
  const manual = getManualOption();

  const handleAccionamiento = (acc: 'manual' | 'motor') => {
    setAccionamiento(acc);
    dispatch({ type: 'SET_ACCIONAMIENTO', accionamiento: acc });
    if (acc === 'manual') {
      dispatch({ type: 'SET_MOTOR', motor: 'manual' });
      dispatch({ type: 'SET_STEP', step: 'tejido' });
    } else {
      dispatch({ type: 'SET_MARCA_MOTOR', marca: 'somfy' });
    }
  };

  const handleSeleccionarMotor = (motorId: string) => {
    dispatch({ type: 'SET_MOTOR', motor: motorId });
    dispatch({ type: 'SET_STEP', step: 'tejido' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#e5e1d8] p-6">
      <h2 className="text-2xl font-semibold text-[#1a1917] mb-4">¿Manual o motorizado?</h2>

      {!accionamiento ? (
        <div className="space-y-3">
          <button
            onClick={() => handleAccionamiento('manual')}
            className="w-full p-4 rounded-lg border-2 border-[#e5e1d8] hover:border-[#d4a034] hover:bg-[#fdf6e8] transition text-left"
          >
            <div className="font-semibold text-[#1a1917]">🔧 {manual.nombre}</div>
            <div className="text-sm text-[#7a756f] mt-1">Sin recargo</div>
          </button>
          <button
            onClick={() => handleAccionamiento('motor')}
            className="w-full p-4 rounded-lg border-2 border-[#e5e1d8] hover:border-[#d4a034] hover:bg-[#fdf6e8] transition text-left"
          >
            <div className="font-semibold text-[#1a1917]">⚡ Motor Somfy</div>
            <div className="text-sm text-[#7a756f] mt-1">Comodidad y automatización</div>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-[#7a756f] mb-3">Elige el modelo de motor:</p>
          {motores.map((m) => (
            <button
              key={m.id}
              onClick={() => handleSeleccionarMotor(m.id)}
              className="w-full p-3 rounded-lg border border-[#e5e1d8] hover:border-[#d4a034] hover:bg-[#fdf6e8] transition text-left"
            >
              <div className="font-medium text-[#1a1917]">{m.nombre}</div>
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
