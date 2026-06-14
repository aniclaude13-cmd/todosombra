'use client';

import { useState } from 'react';
import { WizardState, WizardAction } from '@/lib/configurador/state';

interface Props {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
}

const COMPLEMENTOS_DISPONIBLES = [
  { id: 'led_brazos', nombre: 'LED en brazos', precio: 180 },
  { id: 'led_cofre', nombre: 'LED en cofre', precio: 220 },
  { id: 'tejadillo', nombre: 'Tejadillo protector', precio: 240 },
  { id: 'costadillo', nombre: 'Costadillo lateral', precio: 95 },
  { id: 'mando_situo1', nombre: 'Mando Somfy Situo 1 io', precio: 68.50 },
  { id: 'mando_situo3', nombre: 'Mando Somfy Situo 3 io', precio: 128 },
  { id: 'tahoma', nombre: 'Tahoma box (smart home)', precio: 149 },
  { id: 'sensor_sol_viento', nombre: 'Sensor sol/viento', precio: null },
  { id: 'perfiles_personalizados', nombre: 'Perfiles personalizados', precio: null },
];

const eur = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n);

export default function StepComplementos({ state, dispatch }: Props) {
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    const nuevo = new Set(seleccionados);
    if (nuevo.has(id)) nuevo.delete(id);
    else nuevo.add(id);
    setSeleccionados(nuevo);
  };

  const handleAceptar = () => {
    state.complementos.forEach((_, i) => dispatch({ type: 'REMOVE_COMPLEMENTO', index: 0 }));
    COMPLEMENTOS_DISPONIBLES.forEach((c) => {
      if (seleccionados.has(c.id)) {
        dispatch({
          type: 'ADD_COMPLEMENTO',
          complemento: { nombre: c.nombre, precio: c.precio ?? undefined },
        });
      }
    });
    dispatch({ type: 'SET_STEP', step: state.productoId ? 'resumen' : 'datos_cliente' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#e5e1d8] p-6">
      <h2 className="text-2xl font-semibold text-[#1a1917] mb-4">Complementos</h2>
      <p className="text-sm text-[#7a756f] mb-4">Marca los que necesites. Los marcados con * los confirma el técnico.</p>

      <div className="space-y-2 mb-6">
        {COMPLEMENTOS_DISPONIBLES.map((c) => (
          <button
            key={c.id}
            onClick={() => toggle(c.id)}
            className={`w-full p-3 rounded-lg border-2 transition text-left flex justify-between items-center ${
              seleccionados.has(c.id)
                ? 'border-[#d4a034] bg-[#fdf6e8]'
                : 'border-[#e5e1d8] hover:border-[#d4a034]/60'
            }`}
          >
            <span className="text-[#1a1917]">
              {seleccionados.has(c.id) ? '✓ ' : ''}{c.nombre}
              {c.precio === null && <span className="text-[#a09a94]"> *</span>}
            </span>
            <span className="text-sm font-medium text-[#d4a034]">
              {c.precio === null ? 'A consultar' : `+${eur(c.precio)}`}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={handleAceptar}
        className="w-full bg-[#d4a034] text-[#0d0c0b] rounded-lg py-3 font-medium hover:bg-[#e8b442] transition"
      >
        {state.productoId ? 'Aplicar al presupuesto' : 'Continuar'}
      </button>
    </div>
  );
}
