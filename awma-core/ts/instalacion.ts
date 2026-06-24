import RATES from '../catalog/instalacion_rates.json';

type Rates = typeof RATES;
type ServicioId = keyof Rates['servicios'];

export interface InstalacionInput {
  tipoProducto: string;
  motor?: string | null;
  kmDesdeOrigen?: number;
  veleta?: boolean;
}

export interface InstalacionResultado {
  servicio: ServicioId | null;
  precioBase: number;
  suplementos: { concepto: string; importe: number }[];
  precioTotal: number;
  disclaimer: string;
}

export function calcularInstalacion(input: InstalacionInput): InstalacionResultado {
  const conMotor = !!(input.motor && input.motor !== 'ninguno' && input.motor !== 'manual');
  const mapeo = (RATES.mapeoTipoProducto as Record<string, { manual: ServicioId; motor: ServicioId }>)[
    input.tipoProducto
  ];

  const servicio: ServicioId | null = mapeo ? (conMotor ? mapeo.motor : mapeo.manual) : null;
  const precioBase = servicio ? RATES.servicios[servicio] : 0;

  const suplementos: { concepto: string; importe: number }[] = [];

  if (input.veleta) {
    suplementos.push({ concepto: 'Veleta', importe: RATES.servicios.veleta_suplemento });
  }

  if (typeof input.kmDesdeOrigen === 'number' && input.kmDesdeOrigen > RATES.zonaBase.kmIncluidos) {
    const kmExtra = input.kmDesdeOrigen - RATES.zonaBase.kmIncluidos;
    const importe = +(kmExtra * RATES.zonaBase.precioKmExtra).toFixed(2);
    if (importe > 0) {
      suplementos.push({ concepto: `Desplazamiento extra (${kmExtra} km)`, importe });
    }
  }

  const precioTotal = +(precioBase + suplementos.reduce((s, x) => s + x.importe, 0)).toFixed(2);

  return {
    servicio,
    precioBase,
    suplementos,
    precioTotal,
    disclaimer: RATES.disclaimer,
  };
}
