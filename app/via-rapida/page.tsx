'use client';

import { useState } from 'react';
import Link from 'next/link';

const WHATSAPP = 'https://wa.me/34644592007?text=Hola%2C%20quiero%20un%20presupuesto%20r%C3%A1pido';

const TIPOS = [
  { value: 'cofre', label: 'Toldo cofre', emoji: '🏖️' },
  { value: 'pergola', label: 'Pérgola', emoji: '⛱️' },
  { value: 'brazo', label: 'Brazo articulado', emoji: '🌤️' },
  { value: 'vertical', label: 'Cortaviento / Vertical', emoji: '🔲' },
  { value: 'otro', label: 'No lo sé aún', emoji: '❓' },
];

const MEDIDAS = [
  { value: 'pequeno', label: 'Pequeño', sub: 'Hasta 3 metros' },
  { value: 'mediano', label: 'Mediano', sub: '3 a 4,5 metros' },
  { value: 'grande', label: 'Grande', sub: 'Más de 4,5 metros' },
  { value: 'no_se', label: 'No lo sé', sub: 'Os pregunto en la llamada' },
];

type Step = 'tipo' | 'medida' | 'contacto' | 'done';

export default function ViaRapida() {
  const [step, setStep] = useState<Step>('tipo');
  const [tipo, setTipo] = useState('');
  const [medida, setMedida] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [provincia, setProvincia] = useState('');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function enviar() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/lead-express', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, telefono, provincia, tipo, medidaAprox: medida, notas }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Error');
      setStep('done');
    } catch (e) {
      setError('No se pudo enviar. Escríbenos por WhatsApp directamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#1a1917]">
      {/* Nav */}
      <header className="bg-white border-b border-[#e5e1d8]">
        <nav className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg">
            <span className="text-[#d4a034]">Todo</span><span>Sombra</span>
          </Link>
          <Link href="/configurador" className="text-sm text-[#7a756f] hover:text-[#1a1917]">
            Configurador detallado →
          </Link>
        </nav>
      </header>

      <div className="max-w-xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-xs text-[#d4a034] uppercase tracking-widest mb-4 border border-[#d4a034]/30 rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4a034] animate-pulse" />
            Vía rápida
          </div>
          <h1 className="text-3xl font-bold mb-3">Propuesta en 24 horas</h1>
          <p className="text-[#7a756f]">
            3 preguntas rápidas y te llamamos con un presupuesto a medida.
            Sin esperas, sin formularios eternos.
          </p>
        </div>

        {/* Progress */}
        {step !== 'done' && (
          <div className="flex gap-2 mb-8">
            {(['tipo', 'medida', 'contacto'] as const).map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  ['tipo', 'medida', 'contacto'].indexOf(step) >= i
                    ? 'bg-[#d4a034]'
                    : 'bg-[#e5e1d8]'
                }`}
              />
            ))}
          </div>
        )}

        {/* Step 1 — Tipo */}
        {step === 'tipo' && (
          <div>
            <h2 className="text-lg font-semibold mb-5">¿Qué tipo de producto te interesa?</h2>
            <div className="grid grid-cols-1 gap-3">
              {TIPOS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => { setTipo(t.value); setStep('medida'); }}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all hover:border-[#d4a034] ${
                    tipo === t.value ? 'border-[#d4a034] bg-[#d4a034]/5' : 'border-[#e5e1d8] bg-white'
                  }`}
                >
                  <span className="text-2xl">{t.emoji}</span>
                  <span className="font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Medida */}
        {step === 'medida' && (
          <div>
            <h2 className="text-lg font-semibold mb-5">¿Cómo es el espacio que quieres cubrir?</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {MEDIDAS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => { setMedida(m.value); setStep('contacto'); }}
                  className={`flex flex-col p-4 rounded-xl border-2 text-left transition-all hover:border-[#d4a034] ${
                    medida === m.value ? 'border-[#d4a034] bg-[#d4a034]/5' : 'border-[#e5e1d8] bg-white'
                  }`}
                >
                  <span className="font-semibold text-[#1a1917]">{m.label}</span>
                  <span className="text-xs text-[#7a756f] mt-0.5">{m.sub}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setStep('tipo')} className="text-sm text-[#a09a94] hover:text-[#1a1917]">
              ← Cambiar tipo
            </button>
          </div>
        )}

        {/* Step 3 — Contacto */}
        {step === 'contacto' && (
          <div>
            <h2 className="text-lg font-semibold mb-5">¿A quién llamamos?</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1a1917] mb-1.5">Nombre *</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full border border-[#e5e1d8] rounded-lg px-4 py-3 text-[#1a1917] focus:outline-none focus:border-[#d4a034] bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1917] mb-1.5">Teléfono *</label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="+34 600 000 000"
                  className="w-full border border-[#e5e1d8] rounded-lg px-4 py-3 text-[#1a1917] focus:outline-none focus:border-[#d4a034] bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1917] mb-1.5">Provincia *</label>
                <input
                  type="text"
                  value={provincia}
                  onChange={(e) => setProvincia(e.target.value)}
                  placeholder="Ej: Murcia"
                  className="w-full border border-[#e5e1d8] rounded-lg px-4 py-3 text-[#1a1917] focus:outline-none focus:border-[#d4a034] bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1917] mb-1.5">
                  ¿Algo más que debamos saber? <span className="text-[#a09a94] font-normal">(opcional)</span>
                </label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Medidas aproximadas, color deseado, si necesitas instalación..."
                  rows={3}
                  className="w-full border border-[#e5e1d8] rounded-lg px-4 py-3 text-[#1a1917] focus:outline-none focus:border-[#d4a034] bg-white resize-none"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  {error}{' '}
                  <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="underline">
                    WhatsApp
                  </a>
                </div>
              )}

              <button
                onClick={enviar}
                disabled={loading || !nombre || !telefono || !provincia}
                className="w-full bg-[#d4a034] text-[#0d0c0b] font-semibold py-4 rounded-full hover:bg-[#e8b442] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Quiero mi propuesta →'}
              </button>

              <button onClick={() => setStep('medida')} className="block w-full text-center text-sm text-[#a09a94] hover:text-[#1a1917]">
                ← Volver
              </button>
            </div>
          </div>
        )}

        {/* Done */}
        {step === 'done' && (
          <div className="text-center py-8">
            <div className="text-5xl mb-6">☀️</div>
            <h2 className="text-2xl font-bold mb-3">¡Recibido!</h2>
            <p className="text-[#7a756f] mb-8 leading-relaxed">
              Te llamamos en menos de 24 horas con una propuesta a medida.<br />
              Si prefieres hablar ahora, estamos en WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#d4a034] text-[#0d0c0b] font-semibold px-8 py-4 rounded-full hover:bg-[#e8b442] transition"
              >
                Abrir WhatsApp ahora
              </a>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 border border-[#e5e1d8] text-[#1a1917] font-medium px-8 py-4 rounded-full hover:border-[#d4a034] transition"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
