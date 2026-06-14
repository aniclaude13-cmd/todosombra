'use client';

import { useEffect, useState } from 'react';
import { WizardState, WizardAction, Step, Ruta } from '@/lib/configurador/state';
import { calcularPrecioProducto } from '@/lib/configurador/catalog';

const FLUJO: Record<Ruta, Step[]> = {
  tipo: ['tipo', 'medidas', 'elegir_modelo', 'variante_pl', 'color_aluminio', 'motor', 'tejido', 'resumen', 'complementos', 'datos_cliente'],
  buscar: ['buscar', 'medidas', 'elegir_modelo', 'variante_pl', 'color_aluminio', 'motor', 'tejido', 'resumen', 'complementos', 'datos_cliente'],
  complementos: ['complementos', 'datos_cliente'],
};

function getProgress(state: WizardState): { current: number; total: number } | null {
  if (!state.ruta) return null;
  const flujo = FLUJO[state.ruta];
  const idx = flujo.indexOf(state.step);
  if (idx < 0) return null;
  return { current: idx + 1, total: flujo.length };
}

function getPrevStep(state: WizardState): Step | null {
  if (!state.ruta) return 'menu';
  const flujo = FLUJO[state.ruta];
  const idx = flujo.indexOf(state.step);
  if (idx <= 0) return 'menu';
  return flujo[idx - 1];
}

const eur = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

interface Props {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
}

export default function WizardHeader({ state, dispatch }: Props) {
  const [precioVivo, setPrecioVivo] = useState<number | null>(null);

  useEffect(() => {
    if (state.productoId && state.linea && state.salida) {
      calcularPrecioProducto(
        state.productoId,
        state.linea,
        state.salida,
        state.motor && state.motor !== 'manual' ? state.motor : undefined,
        state.variantePL || undefined,
      ).then((r) => {
        if (r.valido) setPrecioVivo(r.pvpUnitario);
      });
    } else {
      setPrecioVivo(null);
    }
  }, [state.productoId, state.linea, state.salida, state.motor, state.variantePL]);

  const progress = getProgress(state);
  const prev = getPrevStep(state);
  const pct = progress ? (progress.current / progress.total) * 100 : 0;

  const handleReset = () => {
    if (confirm('¿Empezar de nuevo? Se perderá la configuración actual.')) {
      dispatch({ type: 'RESET' });
    }
  };

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#e5e1d8] -mx-4 mb-4">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => prev && dispatch({ type: 'SET_STEP', step: prev })}
            disabled={!prev}
            className="text-sm text-[#7a756f] hover:text-[#1a1917] transition disabled:opacity-30 flex items-center gap-1"
            aria-label="Atrás"
          >
            <span>←</span>
            <span className="hidden sm:inline">Atrás</span>
          </button>

          {progress && (
            <span className="text-xs text-[#a09a94] whitespace-nowrap hidden sm:block">
              Paso {progress.current} / {progress.total}
            </span>
          )}

          <div className="flex-1" />

          {precioVivo !== null && (
            <div className="text-right">
              <div className="text-[10px] text-[#a09a94] uppercase tracking-wide leading-none">Precio</div>
              <div className="text-sm font-bold text-[#d4a034] leading-tight">{eur(precioVivo)}</div>
            </div>
          )}

          <button
            onClick={handleReset}
            className="text-[#a09a94] hover:text-[#1a1917] transition text-lg leading-none w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#faf9f6]"
            title="Empezar de nuevo"
            aria-label="Empezar de nuevo"
          >
            ↻
          </button>
        </div>

        {progress && (
          <div className="mt-2 h-1 bg-[#e5e1d8] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#d4a034] transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
