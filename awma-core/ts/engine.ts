// AWMA Core Engine (TypeScript)
// Lee catálogos JSON y calcula presupuesto + validación.
// Espejo del motor Python en ../py/engine.py. Los tests cruzados garantizan paridad.

export type Efecto = 'bloqueo' | 'aviso' | 'refuerzo' | 'snap_dimension';

export interface Rango {
  min?: number;
  max?: number;
  gt?: number;
  lt?: number;
  gte?: number;
  lte?: number;
}

export interface Condicion {
  linea?: Rango;
  salida?: Rango;
  color_no_es?: string[];
  color_es?: string[];
  and?: Condicion[];
  or?: Condicion[];
}

export interface Regla {
  id: string;
  descripcion?: string;
  efecto: Efecto;
  mensaje?: string;
  condicion: Condicion;
}

export interface Sobreprecio {
  ref: string;
  desc: string;
  precio?: number;
  precio_pct?: number;
  obligatorio?: boolean;
  categoria?: string;
}

export interface Variante {
  sufijo: string;
  sku: string;
  desc: string;
  composicion?: {
    palillo?: 'simple' | 'doble';
    motor?: 'manual' | 'incluido';
    especial?: boolean;
    confeccion_avanzada?: boolean;
  };
  requiere_dac?: boolean;
  nota?: string;
}

export interface Motor {
  id: string;
  nombre: string;
  recargo: number;
  familia?: string;
}

export interface Catalogo {
  id: string;
  nombre: string;
  tipo: string;
  version?: string;
  dimensiones: {
    linea: { min: number; max: number; valores: number[] };
    salida: { min: number; max: number; valores: number[] };
  };
  tarifa: {
    matriz: Record<string, Record<string, number | null>>;
    minLineaPorSalida?: Record<string, number>;
  };
  motores?: Motor[];
  sobreprecios?: Sobreprecio[];
  variantes?: Variante[];
  reglas?: Regla[];
  brazos?: Record<string, { nombre: string; saltos_cm: number[] }>;
}

export interface Quote {
  productoId: string;
  linea: number;
  salida: number;
  motorId?: string;
  color?: string;
  sobreprecios?: { ref: string; cantidad: number }[];
  cantidad?: number;
  variante?: string;
}

export interface DesgloseItem {
  concepto: string;
  importe: number;
}

export interface Aviso {
  reglaId: string;
  efecto: Efecto;
  mensaje: string;
}

export interface Resultado {
  valido: boolean;
  productoNombre: string;
  linea: number;
  salida: number;
  pvpBase: number;
  pvpUnitario: number;
  pvpTotal: number;
  desglose: DesgloseItem[];
  bloqueos: Aviso[];
  avisos: Aviso[];
  motivoInvalido?: string;
}

// ---------- Evaluación de condiciones ----------

function evalRango(valor: number, r: Rango): boolean {
  if (r.min !== undefined && valor < r.min) return false;
  if (r.max !== undefined && valor > r.max) return false;
  if (r.gt !== undefined && !(valor > r.gt)) return false;
  if (r.lt !== undefined && !(valor < r.lt)) return false;
  if (r.gte !== undefined && !(valor >= r.gte)) return false;
  if (r.lte !== undefined && !(valor <= r.lte)) return false;
  return true;
}

function normalizarColor(c?: string): string {
  return (c ?? '').trim().toLowerCase();
}

function evalCondicion(cond: Condicion, ctx: { linea: number; salida: number; color: string }): boolean {
  if (cond.and) return cond.and.every((c) => evalCondicion(c, ctx));
  if (cond.or) return cond.or.some((c) => evalCondicion(c, ctx));
  if (cond.linea && !evalRango(ctx.linea, cond.linea)) return false;
  if (cond.salida && !evalRango(ctx.salida, cond.salida)) return false;
  if (cond.color_no_es) {
    if (cond.color_no_es.some((bad) => ctx.color.includes(bad.toLowerCase()))) return false;
  }
  if (cond.color_es) {
    if (!cond.color_es.some((good) => ctx.color.includes(good.toLowerCase()))) return false;
  }
  return true;
}

// ---------- Cálculo ----------

function siguienteLineaTarifada(linea: number, valores: number[]): number | null {
  for (const v of valores) if (linea <= v) return v;
  return null;
}

function resolverVariante(cat: Catalogo, target?: string): { comp: Variante['composicion'] | null; requiereDac: boolean; nota?: string } {
  if (!target) return { comp: null, requiereDac: false };
  const t = target.trim();
  for (const v of cat.variantes ?? []) {
    if (v.sku === t || v.sufijo === t || (cat.id + v.sufijo) === t) {
      return { comp: v.composicion ?? {}, requiereDac: !!v.requiere_dac, nota: v.nota };
    }
  }
  return { comp: null, requiereDac: false };
}

export function calcular(cat: Catalogo, q: Quote): Resultado {
  const cantidad = Math.max(1, (q.cantidad ?? 1) | 0);
  const ctx = { linea: q.linea, salida: q.salida, color: normalizarColor(q.color) };

  const bloqueos: Aviso[] = [];
  const avisos: Aviso[] = [];

  const { comp, requiereDac, nota } = resolverVariante(cat, q.variante);
  if (q.variante && comp == null) {
    bloqueos.push({ reglaId: 'variante_desconocida', efecto: 'bloqueo', mensaje: `Variante '${q.variante}' no existe en ${cat.id}.` });
  } else if (requiereDac) {
    avisos.push({ reglaId: 'variante_dac', efecto: 'aviso', mensaje: nota ?? 'Variante sin tarifa pública: requiere cotización vía DAC/hoja de pedido AWMA.' });
  }

  for (const regla of cat.reglas ?? []) {
    if (!evalCondicion(regla.condicion, ctx)) continue;
    const aviso: Aviso = { reglaId: regla.id, efecto: regla.efecto, mensaje: regla.mensaje ?? regla.descripcion ?? regla.id };
    if (regla.efecto === 'bloqueo') bloqueos.push(aviso);
    else avisos.push(aviso);
  }

  // Snap de dimensiones a la rejilla tarifada
  const lineas = cat.dimensiones.linea.valores;
  const salidas = cat.dimensiones.salida.valores;
  const lineaSnap = lineas.length ? siguienteLineaTarifada(q.linea, lineas) : q.linea;
  const salidaSnap = salidas.length ? siguienteLineaTarifada(q.salida, salidas) : q.salida;

  let pvpBase = 0;
  if (lineaSnap != null && salidaSnap != null) {
    pvpBase = cat.tarifa.matriz[String(lineaSnap)]?.[String(salidaSnap)] ?? 0;
  }

  if (pvpBase === 0 && bloqueos.length === 0) {
    bloqueos.push({
      reglaId: 'sin_tarifa',
      efecto: 'bloqueo',
      mensaje: `Combinación línea ${q.linea} cm × salida ${q.salida} cm no tarifada.`,
    });
  }

  const desglose: DesgloseItem[] = [];
  if (pvpBase > 0) desglose.push({ concepto: `${cat.nombre} ${lineaSnap}×${salidaSnap} cm`, importe: pvpBase });

  let pvpUnitario = pvpBase;
  if (q.motorId && cat.motores) {
    const motor = cat.motores.find((m) => m.id === q.motorId);
    if (motor && motor.recargo > 0) {
      pvpUnitario += motor.recargo;
      desglose.push({ concepto: `Motorización (${motor.nombre})`, importe: motor.recargo });
    }
  }

  const sobrepreciosAplicar = [...(q.sobreprecios ?? [])];
  if (comp?.palillo === 'doble' && !sobrepreciosAplicar.some((sp) => sp.ref === 'PALILLO_DOBLE')) {
    sobrepreciosAplicar.push({ ref: 'PALILLO_DOBLE', cantidad: 1 });
  }

  if (sobrepreciosAplicar.length && cat.sobreprecios) {
    for (const sp of sobrepreciosAplicar) {
      const item = cat.sobreprecios.find((s) => s.ref === sp.ref);
      if (!item) continue;
      const qty = Math.max(1, (sp.cantidad ?? 1) | 0);
      const total = item.precio_pct != null
        ? pvpBase * (item.precio_pct / 100) * qty
        : (item.precio ?? 0) * qty;
      pvpUnitario += total;
      desglose.push({ concepto: item.desc + (qty > 1 ? ` x${qty}` : ''), importe: Math.round(total * 100) / 100 });
    }
  }

  const valido = bloqueos.length === 0;
  const pvpTotal = pvpUnitario * cantidad;

  return {
    valido,
    productoNombre: cat.nombre,
    linea: q.linea,
    salida: q.salida,
    pvpBase,
    pvpUnitario,
    pvpTotal,
    desglose,
    bloqueos,
    avisos,
    motivoInvalido: valido ? undefined : bloqueos.map((b) => b.mensaje).join(' '),
  };
}

// ---------- Carga de catálogo ----------

export function cargarCatalogo(json: unknown): Catalogo {
  return json as Catalogo;
}
