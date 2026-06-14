'use client';

import { useMemo, useState } from 'react';
import {
  ARES_LINEAS,
  ARES_SALIDAS,
  ARES_RECARGO_MOTOR,
  type AresSalida,
  type AresMotor,
  type AresConfig,
  ARES_LINEA_MIN_POR_SALIDA,
  calcularPrecioAres,
} from '@/lib/tarifa-ares';

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

const ADMIN_KEY = 'todosombra_admin';
const ARES_LINEA_MAX = 1000;

export default function ConfiguradorAres() {
  const [linea, setLinea] = useState<number>(400);
  const [salida, setSalida] = useState<AresSalida>(250);
  const [motor, setMotor] = useState<AresMotor>('rts_40Nm');
  const [montaje, setMontaje] = useState<'frente' | 'techo' | 'pared' | 'entre_paredes'>('frente');
  const [posicion, setPosicion] = useState<'derecha' | 'izquierda'>('derecha');
  const [tipoFijacion, setTipoFijacion] = useState<'normal' | 'anclaje_quimico'>('normal');
  const [iluminacion, setIluminacion] = useState<'ninguna' | 'brazos' | 'cofre' | 'brazos_cofre' | 'preinstalacion'>('ninguna');
  const [tipoLuz, setTipoLuz] = useState<'calida' | 'fria'>('calida');
  const [tejadillo, setTejadillo] = useState<'sin' | 'con'>('sin');
  const [marcaLacado, setMarcaLacado] = useState<'awma' | 'gaviota' | 'llaza' | 'stobag'>('awma');
  const [confeccion, setConfeccion] = useState<'cosido' | 'soldado'>('cosido');
  const [colorRal, setColorRal] = useState('6005');
  const [colorTelaId, setColorTelaId] = useState('verde');
  const [cantidad, setCantidad] = useState(1);

  const [adminMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (window.location.search.includes('admin=1')) {
      localStorage.setItem(ADMIN_KEY, '1');
      return true;
    }
    return localStorage.getItem(ADMIN_KEY) === '1';
  });

  const config: AresConfig = { linea, salida, motor, montaje, colorRal, cantidad };
  const precio = useMemo(() => calcularPrecioAres(config), [linea, salida, motor, cantidad]);

  const lineasSugeridas = ARES_LINEAS.filter((l) => l >= ARES_LINEA_MIN_POR_SALIDA[salida]);
  const lineaMinSugerida = ARES_LINEA_MIN_POR_SALIDA[salida];
  const avisoAcoplado = precio.avisos.find((a) => a.reglaId === 'acoplado');

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="bg-white rounded-xl shadow-sm border border-[#e5e1d8] p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#1a1917]">Toldo cofre ARES</h1>
          <p className="text-sm text-[#7a756f] mt-1">Configura tu toldo a medida</p>
        </div>

        <div className="space-y-5">
          <Field label="Salida (proyección)">
            <select
              className={selectCls}
              value={salida}
              onChange={(e) => {
                const newSalida = Number(e.target.value) as AresSalida;
                setSalida(newSalida);
                if (linea < ARES_LINEA_MIN_POR_SALIDA[newSalida]) {
                  setLinea(ARES_LINEA_MIN_POR_SALIDA[newSalida]);
                }
              }}
            >
              {ARES_SALIDAS.map((s) => (
                <option key={s} value={s}>
                  {s} cm
                </option>
              ))}
            </select>
          </Field>

          <Field label="Línea (ancho)">
            <input
              type="number"
              min={lineaMinSugerida}
              max={ARES_LINEA_MAX}
              step={5}
              value={linea}
              onChange={(e) => setLinea(Math.max(lineaMinSugerida, Math.min(ARES_LINEA_MAX, Number(e.target.value))))}
              list="ares-lineas-sugeridas"
              className={selectCls}
            />
            <datalist id="ares-lineas-sugeridas">
              {lineasSugeridas.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
            <p className="text-xs text-[#a09a94] mt-1">
              Hasta {ARES_LINEAS[ARES_LINEAS.length - 1]} cm en módulo único. Para anchos mayores, se acoplan módulos iguales.
            </p>
          </Field>

          <Field label="Fijación">
            <div className="grid grid-cols-2 gap-2">
              <RadioPill checked={montaje === 'frente'} onClick={() => setMontaje('frente')}>Al frente</RadioPill>
              <RadioPill checked={montaje === 'techo'} onClick={() => setMontaje('techo')}>A techo</RadioPill>
              <RadioPill checked={montaje === 'pared'} onClick={() => setMontaje('pared')}>A pared</RadioPill>
              <RadioPill checked={montaje === 'entre_paredes'} onClick={() => setMontaje('entre_paredes')}>Entre paredes</RadioPill>
            </div>
          </Field>

          <Field label="Tipo de fijación">
            <div className="grid grid-cols-2 gap-2">
              <RadioPill checked={tipoFijacion === 'normal'} onClick={() => setTipoFijacion('normal')}>Normal</RadioPill>
              <RadioPill checked={tipoFijacion === 'anclaje_quimico'} onClick={() => setTipoFijacion('anclaje_quimico')}>Anclaje químico</RadioPill>
            </div>
          </Field>

          <Field label="Posición accionamiento">
            <div className="grid grid-cols-2 gap-2">
              <RadioPill checked={posicion === 'derecha'} onClick={() => setPosicion('derecha')}>👉 Derecha</RadioPill>
              <RadioPill checked={posicion === 'izquierda'} onClick={() => setPosicion('izquierda')}>👈 Izquierda</RadioPill>
            </div>
          </Field>

          <Field label="Motorización">
            <select className={selectCls} value={motor} onChange={(e) => setMotor(e.target.value as AresMotor)}>
              <option value="ninguno">Manual con máquina (sin motor)</option>
              <option value="rts_30Nm">Motor Somfy RTS 30 Nm</option>
              <option value="rts_40Nm">Motor Somfy RTS 40 Nm (recomendado)</option>
              <option value="rts_50Nm">Motor Somfy RTS 50 Nm</option>
              <option value="io_30Nm">Motor Somfy iO 30 Nm</option>
              <option value="io_40Nm">Motor Somfy iO 40 Nm</option>
              <option value="io_50Nm">Motor Somfy iO 50 Nm</option>
            </select>
          </Field>

          <Field label="Marca lacado aluminio">
            <div className="grid grid-cols-4 gap-2">
              {(['awma', 'gaviota', 'llaza', 'stobag'] as const).map((m) => (
                <RadioPill key={m} checked={marcaLacado === m} onClick={() => setMarcaLacado(m)}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </RadioPill>
              ))}
            </div>
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
                    colorRal === c.ral ? 'border-[#d4a034] scale-105' : 'border-[#e5e1d8] hover:border-[#d4a034]/60'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </Field>

          <Field label="Iluminación integrada">
            <select
              className={selectCls}
              value={iluminacion}
              onChange={(e) => setIluminacion(e.target.value as typeof iluminacion)}
            >
              <option value="ninguna">Sin iluminación</option>
              <option value="brazos">Brazos iluminados</option>
              <option value="cofre">Cofre iluminado</option>
              <option value="brazos_cofre">Brazos + Cofre iluminados</option>
              <option value="preinstalacion">Pre-instalación</option>
            </select>
            {iluminacion !== 'ninguna' && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <RadioPill checked={tipoLuz === 'calida'} onClick={() => setTipoLuz('calida')}>🟡 Cálida</RadioPill>
                <RadioPill checked={tipoLuz === 'fria'} onClick={() => setTipoLuz('fria')}>⬜ Fría</RadioPill>
              </div>
            )}
          </Field>

          <Field label="Tejadillo protector">
            <div className="grid grid-cols-2 gap-2">
              <RadioPill checked={tejadillo === 'sin'} onClick={() => setTejadillo('sin')}>Sin tejadillo</RadioPill>
              <RadioPill checked={tejadillo === 'con'} onClick={() => setTejadillo('con')}>Con tejadillo</RadioPill>
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
                    colorTelaId === c.id ? 'border-[#d4a034] scale-105' : 'border-[#e5e1d8] hover:border-[#d4a034]/60'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </Field>

          <Field label="Confección tejido">
            <div className="grid grid-cols-2 gap-2">
              <RadioPill checked={confeccion === 'cosido'} onClick={() => setConfeccion('cosido')}>✂️ Cosido</RadioPill>
              <RadioPill checked={confeccion === 'soldado'} onClick={() => setConfeccion('soldado')}>🔥 Soldado</RadioPill>
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

        <div className="mt-6 pt-6 border-t border-[#e5e1d8]">
          {!precio.valido ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
              {precio.motivoInvalido}
            </div>
          ) : (
            <>
              {avisoAcoplado && (
                <div className="mb-4 bg-[#fdf6e8] border border-[#d4a034]/40 rounded-lg p-3 text-xs text-[#5a4a1f]">
                  <div className="font-medium text-[#1a1917] mb-1">Solución acoplada</div>
                  {avisoAcoplado.mensaje}
                </div>
              )}
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-[#7a756f]">Precio total</span>
                <span className="text-3xl font-semibold text-[#1a1917]">{eur(precio.pvpTotal)}</span>
              </div>
              <p className="text-xs text-[#a09a94] mt-1">IVA incluido · Envío directo desde fábrica · 4 semanas</p>
              {adminMode && (
                <div className="mt-4 bg-stone-50 rounded-lg p-3 text-xs">
                  <div className="font-medium text-stone-700 mb-1">📊 Admin (no visible al cliente)</div>
                  <div className="text-stone-600">PVP unitario: {eur(precio.pvpUnitario)}</div>
                  <div className="text-stone-600">Coste unitario: {eur(precio.costeUnitario)}</div>
                  <div className="text-stone-600 font-medium">Margen total: {eur(precio.pvpTotal - precio.costeTotal)}</div>
                </div>
              )}
              <button
                type="button"
                disabled
                className="mt-4 w-full bg-[#d4a034] text-[#0d0c0b] rounded-lg py-3 font-medium hover:bg-[#e8b442] disabled:opacity-40 disabled:cursor-not-allowed transition"
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
  'w-full bg-[#faf9f6] border border-[#e5e1d8] rounded-lg px-3 py-2 text-sm text-[#1a1917] focus:outline-none focus:ring-2 focus:ring-[#d4a034]/20 focus:border-[#d4a034]/60 transition';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1a1917] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function RadioPill({
  checked,
  onClick,
  children,
}: {
  checked: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
        checked ? 'bg-[#d4a034] text-[#0d0c0b]' : 'bg-[#faf9f6] text-[#1a1917] border border-[#e5e1d8] hover:border-[#d4a034]'
      }`}
    >
      {children}
    </button>
  );
}
