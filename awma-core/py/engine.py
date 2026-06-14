"""AWMA Core Engine (Python) — espejo del motor TS.

Lee catálogos JSON de awma-core/catalog/ y calcula presupuesto + validación.
Cualquier cambio aquí debe replicarse en ../ts/engine.ts. Los tests cruzados
en ../tests/ garantizan paridad.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional


CATALOG_DIR = Path(__file__).resolve().parent.parent / "catalog"


# ---------- Modelos ----------

@dataclass
class Aviso:
    regla_id: str
    efecto: str  # "bloqueo" | "aviso" | "refuerzo" | "snap_dimension"
    mensaje: str


@dataclass
class DesgloseItem:
    concepto: str
    importe: float


@dataclass
class Resultado:
    valido: bool
    producto_nombre: str
    linea: int
    salida: int
    pvp_base: float
    pvp_unitario: float
    pvp_total: float
    desglose: List[DesgloseItem] = field(default_factory=list)
    bloqueos: List[Aviso] = field(default_factory=list)
    avisos: List[Aviso] = field(default_factory=list)
    motivo_invalido: Optional[str] = None


# ---------- Carga de catálogo ----------

_CACHE: Dict[str, dict] = {}


def cargar_catalogo(producto_id: str) -> dict:
    if producto_id in _CACHE:
        return _CACHE[producto_id]
    ruta = CATALOG_DIR / f"{producto_id}.json"
    if not ruta.exists():
        raise FileNotFoundError(f"Catálogo no encontrado: {ruta}")
    with ruta.open("r", encoding="utf-8") as f:
        _CACHE[producto_id] = json.load(f)
    return _CACHE[producto_id]


def listar_catalogos() -> List[str]:
    return sorted(p.stem for p in CATALOG_DIR.glob("*.json"))


# ---------- Evaluación de condiciones ----------

def _eval_rango(valor: float, r: dict) -> bool:
    if "min" in r and valor < r["min"]:
        return False
    if "max" in r and valor > r["max"]:
        return False
    if "gt" in r and not (valor > r["gt"]):
        return False
    if "lt" in r and not (valor < r["lt"]):
        return False
    if "gte" in r and not (valor >= r["gte"]):
        return False
    if "lte" in r and not (valor <= r["lte"]):
        return False
    return True


def _normalizar_color(c: Optional[str]) -> str:
    return (c or "").strip().lower()


def _eval_cond(cond: dict, ctx: dict) -> bool:
    if "and" in cond:
        return all(_eval_cond(c, ctx) for c in cond["and"])
    if "or" in cond:
        return any(_eval_cond(c, ctx) for c in cond["or"])
    if "linea" in cond and not _eval_rango(ctx["linea"], cond["linea"]):
        return False
    if "salida" in cond and not _eval_rango(ctx["salida"], cond["salida"]):
        return False
    if "color_no_es" in cond:
        if any(bad.lower() in ctx["color"] for bad in cond["color_no_es"]):
            return False
    if "color_es" in cond:
        if not any(good.lower() in ctx["color"] for good in cond["color_es"]):
            return False
    return True


def _siguiente_tarifada(valor: int, valores: List[int]) -> Optional[int]:
    for v in valores:
        if valor <= v:
            return v
    return None


def _buscar_acoplado(objetivo: int, max_val: int, valores: List[int]) -> Optional[tuple]:
    """Cuando la línea pedida excede el máximo del catálogo, busca cuántos módulos
    iguales se necesitan para sumar >= objetivo. Cada módulo debe estar en `valores`
    y no superar `max_val`. Devuelve (n_modulos, ancho_modulo) con el menor N posible,
    o None si no hay combinación viable.
    """
    if objetivo <= max_val or not valores:
        return None
    for n in range(2, 11):
        ancho_min = (objetivo + n - 1) // n  # ceil
        snap = _siguiente_tarifada(ancho_min, valores)
        if snap is not None and snap <= max_val:
            return (n, snap)
    return None


# ---------- API pública ----------

def _resolver_variante(cat: dict, variante: Optional[str]):
    """Resuelve un SKU de variante (p.ej. 'PL7000_D') a sus flags y nota DAC.
    Devuelve (composicion, requiere_dac, nota) o (None, False, None) si no aplica.
    """
    if not variante:
        return None, False, None
    variantes = cat.get("variantes") or []
    base_id = cat["id"]
    target = variante.strip()
    for v in variantes:
        if v["sku"] == target or v["sufijo"] == target or (base_id + v["sufijo"]) == target:
            return v.get("composicion") or {}, bool(v.get("requiere_dac")), v.get("nota")
    return None, False, None


def calcular(
    producto_id: str,
    linea: int,
    salida: int,
    motor_id: Optional[str] = None,
    color: Optional[str] = None,
    sobreprecios: Optional[List[dict]] = None,
    cantidad: int = 1,
    variante: Optional[str] = None,
) -> Resultado:
    cat = cargar_catalogo(producto_id)
    cantidad = max(1, int(cantidad))
    ctx = {"linea": linea, "salida": salida, "color": _normalizar_color(color)}

    bloqueos: List[Aviso] = []
    avisos: List[Aviso] = []

    comp, requiere_dac, nota_dac = _resolver_variante(cat, variante)
    if variante and comp is None:
        bloqueos.append(Aviso(
            regla_id="variante_desconocida",
            efecto="bloqueo",
            mensaje=f"Variante '{variante}' no existe en {cat['id']}.",
        ))
    elif requiere_dac:
        avisos.append(Aviso(
            regla_id="variante_dac",
            efecto="aviso",
            mensaje=nota_dac or "Variante sin tarifa pública: requiere cotización vía DAC/hoja de pedido AWMA.",
        ))

    for regla in cat.get("reglas", []):
        if not _eval_cond(regla["condicion"], ctx):
            continue
        aviso = Aviso(
            regla_id=regla["id"],
            efecto=regla["efecto"],
            mensaje=regla.get("mensaje") or regla.get("descripcion") or regla["id"],
        )
        if regla["efecto"] == "bloqueo":
            bloqueos.append(aviso)
        else:
            avisos.append(aviso)

    lineas = cat["dimensiones"]["linea"].get("valores") or []
    salidas = cat["dimensiones"]["salida"].get("valores") or []
    linea_max = cat["dimensiones"]["linea"].get("max")

    acoplado = None
    if lineas and linea_max is not None and linea > linea_max:
        acoplado = _buscar_acoplado(linea, linea_max, lineas)

    if acoplado:
        n_mod, ancho_mod = acoplado
        linea_snap = ancho_mod
    else:
        linea_snap = _siguiente_tarifada(linea, lineas) if lineas else linea
    salida_snap = _siguiente_tarifada(salida, salidas) if salidas else salida

    factor_acoplado = acoplado[0] if acoplado else 1

    pvp_base = 0.0
    if linea_snap is not None and salida_snap is not None:
        matriz = cat["tarifa"]["matriz"]
        precio = matriz.get(str(linea_snap), {}).get(str(salida_snap))
        if precio is not None:
            pvp_base = float(precio) * factor_acoplado

    if pvp_base == 0.0 and not bloqueos:
        bloqueos.append(
            Aviso(
                regla_id="sin_tarifa",
                efecto="bloqueo",
                mensaje=f"Combinación línea {linea} cm × salida {salida} cm no tarifada.",
            )
        )

    if acoplado and pvp_base > 0:
        n_mod, ancho_mod = acoplado
        avisos.append(Aviso(
            regla_id="acoplado",
            efecto="aviso",
            mensaje=(
                f"Solución acoplada: {n_mod} módulos de {ancho_mod}×{salida_snap} cm "
                f"(total {n_mod * ancho_mod} cm para cubrir {linea} cm pedidos). "
                f"Suma literal de precios; el técnico ajusta postes intermedios e instalación."
            ),
        ))
        # Los bloqueos por "línea > max" se degradan a avisos porque el acoplado los resuelve.
        nuevos_bloqueos = []
        for b in bloqueos:
            if b.regla_id == "linea_max":
                avisos.append(Aviso(regla_id=b.regla_id, efecto="aviso", mensaje=b.mensaje))
            else:
                nuevos_bloqueos.append(b)
        bloqueos = nuevos_bloqueos

    desglose: List[DesgloseItem] = []
    if pvp_base > 0:
        if acoplado:
            n_mod, ancho_mod = acoplado
            desglose.append(DesgloseItem(
                f"{cat['nombre']} {ancho_mod}×{salida_snap} cm × {n_mod} módulos (acoplado)",
                pvp_base,
            ))
        else:
            desglose.append(DesgloseItem(f"{cat['nombre']} {linea_snap}×{salida_snap} cm", pvp_base))

    pvp_unitario = pvp_base

    if motor_id and cat.get("motores"):
        motor = next((m for m in cat["motores"] if m["id"] == motor_id), None)
        if motor and motor["recargo"] > 0:
            recargo_total = float(motor["recargo"]) * factor_acoplado
            pvp_unitario += recargo_total
            etiq_motor = f"Motorización ({motor['nombre']})" + (
                f" x{factor_acoplado} módulos" if factor_acoplado > 1 else ""
            )
            desglose.append(DesgloseItem(etiq_motor, recargo_total))

    sobreprecios_aplicar = list(sobreprecios) if sobreprecios else []
    if comp and comp.get("palillo") == "doble":
        if not any(sp.get("ref") == "PALILLO_DOBLE" for sp in sobreprecios_aplicar):
            sobreprecios_aplicar.append({"ref": "PALILLO_DOBLE", "cantidad": 1})

    if sobreprecios_aplicar and cat.get("sobreprecios"):
        catalogo_sp = {s["ref"]: s for s in cat["sobreprecios"]}
        for sp in sobreprecios_aplicar:
            item = catalogo_sp.get(sp["ref"])
            if not item:
                continue
            qty = max(1, int(sp.get("cantidad", 1)))
            if "precio_pct" in item:
                # pvp_base ya incluye el factor_acoplado, así que el % queda correcto
                total = pvp_base * float(item["precio_pct"]) / 100.0 * qty
            else:
                # precio fijo: aplicar por cada módulo acoplado
                total = float(item["precio"]) * qty * factor_acoplado
            pvp_unitario += total
            etq = item["desc"] + (f" x{qty}" if qty > 1 else "")
            if factor_acoplado > 1 and "precio_pct" not in item:
                etq += f" ({factor_acoplado} módulos)"
            desglose.append(DesgloseItem(etq, round(total, 2)))

    valido = not bloqueos
    pvp_total = pvp_unitario * cantidad

    return Resultado(
        valido=valido,
        producto_nombre=cat["nombre"],
        linea=linea,
        salida=salida,
        pvp_base=pvp_base,
        pvp_unitario=pvp_unitario,
        pvp_total=pvp_total,
        desglose=desglose,
        bloqueos=bloqueos,
        avisos=avisos,
        motivo_invalido=None if valido else " ".join(b.mensaje for b in bloqueos),
    )
