import productosJson from "@/data/awma-products.json";
import type {
  CatalogoAWMA,
  ProductoCatalogo,
  FiltroTipo,
  ProductoCompatible,
  AlternativaModular,
} from "./types";

export const CATALOGO = productosJson as unknown as CatalogoAWMA;

// Subtipos excluidos del filtro automático por medidas.
export const SUBTIPOS_EXCLUIDOS_BUSQUEDA = new Set([
  "complemento",
  "stobag",
  "jardin_dos_aguas",
]);

// Productos excluidos del filtro (se ofrecen como complemento aparte).
export const EXCLUIDOS_BUSQUEDA = new Set(["TJD_TEJADILLO"]);

// Tipos de producto disponibles en el menú "ayúdame a elegir".
export const TIPOS_PRODUCTO: { label: string; emoji: string; filtro: FiltroTipo }[] = [
  {
    label: "Toldo de terraza",
    emoji: "🌅",
    filtro: { tipo: "toldo", subtipos: ["terraza_cofre", "terraza_brazo", "terraza_monoblock"] },
  },
  {
    label: "Toldo de balcón / ventana",
    emoji: "🪟",
    filtro: { tipo: "toldo", subtipos: ["stor_balcon", "punto_recto"] },
  },
  {
    label: "Toldo veranda (techo cristal)",
    emoji: "🏠",
    filtro: { tipo: "toldo", subtipos: ["veranda"] },
  },
  {
    label: "Pérgola bioclimática (lamas)",
    emoji: "🌞",
    filtro: { tipo: "pérgola", subtipos: ["bioclimatica"] },
  },
  {
    label: "Pérgola panel sándwich (techo rígido)",
    emoji: "🏠",
    filtro: { tipo: "pérgola", subtipos: ["panel_sandwich"] },
  },
  {
    label: "Pérgola lona tensada",
    emoji: "🪢",
    filtro: { tipo: "pérgola", subtipos: ["lona_tensada"] },
  },
  {
    label: "Pérgola con tejido",
    emoji: "🎪",
    filtro: { tipo: "pérgola", subtipos: ["tejido"] },
  },
  {
    label: "Toldos verticales",
    emoji: "🌬️",
    filtro: { tipo: "vertical", subtipos: null },
  },
];

function intKeys(d: Record<string, unknown>): number[] {
  return Object.keys(d)
    .filter((k) => /^\d+$/.test(k))
    .map(Number)
    .sort((a, b) => a - b);
}

export function tienePrecio(p: ProductoCatalogo): boolean {
  const pw = p.precios_por_ancho;
  if (!pw) return false;
  if (typeof pw === "object" && "estimado" in pw) return false;
  return true;
}

export function esPalilleria(p: ProductoCatalogo): boolean {
  return (p.id || "").toUpperCase().startsWith("PL");
}

export function rangoLineas(p: ProductoCatalogo): string {
  const pw = p.precios_por_ancho;
  if (!pw || (typeof pw === "object" && "estimado" in pw)) return "consultar";
  const lineas = intKeys(pw as Record<string, unknown>);
  if (lineas.length === 0) return "consultar";
  return `${lineas[0]}–${lineas[lineas.length - 1]} cm`;
}

// Cálculo de precio fallback usando tabla precios_por_ancho.
// Para una línea/salida, encuentra la siguiente tarifada ≥ a la solicitada (snap).
export function calcularPrecioBase(
  p: ProductoCatalogo,
  lineaCm: number,
  salidaCm: number,
): number | null {
  const pw = p.precios_por_ancho;
  if (!pw || (typeof pw === "object" && "estimado" in pw)) return null;

  const pwObj = pw as Record<string, unknown>;
  const lineas = intKeys(pwObj);
  if (lineas.length === 0) return null;

  const lineaSnap = lineas.find((l) => l >= lineaCm);
  if (lineaSnap === undefined) return null;

  const valor = pwObj[String(lineaSnap)];
  if (typeof valor === "number") return valor;

  if (typeof valor !== "object" || valor === null) return null;
  const salidasObj = valor as Record<string, unknown>;
  const salidas = intKeys(salidasObj);
  if (salidas.length === 0) return null;

  const salidaSnap = salidas.find((s) => s >= salidaCm);
  if (salidaSnap === undefined) return null;

  const precio = salidasObj[String(salidaSnap)];
  return typeof precio === "number" ? precio : null;
}

// Aplica incremento por color de aluminio según el grupo del producto.
export function precioConColor(
  precioBase: number,
  grupoColor: string | null | undefined,
  nombreColor: string,
): number {
  if (!grupoColor) return precioBase;
  const g = CATALOGO.grupos_color[grupoColor];
  if (!g) return precioBase;
  for (const c of g.colores) {
    if (nombreColor.toLowerCase().includes(c.nombre.toLowerCase().split(",")[0].trim().toLowerCase())) {
      const pct = c.incremento_pct ?? 0;
      const minimo = c.minimo_eur ?? 0;
      let extra = (precioBase * pct) / 100;
      if (minimo > 0 && minimo > precioBase) {
        extra = Math.max(extra, minimo - precioBase);
      }
      return precioBase + extra;
    }
  }
  return precioBase;
}

// Búsqueda libre por nombre o ID del producto.
export function buscarProductos(query: string): ProductoCatalogo[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const out: ProductoCatalogo[] = [];
  for (const p of CATALOGO.productos) {
    if (["categoría", "material", "accesorio", "sección", "subsección"].includes(p.tipo)) continue;
    if (p.grupo_color == null) continue;
    if (!tienePrecio(p)) continue;
    const nombre = (p.nombre || "").toLowerCase();
    const pid = (p.id || "").toLowerCase();
    if (nombre.includes(q) || pid.includes(q)) {
      out.push(p);
    }
    if (out.length >= 12) break;
  }
  return out;
}

// Filtra productos compatibles con las medidas y tipo/subtipo solicitados.
// Ordena por precio ascendente.
export function filtrarPorTipoYMedidas(
  filtro: FiltroTipo,
  lineaCm: number,
  salidaCm: number,
): ProductoCompatible[] {
  const out: ProductoCompatible[] = [];
  for (const p of CATALOGO.productos) {
    if (p.tipo !== filtro.tipo) continue;
    if (EXCLUIDOS_BUSQUEDA.has(p.id)) continue;
    if (p.subtipo && SUBTIPOS_EXCLUIDOS_BUSQUEDA.has(p.subtipo)) continue;
    if (filtro.subtipos !== null && (!p.subtipo || !filtro.subtipos.includes(p.subtipo))) continue;
    if (p.grupo_color == null) continue;
    if (!tienePrecio(p)) continue;

    const pw = p.precios_por_ancho as Record<string, unknown>;
    const lineas = intKeys(pw);
    if (lineas.length === 0) continue;
    if (lineaCm < lineas[0] || lineaCm > lineas[lineas.length - 1]) continue;

    const lineaSel = lineas.find((l) => l >= lineaCm);
    if (lineaSel === undefined) continue;

    if (p.salida_min != null && salidaCm < p.salida_min) continue;
    if (p.salida_max != null && salidaCm > p.salida_max) continue;

    const valor = pw[String(lineaSel)];
    if (typeof valor === "object" && valor !== null) {
      const salidasObj = valor as Record<string, unknown>;
      const salidas = intKeys(salidasObj);
      if (salidas.length > 0 && !salidas.some((s) => s >= salidaCm)) continue;
    }

    const precio = calcularPrecioBase(p, lineaCm, salidaCm);
    if (precio !== null) {
      out.push({ producto: p, precio });
    }
  }
  out.sort((a, b) => a.precio - b.precio);
  return out;
}

// Cuando la línea solicitada excede el rango, intenta dividirla en N módulos iguales.
export function buscarAlternativaModular(
  filtro: FiltroTipo,
  lineaCm: number,
  salidaCm: number,
  maxModulos = 3,
): AlternativaModular | null {
  for (let n = 2; n <= maxModulos; n++) {
    const ancho = lineaCm % n === 0 ? lineaCm / n : Math.ceil(lineaCm / n);
    if (ancho < 200) continue;
    const compat = filtrarPorTipoYMedidas(filtro, ancho, salidaCm);
    if (compat.length > 0) {
      const { producto, precio } = compat[0];
      return { nModulos: n, anchoModulo: ancho, producto, precioUnitario: precio };
    }
  }
  return null;
}

export function productoPorId(id: string): ProductoCatalogo | undefined {
  return CATALOGO.productos.find((p) => p.id === id);
}

export function filtroParaProducto(p: ProductoCatalogo): FiltroTipo | null {
  if (!p.tipo) return null;
  return { tipo: p.tipo, subtipos: p.subtipo ? [p.subtipo] : null };
}

export function motoresParaGrupo(grupoMotor: string | null | undefined): string[] {
  if (!grupoMotor) return [];
  const g = CATALOGO.grupos_motor[grupoMotor];
  return g?.motores_somfy ?? [];
}

export function tieneCofre(p: ProductoCatalogo): boolean {
  return p.subtipo === "terraza_cofre" || (p.id || "").toUpperCase().startsWith("BOX");
}
