import { calcular, type Catalogo } from '@/awma-core/ts/engine';

const CATALOGOS: Record<string, Catalogo> = {};
let CATALOGOS_CARGADOS = false;

async function cargarCatalogos() {
  if (CATALOGOS_CARGADOS) return;

  const listaArchivos = [
    'ART4100', 'ART4110', 'STR1000',
    'AV8400', 'AV8410', 'AV8430', 'AV8500', 'AV8510', 'AV8530',
    'AV8600', 'AV8610', 'AV8630', 'AV8700', 'AV8710', 'AV8730',
    'AV8750', 'AV8770', 'AV8870-1', 'AV8870-2', 'AV8890-1', 'AV8890-2',
    'BOX5200', 'BOX6000', 'BOX6010_INDIE', 'BOX6100', 'BOX6100_ARES',
    'BOX6110', 'BOX6300', 'BOX6400', 'BOX6500', 'BOX7000',
    'BOX8100', 'BOX8110', 'BOX8200', 'BOX8300', 'STR1100',
    'PL7000', 'PL7010', 'PL7020', 'PL7030',
    'PR2000', 'PRS2100', 'PRT2200',
    'PRCS3100', 'PRCT3200',
    'TX7900', 'TX7910', 'TX7930', 'TX7950', 'TX7970',
  ];

  for (const nombre of listaArchivos) {
    try {
      const mod = await import(`@/awma-core/catalog/${nombre}.json`);
      CATALOGOS[nombre] = mod.default as unknown as Catalogo;
    } catch (e) {
      console.warn(`No se pudo cargar catálogo: ${nombre}`);
    }
  }

  CATALOGOS_CARGADOS = true;
}

export async function obtenerCatalogo(id: string): Promise<Catalogo | null> {
  await cargarCatalogos();
  return CATALOGOS[id] || null;
}

export async function buscarProductos(query: string): Promise<Catalogo[]> {
  await cargarCatalogos();
  const q = query.toLowerCase().trim();
  return Object.values(CATALOGOS).filter(
    (cat) =>
      cat.id.toLowerCase().includes(q) ||
      cat.nombre.toLowerCase().includes(q)
  );
}

export async function filtrarPorTipo(
  tipo: string,
  subtipos?: string[] | null
): Promise<Catalogo[]> {
  await cargarCatalogos();
  return Object.values(CATALOGOS).filter((cat) => {
    if (cat.tipo !== tipo) return false;
    if (subtipos && !subtipos.includes(cat.tipo)) return false;
    return true;
  });
}

export interface ProductoCompatible {
  id: string;
  nombre: string;
  precio: number;
}

export async function filtrarPorMedidas(
  tipo: string,
  linea: number,
  salida: number,
  subtipos?: string[] | null
): Promise<ProductoCompatible[]> {
  const catalogs = await filtrarPorTipo(tipo, subtipos);

  const compatibles: ProductoCompatible[] = [];

  for (const cat of catalogs) {
    // Validar que medidas cumplen con rango
    if (
      linea < cat.dimensiones.linea.min ||
      linea > cat.dimensiones.linea.max ||
      salida < cat.dimensiones.salida.min ||
      salida > cat.dimensiones.salida.max
    ) {
      // Intentar acoplado o modulares
      continue;
    }

    // Calcular precio para esta medida
    const resultado = calcular(cat, {
      productoId: cat.id,
      linea,
      salida,
      motorId: undefined,
      cantidad: 1,
    });

    if (resultado.valido) {
      compatibles.push({
        id: cat.id,
        nombre: cat.nombre,
        precio: resultado.pvpUnitario,
      });
    }
  }

  // Ordenar por precio ascendente
  compatibles.sort((a, b) => a.precio - b.precio);

  // Retornar máximo 6 opciones
  return compatibles.slice(0, 6);
}

export async function calcularPrecioProducto(
  productoId: string,
  linea: number,
  salida: number,
  motorId?: string,
  variantePL?: string
): Promise<{
  valido: boolean;
  pvpBase: number;
  pvpUnitario: number;
  desglose: Array<{ concepto: string; importe: number }>;
  avisos: Array<{ reglaId: string; mensaje: string }>;
  motivoInvalido?: string;
}> {
  const cat = await obtenerCatalogo(productoId);
  if (!cat) {
    return {
      valido: false,
      pvpBase: 0,
      pvpUnitario: 0,
      desglose: [],
      avisos: [],
      motivoInvalido: 'Producto no encontrado',
    };
  }

  const resultado = calcular(cat, {
    productoId,
    linea,
    salida,
    motorId,
    variante: variantePL,
    cantidad: 1,
  });

  return {
    valido: resultado.valido,
    pvpBase: resultado.pvpBase,
    pvpUnitario: resultado.pvpUnitario,
    desglose: resultado.desglose,
    avisos: resultado.avisos,
    motivoInvalido: resultado.motivoInvalido,
  };
}
