import { CATALOGO, calcularPrecioBase } from "./catalogo";
import type { ProductoCatalogo } from "./types";

export interface ComplementoDef {
  id: string;
  productoId: string | null;
  nombre: string;
  emoji: string;
  conPrecio: boolean;
  descripcion?: string;
}

export const COMPLEMENTOS: ComplementoDef[] = [
  {
    id: "led",
    productoId: "ILUMINACIÓN",
    nombre: "Iluminación LED",
    emoji: "💡",
    conPrecio: true,
    descripcion: "Línea LED integrada bajo el toldo.",
  },
  {
    id: "tejadillo",
    productoId: "TJD_TEJADILLO",
    nombre: "Tejadillo (protección)",
    emoji: "🏠",
    conPrecio: true,
    descripcion: "Protege el toldo cuando está cerrado (no aplica a BOX cofre).",
  },
  {
    id: "costadillo",
    productoId: "CSL_COSTADILLO_LATERAL",
    nombre: "Costadillo lateral",
    emoji: "🪟",
    conPrecio: true,
    descripcion: "Cierre lateral para mayor protección.",
  },
  {
    id: "mando_somfy",
    productoId: null,
    nombre: "Mando Somfy Situo 1 io",
    emoji: "🎮",
    conPrecio: true,
    descripcion: "Mando a distancia (precio fijo 68,50 €).",
  },
  {
    id: "sensores",
    productoId: null,
    nombre: "Sensores (viento, lluvia, sol)",
    emoji: "📡",
    conPrecio: false,
    descripcion: "El técnico te asesora según la instalación.",
  },
  {
    id: "tahoma",
    productoId: null,
    nombre: "Box Tahoma (Somfy)",
    emoji: "📱",
    conPrecio: false,
    descripcion: "Control desde el móvil.",
  },
  {
    id: "perfiles",
    productoId: null,
    nombre: "Perfiles y accesorios",
    emoji: "🔩",
    conPrecio: false,
    descripcion: "Perfiles especiales según instalación.",
  },
];

export const MANDO_SOMFY_PRECIO = 68.5;
export const MANDO_SOMFY_LABEL = "Somfy Situo 1 io";

// Devuelve el producto del catálogo asociado al complemento (si tiene precio por tabla).
export function productoComplemento(comp: ComplementoDef): ProductoCatalogo | undefined {
  if (!comp.productoId) return undefined;
  return CATALOGO.productos.find((p) => p.id === comp.productoId);
}

// Calcula precio del complemento por línea (cm). Devuelve null si fuera de tabla.
export function precioComplemento(comp: ComplementoDef, lineaCm: number): number | null {
  if (comp.id === "mando_somfy") return MANDO_SOMFY_PRECIO;
  const p = productoComplemento(comp);
  if (!p) return null;
  return calcularPrecioBase(p, lineaCm, 0);
}
