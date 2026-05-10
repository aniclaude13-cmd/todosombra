// Tarifa ARES BOX6100 — datos extraídos de la Tarifa AWMA PVP 2026 (pág. 112).
// Precios en EUR. Tabla MÁQUINA (manual). Para motor Somfy se aplica recargo del motor.

export const ARES_LINEAS = [
  179, 204, 237, 262, 288, 321, 346, 375, 400, 425, 450, 475, 500, 525, 550, 575, 600,
] as const;

export const ARES_SALIDAS = [150, 175, 200, 225, 250, 275, 300] as const;

export type AresLinea = (typeof ARES_LINEAS)[number];
export type AresSalida = (typeof ARES_SALIDAS)[number];

// salida → línea mínima válida (con máquina manual). Si línea < mínima, la combinación no es válida.
export const ARES_LINEA_MIN_POR_SALIDA: Record<AresSalida, number> = {
  150: 179,
  175: 204,
  200: 237,
  225: 262,
  250: 288,
  275: 321,
  300: 346,
};

// Tabla de precios PVP en €. null = combinación no válida (línea < mínima para esa salida).
// Filas: línea (en cm). Columnas: salida (en cm). Orden = ARES_LINEAS × ARES_SALIDAS.
export const ARES_TARIFA: Record<AresLinea, Partial<Record<AresSalida, number>>> = {
  179: { 150: 1192 },
  204: { 150: 1250, 175: 1275 },
  237: { 150: 1328, 175: 1354, 200: 1382 },
  262: { 150: 1386, 175: 1413, 200: 1443, 225: 1466 },
  288: { 150: 1447, 175: 1475, 200: 1506, 225: 1531, 250: 1559 },
  321: { 150: 1524, 175: 1554, 200: 1586, 225: 1612, 250: 1642, 275: 1679 },
  346: { 150: 1583, 175: 1614, 200: 1646, 225: 1674, 250: 1704, 275: 1743, 300: 1793 },
  375: { 150: 1650, 175: 1683, 200: 1717, 225: 1746, 250: 1777, 275: 1817, 300: 1868 },
  400: { 150: 1709, 175: 1742, 200: 1778, 225: 1807, 250: 1840, 275: 1881, 300: 1933 },
  425: { 150: 1767, 175: 1802, 200: 1838, 225: 1869, 250: 1903, 275: 1945, 300: 1998 },
  450: { 150: 1826, 175: 1861, 200: 1899, 225: 1931, 250: 1966, 275: 2009, 300: 2064 },
  475: { 150: 1884, 175: 1921, 200: 1960, 225: 1993, 250: 2029, 275: 2073, 300: 2129 },
  500: { 150: 1943, 175: 1981, 200: 2020, 225: 2055, 250: 2092, 275: 2137, 300: 2194 },
  525: { 150: 2001, 175: 2040, 200: 2081, 225: 2116, 250: 2206, 275: 2252, 300: 2310 },
  550: { 150: 2060, 175: 2100, 200: 2142, 225: 2229, 250: 2269, 275: 2316, 300: 2375 },
  575: { 150: 2118, 175: 2159, 200: 2202, 225: 2291, 250: 2331, 275: 2380, 300: 2440 },
  600: { 150: 2177, 175: 2219, 200: 2263, 225: 2353, 250: 2394, 275: 2444, 300: 2505 },
};

export const ARES_RECARGO_MOTOR = {
  ninguno: 0,
  rts_30Nm: 215,
  rts_40Nm: 240,
  rts_50Nm: 295,
  io_30Nm: 320,
  io_40Nm: 345,
  io_50Nm: 400,
} as const;

export type AresMotor = keyof typeof ARES_RECARGO_MOTOR;

export const MARGEN_DISTRIBUIDOR = 0.58 as const;

export interface AresConfig {
  linea: AresLinea;
  salida: AresSalida;
  motor: AresMotor;
  montaje: 'frente' | 'techo';
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
  valido: boolean;
  motivoInvalido?: string;
}

export function calcularPrecioAres(c: AresConfig): PrecioCalculado {
  const tablaLinea = ARES_TARIFA[c.linea];
  const pvpBase = tablaLinea?.[c.salida];
  if (pvpBase == null) {
    return {
      pvpUnitario: 0,
      pvpTotal: 0,
      costeUnitario: 0,
      costeTotal: 0,
      desglose: [],
      valido: false,
      motivoInvalido: `Combinación línea ${c.linea} cm × salida ${c.salida} cm no válida. Para salida ${c.salida} cm, línea mínima ${ARES_LINEA_MIN_POR_SALIDA[c.salida]} cm.`,
    };
  }

  const recargoMotor = ARES_RECARGO_MOTOR[c.motor];
  const pvpUnitario = pvpBase + recargoMotor;
  const cantidad = Math.max(1, c.cantidad | 0);
  const pvpTotal = pvpUnitario * cantidad;
  const costeUnitario = pvpUnitario * (1 - MARGEN_DISTRIBUIDOR);
  const costeTotal = costeUnitario * cantidad;

  const desglose: { concepto: string; importe: number }[] = [
    { concepto: `Toldo ARES ${c.linea}×${c.salida} cm`, importe: pvpBase },
  ];
  if (recargoMotor > 0) desglose.push({ concepto: `Motorización (${c.motor})`, importe: recargoMotor });

  return {
    pvpUnitario,
    pvpTotal,
    costeUnitario,
    costeTotal,
    desglose,
    valido: true,
  };
}
