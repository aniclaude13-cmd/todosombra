// Tarifa ARES BOX6100 — wrapper sobre awma-core/engine.
// El motor único vive en awma-core/ts/engine.ts y se alimenta del catálogo JSON
// generado a partir del DAC/InGnio. Bot y web cotizan idéntico.

import { calcular, type Catalogo } from '@/awma-core/ts/engine';
import BOX6100_ARES_JSON from '@/awma-core/catalog/BOX6100_ARES.json';

const CATALOGO = BOX6100_ARES_JSON as unknown as Catalogo;

export const MARGEN_DISTRIBUIDOR = 0.58 as const;

export const ARES_LINEAS = CATALOGO.dimensiones.linea.valores as readonly number[];
export const ARES_SALIDAS = CATALOGO.dimensiones.salida.valores as readonly number[];

export type AresLinea = (typeof ARES_LINEAS)[number];
export type AresSalida = (typeof ARES_SALIDAS)[number];

export const ARES_RECARGO_MOTOR: Record<string, number> = (() => {
  const map: Record<string, number> = { ninguno: 0 };
  for (const m of CATALOGO.motores ?? []) map[m.id] = m.recargo;
  return map;
})();

export type AresMotor = keyof typeof ARES_RECARGO_MOTOR | 'ninguno';

export const ARES_LINEA_MIN_POR_SALIDA: Record<number, number> = (() => {
  const out: Record<number, number> = {};
  const matriz = CATALOGO.tarifa.matriz as Record<string, Record<string, number | null>>;
  for (const salida of ARES_SALIDAS) {
    for (const linea of ARES_LINEAS) {
      const precio = matriz[String(linea)]?.[String(salida)];
      if (precio != null) {
        out[salida] = linea;
        break;
      }
    }
  }
  return out;
})();

export interface AresConfig {
  linea: number;
  salida: AresSalida;
  motor: AresMotor;
  montaje: 'frente' | 'techo' | 'pared' | 'entre_paredes';
  colorRal: string;
  manivelaPosicion?: 'izquierda' | 'derecha';
  manivelaLargoCm?: number;
  cantidad: number;
}

export interface PrecioCalculado {
  pvpUnitario: number;
  pvpTotal: number;
  costeUnitario: number;
  costeTotal: number;
  desglose: { concepto: string; importe: number }[];
  avisos: { reglaId: string; mensaje: string }[];
  lineaSnap: number;
  salidaSnap: number;
  valido: boolean;
  motivoInvalido?: string;
}

export function calcularPrecioAres(c: AresConfig): PrecioCalculado {
  const cantidad = Math.max(1, c.cantidad | 0);
  const r = calcular(CATALOGO, {
    productoId: CATALOGO.id,
    linea: c.linea,
    salida: c.salida,
    motorId: c.motor && c.motor !== 'ninguno' ? c.motor : undefined,
    color: c.colorRal,
    cantidad,
  });

  if (!r.valido) {
    return {
      pvpUnitario: 0,
      pvpTotal: 0,
      costeUnitario: 0,
      costeTotal: 0,
      desglose: [],
      avisos: r.avisos.map((a) => ({ reglaId: a.reglaId, mensaje: a.mensaje })),
      lineaSnap: r.linea,
      salidaSnap: r.salida,
      valido: false,
      motivoInvalido: r.motivoInvalido,
    };
  }

  const costeUnitario = r.pvpUnitario * (1 - MARGEN_DISTRIBUIDOR);
  const costeTotal = costeUnitario * cantidad;

  return {
    pvpUnitario: r.pvpUnitario,
    pvpTotal: r.pvpTotal,
    costeUnitario,
    costeTotal,
    desglose: r.desglose,
    avisos: r.avisos.map((a) => ({ reglaId: a.reglaId, mensaje: a.mensaje })),
    lineaSnap: r.linea,
    salidaSnap: r.salida,
    valido: true,
  };
}
