'use client';

import { useState } from 'react';

interface Props {
  contexto?: {
    productoId: string | null;
    linea: number | null;
    salida: number | null;
    precioPVP: number | null;
  };
}

type Estado = 'idle' | 'abierto' | 'enviando' | 'enviado' | 'error';

export default function ProRegistroCTA({ contexto }: Props) {
  const [estado, setEstado] = useState<Estado>('idle');
  const [empresa, setEmpresa] = useState('');
  const [nif, setNif] = useState('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEstado('enviando');
    setErrorMsg('');
    try {
      const res = await fetch('/api/lead-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa, nif, nombre, email, telefono, contexto }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || 'No hemos podido enviar tu registro. Inténtalo de nuevo.');
        setEstado('error');
        return;
      }
      setEstado('enviado');
    } catch {
      setErrorMsg('No hemos podido enviar tu registro. Inténtalo de nuevo.');
      setEstado('error');
    }
  }

  if (estado === 'enviado') {
    return (
      <div className="mt-4 rounded-xl border border-[#d4a034]/40 bg-[#fdf6e8] p-4 text-sm text-[#5a4a1f]">
        <div className="font-semibold text-[#1a1917] mb-1">✓ Registro recibido</div>
        Te contactamos en menos de 24 h laborables para validar la cuenta y activar tus precios profesionales.
      </div>
    );
  }

  if (estado === 'idle') {
    return (
      <button
        type="button"
        onClick={() => setEstado('abierto')}
        className="mt-4 w-full text-left rounded-xl border border-dashed border-[#d4a034]/60 bg-[#fdf6e8]/60 hover:bg-[#fdf6e8] p-4 transition"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest font-semibold text-[#d4a034] mb-1">
              ¿Eres profesional?
            </div>
            <div className="text-sm font-semibold text-[#1a1917]">
              Regístrate y obtén precios pro con descuento
            </div>
            <div className="text-xs text-[#7a756f] mt-1">
              Para tolderos, instaladores, decoradores y arquitectos. Validamos tu cuenta en 24 h.
            </div>
          </div>
          <span className="text-[#d4a034] text-lg shrink-0">→</span>
        </div>
      </button>
    );
  }

  return (
    <form
      onSubmit={enviar}
      className="mt-4 rounded-xl border border-[#d4a034]/40 bg-[#fdf6e8] p-4 space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-widest font-semibold text-[#d4a034]">
            Registro profesional
          </div>
          <div className="text-sm text-[#5a4a1f] mt-1">
            Te contactamos para activar tu cuenta con precios pro.
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEstado('idle')}
          className="text-[#7a756f] text-xs hover:text-[#1a1917]"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          type="text"
          required
          placeholder="Empresa"
          value={empresa}
          onChange={(e) => setEmpresa(e.target.value)}
          className="rounded-lg border border-[#e5e1d8] bg-white px-3 py-2 text-sm focus:border-[#d4a034] focus:outline-none"
        />
        <input
          type="text"
          required
          placeholder="NIF / CIF"
          value={nif}
          onChange={(e) => setNif(e.target.value.toUpperCase())}
          className="rounded-lg border border-[#e5e1d8] bg-white px-3 py-2 text-sm focus:border-[#d4a034] focus:outline-none"
        />
        <input
          type="text"
          placeholder="Tu nombre (opcional)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="rounded-lg border border-[#e5e1d8] bg-white px-3 py-2 text-sm focus:border-[#d4a034] focus:outline-none"
        />
        <input
          type="tel"
          required
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          className="rounded-lg border border-[#e5e1d8] bg-white px-3 py-2 text-sm focus:border-[#d4a034] focus:outline-none"
        />
        <input
          type="email"
          required
          placeholder="Email profesional"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="sm:col-span-2 rounded-lg border border-[#e5e1d8] bg-white px-3 py-2 text-sm focus:border-[#d4a034] focus:outline-none"
        />
      </div>

      {errorMsg && (
        <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={estado === 'enviando'}
        className="w-full bg-[#d4a034] text-[#0d0c0b] rounded-lg py-2.5 text-sm font-semibold hover:bg-[#e8b442] transition disabled:opacity-60"
      >
        {estado === 'enviando' ? 'Enviando…' : 'Enviar registro pro'}
      </button>

      <p className="text-[10px] text-[#7a756f] text-center">
        Validamos tu NIF antes de activar precios pro. Sin compromiso.
      </p>
    </form>
  );
}
