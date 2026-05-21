// Sistema universal de tarifas AWMA 2026
// Soporta todos los productos: BOX toldos, PL palillerías, verticales, etc.

export interface ProductoConfig {
  id: string;
  nombre: string;
  tipo: 'toldo' | 'palilleria' | 'vertical' | 'pergola' | 'otro';
  paginaTarifa: number;
  lineaMin: number;
  lineaMax: number;
  salidaMin: number;
  salidaMax: number;
  lineas: number[];
  salidas: number[];
  pricingMatrix: Record<number, Record<number, number | null>>;
  minimoLineaPorSalida: Record<number, number>;
  motoresRecomendados?: Record<string, string>;
  sobreprecios: Sobreprecio[];
}

export interface Sobreprecio {
  ref: string;
  desc: string;
  precio: number;
}

export interface ConfiguracionQuote {
  productoId: string;
  linea: number;
  salida: number;
  motor?: 'ninguno' | 'rts_30Nm' | 'rts_40Nm' | 'rts_50Nm' | string;
  sobreprecios?: { ref: string; cantidad: number }[];
  cantidad?: number;
}

export interface ResultadoQuote {
  valido: boolean;
  productoNombre: string;
  linea: number;
  salida: number;
  precioMaquina: number;
  recargosDetalle: { desc: string; precio: number }[];
  precioFinal: number;
  motivoInvalido?: string;
}

// Base de datos de productos
const PRODUCTOS: Record<string, ProductoConfig> = {
  BOX6100_ARES: {
    id: 'BOX6100_ARES',
    nombre: 'BOX6100 ARES',
    tipo: 'toldo',
    paginaTarifa: 112,
    lineaMin: 179,
    lineaMax: 600,
    salidaMin: 150,
    salidaMax: 300,
    lineas: [179, 204, 237, 262, 288, 321, 346, 375, 400, 425, 450, 475, 500, 525, 550, 575, 600],
    salidas: [150, 175, 200, 225, 250, 275, 300],
    pricingMatrix: {
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
    },
    minimoLineaPorSalida: {
      150: 179,
      175: 204,
      200: 237,
      225: 262,
      250: 288,
      275: 321,
      300: 346,
    },
    motoresRecomendados: {
      '150-175': '30Nw',
      '200-250': '40Nw',
      '275-300': '50Nw',
    },
    sobreprecios: [
      { ref: '80131370', desc: 'Kit Cofre ARES Blanco', precio: 211.02 },
      { ref: '80131388', desc: 'Kit Tapas Plástico Máquina ARES', precio: 71.19 },
      { ref: '80131319', desc: 'Kit Tapas Aluminio Motor ARES', precio: 104.19 },
      { ref: '80131328', desc: 'Kit Tapas Aluminio Máquina ARES', precio: 167.06 },
      { ref: '80080785', desc: 'J. Brazos INV. Premium 1,50', precio: 286.24 },
      { ref: '80080795', desc: 'J. Brazos INV. Premium 1,75', precio: 301.36 },
      { ref: '80080805', desc: 'J. Brazos INV. Premium 2,00', precio: 318.53 },
      { ref: '80080815', desc: 'J. Brazos INV. Premium 2,25', precio: 329.79 },
      { ref: '80080825', desc: 'J. Brazos INV. Premium 2,50', precio: 344.37 },
      { ref: '80080835', desc: 'J. Brazos INV. Premium 2,75', precio: 367.46 },
      { ref: '80080845', desc: 'J. Brazos INV. Premium 3,00', precio: 402.89 },
      { ref: '80130511', desc: 'Soporte Techo ARES/IRIS Blanco', precio: 104.14 },
      { ref: '80130512', desc: 'Soporte Entre Paredes ARES/IRIS', precio: 114.56 },
      { ref: '80130544', desc: 'Soporte Central ARES Blanco', precio: 54.95 },
    ],
  },
};

export function obtenerProducto(productoId: string): ProductoConfig | null {
  return PRODUCTOS[productoId] || null;
}

export function obtenerProductos(): ProductoConfig[] {
  return Object.values(PRODUCTOS);
}

export function calcularQuote(config: ConfiguracionQuote): ResultadoQuote {
  const producto = obtenerProducto(config.productoId);

  if (!producto) {
    return {
      valido: false,
      productoNombre: config.productoId,
      linea: config.linea,
      salida: config.salida,
      precioMaquina: 0,
      recargosDetalle: [],
      precioFinal: 0,
      motivoInvalido: `Producto ${config.productoId} no encontrado en tarifa.`,
    };
  }

  // Validar línea mínima para esta salida
  const lineaMin = producto.minimoLineaPorSalida[config.salida];
  if (!lineaMin || config.linea < lineaMin) {
    return {
      valido: false,
      productoNombre: producto.nombre,
      linea: config.linea,
      salida: config.salida,
      precioMaquina: 0,
      recargosDetalle: [],
      precioFinal: 0,
      motivoInvalido: `Línea mínima para salida ${config.salida}cm es ${lineaMin}cm. Se solicitó ${config.linea}cm.`,
    };
  }

  // Validar salida
  if (config.salida < producto.salidaMin || config.salida > producto.salidaMax) {
    return {
      valido: false,
      productoNombre: producto.nombre,
      linea: config.linea,
      salida: config.salida,
      precioMaquina: 0,
      recargosDetalle: [],
      precioFinal: 0,
      motivoInvalido: `Salida fuera de rango. Mín: ${producto.salidaMin}cm, Máx: ${producto.salidaMax}cm.`,
    };
  }

  // Obtener precio base
  const precioBase = producto.pricingMatrix[config.linea]?.[config.salida];
  if (precioBase == null) {
    return {
      valido: false,
      productoNombre: producto.nombre,
      linea: config.linea,
      salida: config.salida,
      precioMaquina: 0,
      recargosDetalle: [],
      precioFinal: 0,
      motivoInvalido: `Combinación línea ${config.linea}cm × salida ${config.salida}cm no disponible.`,
    };
  }

  // Calcular recargos
  const recargosDetalle: { desc: string; precio: number }[] = [];
  let precioRecargos = 0;

  // Recargo motor si aplica
  const motorRecargos: Record<string, number> = {
    ninguno: 0,
    rts_30Nm: 215,
    rts_40Nm: 240,
    rts_50Nm: 295,
  };

  if (config.motor && motorRecargos[config.motor] != null) {
    const recargo = motorRecargos[config.motor];
    if (recargo > 0) {
      recargosDetalle.push({ desc: `Motor ${config.motor}`, precio: recargo });
      precioRecargos += recargo;
    }
  }

  // Sobreprecios específicos
  if (config.sobreprecios && config.sobreprecios.length > 0) {
    for (const sobreprecio of config.sobreprecios) {
      const item = producto.sobreprecios.find((s) => s.ref === sobreprecio.ref);
      if (item) {
        const total = item.precio * Math.max(1, sobreprecio.cantidad | 0);
        recargosDetalle.push({ desc: item.desc, precio: total });
        precioRecargos += total;
      }
    }
  }

  const precioFinal = precioBase + precioRecargos;

  return {
    valido: true,
    productoNombre: producto.nombre,
    linea: config.linea,
    salida: config.salida,
    precioMaquina: precioBase,
    recargosDetalle,
    precioFinal,
  };
}
