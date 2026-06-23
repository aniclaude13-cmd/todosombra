'use client';

import { WizardState, WizardAction } from '@/lib/configurador/state';
import { obtenerCatalogo } from '@/lib/configurador/catalog';
import { categorizarPorId } from '@/lib/configurador/productImages';

interface Props {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
  setLoading: (bool: boolean) => void;
}

const eur = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

export default function StepElegirModelo({ state, dispatch, setLoading }: Props) {
  const handleSeleccionar = async (productoId: string) => {
    setLoading(true);
    dispatch({ type: 'SET_PRODUCTO_ID', id: productoId });

    const cat = await obtenerCatalogo(productoId);
    const nextStep = cat?.tipo === 'palilleria' ? 'variante_pl' : 'color_aluminio';

    setLoading(false);
    dispatch({ type: 'SET_STEP', step: nextStep });
  };

  if (state.compatibles.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-[#e5e1d8] p-8 text-center">
        <div className="text-4xl mb-3">🤔</div>
        <h2 className="text-xl font-semibold text-[#1a1917] mb-2">No tenemos un modelo estándar para esas medidas</h2>
        <p className="text-sm text-[#7a756f] mb-6 max-w-md mx-auto">
          Para huecos fuera de tabla solemos componer una solución a medida.
          Si quieres, ajusta las medidas o seguimos por WhatsApp para estudiarlo.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => dispatch({ type: 'SET_STEP', step: 'medidas' })}
            className="bg-[#d4a034] text-[#0d0c0b] rounded-lg px-6 py-2.5 font-medium hover:bg-[#e8b442] transition"
          >
            Ajustar medidas
          </button>
          <a
            href="https://wa.me/34644592007?text=Hola%2C%20necesito%20un%20toldo%20a%20medida%20fuera%20de%20tabla"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-[#e5e1d8] text-[#1a1917] rounded-lg px-6 py-2.5 font-medium hover:border-[#d4a034] transition"
          >
            Hablar por WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#e5e1d8] p-6">
      <h2 className="text-2xl font-semibold text-[#1a1917] mb-1">Elige tu modelo</h2>
      <p className="text-sm text-[#7a756f] mb-5">
        {state.compatibles.length} {state.compatibles.length === 1 ? 'modelo compatible' : 'modelos compatibles'} con
        {' '}<strong>{state.linea}×{state.salida} cm</strong>. Ordenados por precio.
      </p>

      <div className="space-y-3">
        {state.compatibles.map((prod) => {
          const { categoria, icono, imagen } = categorizarPorId(prod.id);
          return (
            <button
              key={prod.id}
              onClick={() => handleSeleccionar(prod.id)}
              className="group w-full p-4 rounded-lg bg-[#faf9f6] hover:bg-white border border-[#e5e1d8] hover:border-[#d4a034] hover:shadow-md transition text-left flex items-center gap-4"
            >
              <div className="w-24 h-16 rounded-lg bg-white border border-[#e5e1d8] flex items-center justify-center shrink-0 overflow-hidden">
                {imagen ? (
                  <img
                    src={imagen}
                    alt={prod.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-2xl">{icono}</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-[#a09a94] font-medium">{categoria}</div>
                <div className="font-semibold text-[#1a1917] truncate">{prod.nombre}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] text-[#a09a94] uppercase tracking-wide">precio</div>
                <div className="text-lg font-bold text-[#d4a034]">{eur(prod.precio)}</div>
              </div>
              <div className="text-[#d4a034] opacity-0 group-hover:opacity-100 transition shrink-0">→</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
