import { calcular, type Catalogo } from '@/awma-core/ts/engine';
import { calcularInstalacion, type InstalacionResultado } from '@/awma-core/ts/instalacion';
import { BAJO_CONSULTA_IDS } from '@/lib/product-details';

import ART4100 from '@/awma-core/catalog/ART4100.json';
import ART4110 from '@/awma-core/catalog/ART4110.json';
import STR1000 from '@/awma-core/catalog/STR1000.json';
import STR1100 from '@/awma-core/catalog/STR1100.json';
import AV8400 from '@/awma-core/catalog/AV8400.json';
import AV8410 from '@/awma-core/catalog/AV8410.json';
import AV8430 from '@/awma-core/catalog/AV8430.json';
import AV8500 from '@/awma-core/catalog/AV8500.json';
import AV8510 from '@/awma-core/catalog/AV8510.json';
import AV8530 from '@/awma-core/catalog/AV8530.json';
import AV8600 from '@/awma-core/catalog/AV8600.json';
import AV8610 from '@/awma-core/catalog/AV8610.json';
import AV8630 from '@/awma-core/catalog/AV8630.json';
import AV8700 from '@/awma-core/catalog/AV8700.json';
import AV8710 from '@/awma-core/catalog/AV8710.json';
import AV8730 from '@/awma-core/catalog/AV8730.json';
import AV8750 from '@/awma-core/catalog/AV8750.json';
import AV8770 from '@/awma-core/catalog/AV8770.json';
import AV8870_1 from '@/awma-core/catalog/AV8870-1.json';
import AV8870_2 from '@/awma-core/catalog/AV8870-2.json';
import AV8890_1 from '@/awma-core/catalog/AV8890-1.json';
import AV8890_2 from '@/awma-core/catalog/AV8890-2.json';
import BOX5200 from '@/awma-core/catalog/BOX5200.json';
import BOX6000 from '@/awma-core/catalog/BOX6000.json';
import BOX6010_INDIE from '@/awma-core/catalog/BOX6010_INDIE.json';
import BOX6100 from '@/awma-core/catalog/BOX6100.json';
import BOX6100_ARES from '@/awma-core/catalog/BOX6100_ARES.json';
import BOX6110 from '@/awma-core/catalog/BOX6110.json';
import BOX6300 from '@/awma-core/catalog/BOX6300.json';
import BOX6400 from '@/awma-core/catalog/BOX6400.json';
import BOX6500 from '@/awma-core/catalog/BOX6500.json';
import BOX7000 from '@/awma-core/catalog/BOX7000.json';
import BOX8100 from '@/awma-core/catalog/BOX8100.json';
import BOX8110 from '@/awma-core/catalog/BOX8110.json';
import BOX8200 from '@/awma-core/catalog/BOX8200.json';
import BOX8300 from '@/awma-core/catalog/BOX8300.json';
import PL7000 from '@/awma-core/catalog/PL7000.json';
import PL7010 from '@/awma-core/catalog/PL7010.json';
import PL7020 from '@/awma-core/catalog/PL7020.json';
import PL7030 from '@/awma-core/catalog/PL7030.json';
import PR2000 from '@/awma-core/catalog/PR2000.json';
import PRS2100 from '@/awma-core/catalog/PRS2100.json';
import PRT2200 from '@/awma-core/catalog/PRT2200.json';
import PRCS3100 from '@/awma-core/catalog/PRCS3100.json';
import PRCT3200 from '@/awma-core/catalog/PRCT3200.json';
import TX7900 from '@/awma-core/catalog/TX7900.json';
import TX7910 from '@/awma-core/catalog/TX7910.json';
import TX7930 from '@/awma-core/catalog/TX7930.json';
import TX7950 from '@/awma-core/catalog/TX7950.json';
import TX7970 from '@/awma-core/catalog/TX7970.json';

const CATALOGOS: Record<string, Catalogo> = {
  ART4100, ART4110, STR1000, STR1100,
  AV8400, AV8410, AV8430, AV8500, AV8510, AV8530,
  AV8600, AV8610, AV8630, AV8700, AV8710, AV8730,
  AV8750, AV8770,
  'AV8870-1': AV8870_1, 'AV8870-2': AV8870_2,
  'AV8890-1': AV8890_1, 'AV8890-2': AV8890_2,
  BOX5200, BOX6000, BOX6010_INDIE, BOX6100, BOX6100_ARES,
  BOX6110, BOX6300, BOX6400, BOX6500, BOX7000,
  BOX8100, BOX8110, BOX8200, BOX8300,
  PL7000, PL7010, PL7020, PL7030,
  PR2000, PRS2100, PRT2200,
  PRCS3100, PRCT3200,
  TX7900, TX7910, TX7930, TX7950, TX7970,
} as unknown as Record<string, Catalogo>;

export async function obtenerCatalogo(id: string): Promise<Catalogo | null> {
  return CATALOGOS[id] || null;
}

export async function buscarProductos(query: string): Promise<Catalogo[]> {
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
    if (BAJO_CONSULTA_IDS.has(cat.id)) continue;
    if (
      linea < cat.dimensiones.linea.min ||
      linea > cat.dimensiones.linea.max ||
      salida < cat.dimensiones.salida.min ||
      salida > cat.dimensiones.salida.max
    ) {
      continue;
    }

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

  compatibles.sort((a, b) => a.precio - b.precio);

  return compatibles.slice(0, 6);
}

export async function calcularInstalacionProducto(
  productoId: string,
  motor?: string | null
): Promise<InstalacionResultado | null> {
  const cat = await obtenerCatalogo(productoId);
  if (!cat) return null;
  return calcularInstalacion({ tipoProducto: cat.tipo, motor });
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
