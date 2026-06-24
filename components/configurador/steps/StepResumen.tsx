'use client';

import { useEffect, useState } from 'react';
import { WizardState, WizardAction } from '@/lib/configurador/state';
import { calcularPrecioProducto } from '@/lib/configurador/catalog';

interface Props {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
}

const eur = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n);

export default function StepResumen({ state, dispatch }: Props) {
  const [precio, setPrecio] = useState<{
    pvpBase: number;
    pvpUnitario: number;
    desglose: Array<{ concepto: string; importe: number }>;
    avisos: Array<{ reglaId: string; mensaje: string }>;
  } | null>(null);

  useEffect(() => {
    if (state.productoId && state.linea && state.salida) {
      calcularPrecioProducto(
        state.productoId,
        state.linea,
        state.salida,
        state.motor && state.motor !== 'manual' ? state.motor : undefined,
        state.variantePL || undefined
      ).then((r) => {
        if (r.valido) {
          setPrecio({
            pvpBase: r.pvpBase,
            pvpUnitario: r.pvpUnitario,
            desglose: r.desglose,
            avisos: r.avisos,
          });
          dispatch({
            type: 'SET_PRECIO',
            precioBase: r.pvpBase,
            precioTotal: r.pvpUnitario,
            desglose: r.desglose,
            avisos: r.avisos,
          });
        }
      });
    }
  }, [state.productoId, state.linea, state.salida, state.motor, state.variantePL]);

  if (!precio) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-[#e5e1d8] p-6">
        <p className="text-center text-[#7a756f]">Calculando precio...</p>
      </div>
    );
  }

  const subtotal = precio.pvpUnitario + state.complementos.reduce((s, c) => s + (c.precio || 0), 0);
  const iva = subtotal * 0.21;
  const total = subtotal + iva;

  const avisoAcoplado = precio.avisos.find((a) => a.reglaId === 'acoplado');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#e5e1d8] p-6">
      <h2 className="text-2xl font-semibold text-[#1a1917] mb-4">Tu presupuesto</h2>

      <div className="bg-[#faf9f6] rounded-lg p-4 mb-4">
        <div className="text-sm text-[#7a756f] mb-1">Modelo</div>
        <div className="font-semibold text-[#1a1917]">{state.productoId}</div>
        <div className="text-sm text-[#7a756f] mt-2">
          {state.linea}×{state.salida} cm · {state.colorAluminio ? `RAL ${state.colorAluminio}` : ''}
          {state.colorTela ? ` · Tejido ${state.colorTela}` : ''}
        </div>
      </div>

      {avisoAcoplado && (
        <div className="mb-4 bg-[#fdf6e8] border border-[#d4a034]/40 rounded-lg p-3 text-xs text-[#5a4a1f]">
          <div className="font-medium text-[#1a1917] mb-1">Solución acoplada</div>
          {avisoAcoplado.mensaje}
        </div>
      )}

      <div className="space-y-2 mb-4 text-sm">
        {precio.desglose.map((item, i) => (
          <div key={i} className="flex justify-between">
            <span className="text-[#7a756f]">{item.concepto}</span>
            <span className="text-[#1a1917]">{eur(item.importe)}</span>
          </div>
        ))}
        {state.complementos.map((comp, i) => (
          <div key={`comp-${i}`} className="flex justify-between">
            <span className="text-[#7a756f]">+ {comp.nombre}</span>
            <span className="text-[#1a1917]">{comp.precio ? eur(comp.precio) : 'A consultar'}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-[#e5e1d8] pt-4 space-y-1 text-sm">
        <div className="flex justify-between text-[#7a756f]">
          <span>Subtotal</span>
          <span>{eur(subtotal)}</span>
        </div>
        <div className="flex justify-between text-[#7a756f]">
          <span>IVA (21%)</span>
          <span>{eur(iva)}</span>
        </div>
        <div className="flex justify-between text-xl font-bold text-[#1a1917] mt-2">
          <span>Total</span>
          <span>{eur(total)}</span>
        </div>
        <p className="text-xs text-[#7a756f] italic mt-3">
          🔧 Precio sin instalación. Si quieres que te lo montemos, lo confirmamos en la visita gratuita.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={() => dispatch({ type: 'SET_STEP', step: 'datos_cliente' })}
          className="w-full bg-[#d4a034] text-[#0d0c0b] rounded-lg py-3 font-semibold hover:bg-[#e8b442] transition shadow-sm shadow-[#d4a034]/20"
        >
          Lo quiero — reservar presupuesto →
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_STEP', step: 'complementos' })}
          className="w-full border border-[#e5e1d8] text-[#1a1917] rounded-lg py-3 font-medium hover:border-[#d4a034] transition"
        >
          + Añadir complementos
        </button>
        <a
          href="https://wa.me/34644592007?text=Hola%2C%20tengo%20dudas%20sobre%20un%20presupuesto"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center text-sm text-[#7a756f] hover:text-[#1a1917] py-2"
        >
          ¿Tienes dudas? Habla con un técnico por WhatsApp
        </a>
      </div>
      <p className="mt-4 text-xs text-[#a09a94] text-center">
        Reservar no compromete a nada — confirmamos por teléfono y, si lo necesitas, hacemos visita técnica antes de fabricar.
      </p>
    </div>
  );
}
