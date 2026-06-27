'use client';

import { useState } from 'react';
import { WizardState, WizardAction } from '@/lib/configurador/state';
import { track } from '@/lib/analytics';

interface Props {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
  setLoading: (bool: boolean) => void;
}

export default function StepDatosCliente({ state, dispatch, setLoading }: Props) {
  const [nombre, setNombre] = useState(state.cliente.nombre || '');
  const [telefono, setTelefono] = useState(state.cliente.telefono || '');
  const [localidad, setLocalidad] = useState(state.cliente.localidad || '');
  const [error, setError] = useState<string | null>(null);

  const handleEnviar = async () => {
    if (!nombre.trim() || !telefono.trim() || !localidad.trim()) {
      setError('Completa todos los campos');
      return;
    }

    setError(null);
    setLoading(true);
    dispatch({ type: 'SET_CLIENTE', cliente: { nombre, telefono, localidad } });

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: { nombre, telefono, localidad },
          productoId: state.productoId,
          linea: state.linea,
          salida: state.salida,
          variantePL: state.variantePL,
          colorAluminio: state.colorAluminio,
          motor: state.motor,
          colorTela: state.colorTela,
          complementos: state.complementos,
          precioTotal: state.precioTotal,
          incluirInstalacion: state.incluirInstalacion,
        }),
      });

      if (!res.ok) throw new Error('Error al enviar');
      track('submit_lead', {
        productoId: state.productoId || '',
        precio: state.precioTotal || 0,
        instalacion: !!state.incluirInstalacion,
      });
      dispatch({ type: 'SET_STEP', step: 'cierre' });
    } catch (e) {
      setError('No se pudo enviar. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#e5e1d8] p-6">
      <h2 className="text-2xl font-semibold text-[#1a1917] mb-2">Tus datos</h2>
      <p className="text-sm text-[#7a756f] mb-6">Para concertar la visita técnica gratuita</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#1a1917] mb-1.5">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            className="w-full px-4 py-2 border border-[#e5e1d8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4a034]/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1a1917] mb-1.5">Teléfono</label>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="600 000 000"
            className="w-full px-4 py-2 border border-[#e5e1d8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4a034]/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1a1917] mb-1.5">Localidad</label>
          <input
            type="text"
            value={localidad}
            onChange={(e) => setLocalidad(e.target.value)}
            placeholder="Ej: Cartagena, San Javier..."
            className="w-full px-4 py-2 border border-[#e5e1d8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4a034]/20"
          />
          <p className="text-xs text-[#a09a94] mt-1">Trabajamos en Mar Menor y costa de Murcia</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-900">
            {error}
          </div>
        )}

        <button
          onClick={handleEnviar}
          className="w-full bg-[#d4a034] text-[#0d0c0b] rounded-lg py-3 font-medium hover:bg-[#e8b442] transition"
        >
          Confirmar visita gratuita
        </button>
      </div>
    </div>
  );
}
