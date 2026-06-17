'use client';

import { useState } from 'react';
import { WizardState, WizardAction } from '@/lib/configurador/state';
import { buscarProductos, obtenerCatalogo } from '@/lib/configurador/catalog';

interface Props {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
}

export default function StepBuscar({ state, dispatch }: Props) {
  const [resultados, setResultados] = useState<Array<{ id: string; nombre: string }>>([]);

  const handleBuscar = async (query: string) => {
    dispatch({ type: 'SET_PRODUCTO_QUERY', query });
    if (query.length > 1) {
      const prods = await buscarProductos(query);
      setResultados(prods.map((p) => ({ id: p.id, nombre: p.nombre })));
    }
  };

  const handleSeleccionar = async (productoId: string) => {
    dispatch({ type: 'SET_PRODUCTO_ID', id: productoId });
    const cat = await obtenerCatalogo(productoId);
    if (cat) {
      dispatch({ type: 'SET_TIPO_BUSQUEDA', tipo: cat.tipo, subtipos: [cat.tipo] });
    }
    dispatch({ type: 'SET_STEP', step: 'medidas' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#e5e1d8] p-6">
      <h2 className="text-2xl font-semibold text-[#1a1917] mb-4">Busca tu modelo</h2>
      <p className="text-sm text-[#7a756f] mb-4">Ejemplo: ARES, NEXUS, PL7000</p>

      <input
        type="text"
        placeholder="Buscar modelo..."
        value={state.productoSearchQuery}
        onChange={(e) => handleBuscar(e.target.value)}
        className="w-full px-4 py-2 border border-[#e5e1d8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4a034]/20 mb-4"
      />

      {resultados.length > 0 && (
        <div className="space-y-2">
          {resultados.map((prod) => (
            <button
              key={prod.id}
              onClick={() => handleSeleccionar(prod.id)}
              className="w-full p-3 text-left rounded-lg bg-[#faf9f6] hover:bg-[#d4a034]/10 border border-[#e5e1d8] hover:border-[#d4a034] transition"
            >
              <div className="font-medium text-[#1a1917]">{prod.nombre}</div>
              <div className="text-xs text-[#a09a94]">{prod.id}</div>
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
