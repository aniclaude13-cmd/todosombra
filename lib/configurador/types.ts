// Tipos del catálogo AWMA y del estado del configurador.

export interface ColorGrupoEntry {
  nombre: string;
  incluido?: boolean;
  incremento_pct?: number;
  minimo_eur?: number;
}

export interface GrupoColor {
  nombre: string;
  colores: ColorGrupoEntry[];
}

export interface GrupoMotor {
  nombre: string;
  motores_somfy: string[];
}

export interface ProductoCatalogo {
  id: string;
  nombre: string;
  pagina?: number;
  tipo: string;
  subtipo?: string | null;
  precio_base?: number | null;
  precios_por_ancho?: Record<string, unknown>;
  sobreprecios?: unknown[];
  observaciones?: string;
  linea?: string | number;
  salida?: string | number;
  linea_min?: number | null;
  linea_max?: number | null;
  salida_min?: number | null;
  salida_max?: number | null;
  grupo_color?: string | null;
  motorizable?: boolean;
  grupo_motor?: string | null;
}

export interface CatalogoAWMA {
  productos: ProductoCatalogo[];
  metadata: Record<string, unknown>;
  grupos_color: Record<string, GrupoColor>;
  grupos_motor: Record<string, GrupoMotor>;
}

export interface FiltroTipo {
  tipo: string;
  subtipos: string[] | null;
}

export interface ProductoCompatible {
  producto: ProductoCatalogo;
  precio: number;
}

export interface AlternativaModular {
  nModulos: number;
  anchoModulo: number;
  producto: ProductoCatalogo;
  precioUnitario: number;
}

export type VariantePL = "" | "_D" | "_M" | "_DM";

export interface Complemento {
  id: string;
  nombre: string;
  emoji: string;
  conPrecio: boolean;
  linea?: number;
  precio?: number;
  esMandoSomfy?: boolean;
}

export interface LeadDatos {
  nombre: string;
  contacto: string;
  localidad: string;
}
