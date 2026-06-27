'use client';

import { useEffect, useState } from 'react';
import { WizardState, WizardAction } from '@/lib/configurador/state';
import { calcularPrecioProducto, calcularInstalacionProducto } from '@/lib/configurador/catalog';
import type { InstalacionResultado } from '@/awma-core/ts/instalacion';
import ProRegistroCTA from '../ProRegistroCTA';

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
  const [instalacion, setInstalacion] = useState<InstalacionResultado | null>(null);

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
      calcularInstalacionProducto(state.productoId, state.motor).then(setInstalacion);
    }
  }, [state.productoId, state.linea, state.salida, state.motor, state.variantePL]);

  if (!precio) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-[#e5e1d8] p-6">
        <p className="text-center text-[#7a756f]">Calculando precio...</p>
      </div>
    );
  }

  const precioInstalacion = state.incluirInstalacion && instalacion ? instalacion.precioTotal : 0;
  const subtotal =
    precio.pvpUnitario + state.complementos.reduce((s, c) => s + (c.precio || 0), 0) + precioInstalacion;
  const iva = subtotal * 0.21;
  const total = subtotal + iva;

  const avisoAcoplado = precio.avisos.find((a) => a.reglaId === 'acoplado');
  const instalacionDisponible = !!instalacion && instalacion.precioBase > 0;

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
        {state.incluirInstalacion && instalacion && (
          <>
            <div className="flex justify-between pt-2 border-t border-[#e5e1d8]">
              <span className="text-[#7a756f]">+ Instalación (orientativa)</span>
              <span className="text-[#1a1917]">{eur(instalacion.precioBase)}</span>
            </div>
            {instalacion.suplementos.map((s, i) => (
              <div key={`sup-${i}`} className="flex justify-between text-xs">
                <span className="text-[#a09a94]">↳ {s.concepto}</span>
                <span className="text-[#7a756f]">{eur(s.importe)}</span>
              </div>
            ))}
          </>
        )}
      </div>

      {instalacionDisponible && (
        <label className="flex items-start gap-3 mb-4 p-3 bg-[#faf9f6] rounded-lg cursor-pointer hover:bg-[#f3efe6] transition">
          <input
            type="checkbox"
            checked={state.incluirInstalacion}
            onChange={(e) => dispatch({ type: 'SET_INSTALACION', incluir: e.target.checked })}
            className="mt-1 accent-[#d4a034]"
          />
          <div className="text-sm">
            <div className="font-medium text-[#1a1917]">Quiero incluir instalación</div>
            <div className="text-xs text-[#7a756f] mt-0.5">
              Precio orientativo: {eur(instalacion!.precioTotal)} · Sujeto a visita técnica gratuita.
            </div>
          </div>
        </label>
      )}

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

        {/* Cetelem */}
        <div className="mt-3 flex items-center justify-between bg-[#f0f4ff] border border-[#c8d4f0] rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="bg-[#003082] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">CETELEM</span>
            <span className="text-xs text-[#1a1917]">Financia en hasta 36 meses</span>
          </div>
          <span className="text-xs font-semibold text-[#003082]">
            Desde {eur(Math.ceil(total / 36))} /mes
          </span>
        </div>

        <p className="text-xs text-[#7a756f] italic mt-3">
          {state.incluirInstalacion
            ? '🔧 La instalación es orientativa; el precio definitivo se confirma tras la visita técnica gratuita.'
            : '🔧 Precio sin instalación. Marca la casilla si quieres que te la incluyamos como orientativa.'}
        </p>
      </div>

      <ProRegistroCTA
        contexto={{
          productoId: state.productoId,
          linea: state.linea,
          salida: state.salida,
          precioPVP: precio.pvpUnitario,
        }}
      />

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
