'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  PL_LINEAS,
  PL_SALIDAS,
  type PlLinea,
  type PlSalida,
  type PlModelo,
  type PalileriaConfig,
  calcularPrecioPalilleria,
} from '@/lib/tarifa-palilleria';

const Visor3DPalilleria = dynamic(() => import('./Visor3DPalilleria'), { ssr: false });

const eur = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

const COLORES_RAL = [
  { ral: '9016', nombre: 'Blanco tráfico', hex: '#f1f1ed' },
  { ral: '9006', nombre: 'Aluminio blanco', hex: '#a5a5a5' },
  { ral: '7016', nombre: 'Gris antracita', hex: '#383e42' },
  { ral: '8019', nombre: 'Marrón grisáceo', hex: '#3d3635' },
  { ral: '6005', nombre: 'Verde musgo', hex: '#2c5234' },
];

const COLORES_TELA = [
  { id: 'crema', nombre: 'Crema lisa', hex: '#dcd1b8' },
  { id: 'beige', nombre: 'Beige', hex: '#c2b394' },
  { id: 'arena', nombre: 'Arena rayada', hex: '#d6c5a3' },
  { id: 'gris', nombre: 'Gris perla', hex: '#b0b3b8' },
  { id: 'verde', nombre: 'Verde oliva', hex: '#7d8a5e' },
];

const MODELOS: { id: PlModelo; nombre: string; descripcion: string }[] = [
  { id: 'pl7000', nombre: 'PL7000', descripcion: 'Entre paredes — palillo simple' },
  { id: 'pl7010', nombre: 'PL7010', descripcion: 'Pared portería — palillo simple' },
  { id: 'pl7020', nombre: 'PL7020', descripcion: 'Pared portería + larguero — palillo simple' },
  { id: 'pl7030', nombre: 'PL7030', descripcion: 'Autoportante + larguero — palillo simple' },
];

const ADMIN_KEY = 'todosombra_admin';

export default function ConfiguradorPalilleria() {
  const [modelo, setModelo] = useState<PlModelo>('pl7000');
  const [linea, setLinea] = useState<PlLinea>(400);
  const [salida, setSalida] = useState<PlSalida>(250);
  const [colorRal, setColorRal] = useState('9016');
  const [colorTelaId, setColorTelaId] = useState('crema');
  const [cantidad, setCantidad] = useState(1);

  const [adminMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (window.location.search.includes('admin=1')) {
      localStorage.setItem(ADMIN_KEY, '1');
      return true;
    }
    return localStorage.getItem(ADMIN_KEY) === '1';
  });

  const colorTelaHex = COLORES_TELA.find((t) => t.id === colorTelaId)?.hex ?? '#dcd1b8';
  const colorAluminioHex = COLORES_RAL.find((r) => r.ral === colorRal)?.hex ?? '#f1f1ed';

  const config: PalileriaConfig = { modelo, linea, salida, colorRal, cantidad };
  const precio = useMemo(() => calcularPrecioPalilleria(config), [modelo, linea, salida, cantidad]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 h-full">
      <div className="h-[50vh] lg:h-[calc(100vh-8rem)] min-h-[400px]">
        <Visor3DPalilleria lineaCm={linea} salidaCm={salida} colorTela={colorTelaHex} colorAluminio={colorAluminioHex} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-stone-900">Palillería 80×40</h1>
          <p className="text-sm text-stone-500 mt-1">Configura tu pérgola a medida</p>
        </div>

        <div className="space-y-5">
          <Field label="Modelo">
            <select
              className={selectCls}
              value={modelo}
              onChange={(e) => setModelo(e.target.value as PlModelo)}
            >
              {MODELOS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} — {m.descripcion}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Línea (ancho)">
            <select className={selectCls} value={linea} onChange={(e) => setLinea(Number(e.target.value) as PlLinea)}>
              {PL_LINEAS.map((l) => (
                <option key={l} value={l}>
                  {l} cm
                </option>
              ))}
            </select>
          </Field>

          <Field label="Salida (profundidad)">
            <select className={selectCls} value={salida} onChange={(e) => setSalida(Number(e.target.value) as PlSalida)}>
              {PL_SALIDAS.map((s) => (
                <option key={s} value={s}>
                  {s} cm
                </option>
              ))}
            </select>
          </Field>

          <Field label="Color del aluminio (RAL)">
            <div className="grid grid-cols-5 gap-2">
              {COLORES_RAL.map((c) => (
                <button
                  key={c.ral}
                  type="button"
                  onClick={() => setColorRal(c.ral)}
                  title={`${c.nombre} (RAL ${c.ral})`}
                  className={`aspect-square rounded-lg border-2 transition ${
                    colorRal === c.ral ? 'border-amber-500 scale-105' : 'border-stone-200 hover:border-amber-300'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </Field>

          <Field label="Color de la lona">
            <div className="grid grid-cols-5 gap-2">
              {COLORES_TELA.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColorTelaId(c.id)}
                  title={c.nombre}
                  className={`aspect-square rounded-lg border-2 transition ${
                    colorTelaId === c.id ? 'border-amber-500 scale-105' : 'border-stone-200 hover:border-amber-300'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </Field>

          <Field label="Cantidad">
            <input
              type="number"
              min={1}
              max={20}
              value={cantidad}
              onChange={(e) => setCantidad(Math.max(1, Number(e.target.value)))}
              className={selectCls}
            />
          </Field>
        </div>

        <div className="mt-6 pt-6 border-t border-stone-200">
          {!precio.valido ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
              {precio.motivoInvalido}
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-stone-500">Precio total</span>
                <span className="text-3xl font-semibold text-stone-900">{eur(precio.pvpTotal)}</span>
              </div>
              <p className="text-xs text-stone-400 mt-1">IVA incluido · Envío directo desde fábrica · 4 semanas</p>
              {adminMode && (
                <div className="mt-4 bg-stone-50 rounded-lg p-3 text-xs">
                  <div className="font-medium text-stone-700 mb-1">Admin (no visible al cliente)</div>
                  <div className="text-stone-600">PVP unitario: {eur(precio.pvpUnitario)}</div>
                  <div className="text-stone-600">Coste unitario: {eur(precio.costeUnitario)}</div>
                  <div className="text-stone-600 font-medium">Margen total: {eur(precio.pvpTotal - precio.costeTotal)}</div>
                </div>
              )}
              <button
                type="button"
                disabled
                className="mt-4 w-full bg-amber-500 text-white rounded-lg py-3 font-medium hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Solicitar pedido (próximamente)
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const selectCls =
  'w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-400 transition';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
