"""Convierte ficheros .abd (DAC/InGnio de AWMA) a JSON de catálogo awma-core.

Uso:
    python abd_to_json.py <ruta.abd> [--out catalog/auto/]
    python abd_to_json.py --dir /tmp/dac_extract/DAC_24-09-2025 --out catalog/auto/

El .abd es texto ISO-8859-1 con CRLF, secciones tipo INI y bloques
`Variable ... end`. De ahí se extraen:
  - metadatos (articulo, desc, dim1/dim2, tipoacabado, ...)
  - estructura (AltoMin/Max → línea, AnchoMin/Max → salida)
  - variables con enumeraciones (motores, mandos, brazos, manivelas, ...)

La matriz de tarifa NO está en el .abd (viene del PDF). Se deja como {}.
Las reglas duras de marketing (color blanco si línea>X, refuerzo 3 brazos,
...) tampoco están literalmente, se añaden a mano caso por caso.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional


# ---------- Parser .abd ----------

def _read_abd(path: Path) -> str:
    return path.read_bytes().decode("iso-8859-1")


def _parse_kv_line(line: str) -> Optional[tuple[str, str]]:
    m = re.match(r"^\s*([^=]+?)\s*=\s*(.*)$", line)
    if not m:
        return None
    return m.group(1).strip(), m.group(2).rstrip("\r")


def parse_abd(raw: str) -> Dict[str, Any]:
    """Parsea el contenido del .abd a una estructura intermedia rica.

    Devuelve:
        {
          "header": {clave: valor},   # antes de ##Datos_Estructura##
          "estructura": {clave: valor},
          "variables": [
            {"nombre": str, "campos": {...}, "enums": [{...}]}
          ],
        }
    """
    header: Dict[str, str] = {}
    estructura: Dict[str, str] = {}
    variables: List[Dict[str, Any]] = []

    section = "header"
    current_var: Optional[Dict[str, Any]] = None
    montaje_buf: List[str] = []

    for line in raw.splitlines():
        stripped = line.strip()
        if stripped.startswith("##Datos_Estructura##"):
            section = "estructura"
            continue
        if stripped == "Variable":
            current_var = {"nombre": "", "campos": {}, "enums": {}}
            continue
        if stripped == "end" and current_var is not None:
            # Convertir enums dict a lista ordenada
            enums_dict = current_var.pop("enums")
            enum_indices = sorted(enums_dict.keys(), key=int)
            current_var["enums"] = [
                {
                    "indice": int(i),
                    "texto": enums_dict[i].get("texto", "").strip(),
                    "valor": _coerce_int(enums_dict[i].get("valor", "0")),
                    "condicion": enums_dict[i].get("condicion", "").strip(),
                }
                for i in enum_indices
            ]
            variables.append(current_var)
            current_var = None
            continue

        kv = _parse_kv_line(line)
        if not kv:
            continue
        key, value = kv

        if current_var is not None:
            # Detectar enum_N_xxx
            m = re.match(r"^enum_(\d+)_(texto|valor|condicion)$", key)
            if m:
                idx = m.group(1)
                field = m.group(2)
                current_var["enums"].setdefault(idx, {})[field] = value
            else:
                if key == "nombre":
                    current_var["nombre"] = value
                else:
                    current_var["campos"][key] = value
        elif section == "header":
            if key.startswith("deInfoMontaje"):
                montaje_buf.append(value)
            else:
                header[key] = value
        elif section == "estructura":
            estructura[key] = value

    return {"header": header, "estructura": estructura, "variables": variables}


def _coerce_int(s: str) -> int:
    try:
        return int(s.strip())
    except (ValueError, AttributeError):
        return 0


# ---------- Heurísticas de tipo ----------

TIPOS_HEURISTICA = [
    # (regex sobre id+desc UPPER, tipo). Orden importa: lo más específico primero.
    (r"PERGOLA|PMS|PMA", "pergola"),
    (r"CAPOTA|^CAP\dA|^TC\dA|^KIT_|REPOSICION|^REP\d|^HBZIP|REPRC|REPFALDON|REPZIP|"
     r"VP_LONA|^G77RL|^AWMA$|^SBX|CONTROL INTERNO|TEJIDO METREADO|LONA CONFECCIONADA|"
     r"LONA ACRILICA|LONA TEJIDO|ENTRETOLDO|^ET\d|DUOX", "otro"),
    (r"VRD|VS\d|WZ\d|ZS\d|WINZIP|VERTICAL|VENTOSOL|^VD\d|^ST\d|^BST\d|"
     r"SOLTISTORE|CORTINA ENROLLABLE|VERASTOR|RIEL CORTINA|^RC\d|CORTAVIENTOS|PARAVENTO|TENFLAT|^TF\d", "vertical"),
    (r"PAL[A-Z]*\d|PALILLERIA|PALILLER", "palilleria"),
    (r"BOX|COFRE|ONBOX|MICROBOX|SPLENBOX|MATICBOX|STORBOX|COMPLETPRO", "toldo_cofre"),
    (r"ARES|SMART|SUPERSTOR|^STOR|^TBS|^MCK\d|EOS|IRIS|PRT|^ART\d|A1PREMIUM|M1PREMIUM|"
     r"^MB\d|BAJANTE|PUNTORECTO|^PR\d|^PRS\d|PUNTO RECTO|BRAZO|^ARX|^STR\d|VERANDA", "toldo_brazo"),
]


def deducir_tipo(articulo: str, desc: str) -> str:
    s = f"{articulo} {desc}".upper()
    for pattern, tipo in TIPOS_HEURISTICA:
        if re.search(pattern, s):
            return tipo
    return "otro"


# ---------- Extracción de motores / brazos ----------

def _find_var(parsed: Dict[str, Any], nombre: str) -> Optional[Dict[str, Any]]:
    nombre_up = nombre.upper().lstrip("@")
    for v in parsed["variables"]:
        if v["nombre"].upper().lstrip("@") == nombre_up:
            return v
    return None


FAMILIAS_MOTOR = {
    "MOTORSOMFY": "somfy",
    "MOTORCHERUBINI": "cherubini",
    "MOTORGAVIOTA": "gaviota",
    "MOTORAOK": "aok",
    "MOTORPUERTO": "puerto",
}


def extraer_motores(parsed: Dict[str, Any]) -> List[Dict[str, Any]]:
    motores: List[Dict[str, Any]] = []

    # Manivela (manual)
    manivela = _find_var(parsed, "@Manivela")
    if manivela:
        motores.append({"id": "manual", "nombre": "Manivela", "recargo": 0, "familia": "manual"})

    for var_nombre, familia in FAMILIAS_MOTOR.items():
        var = _find_var(parsed, var_nombre)
        if not var:
            continue
        for e in var["enums"]:
            texto = e["texto"]
            if not texto or "NO VALIDO" in texto.upper() or "SIN " in texto.upper():
                continue
            motor_id = _slug(f"{familia}_{texto}")
            motores.append({
                "id": motor_id,
                "nombre": f"{familia.capitalize()} {texto.title()}",
                "recargo": 0,
                "familia": familia,
            })
    return motores


def extraer_brazos(parsed: Dict[str, Any]) -> Dict[str, Any]:
    var = _find_var(parsed, "@TIPOBRAZOS")
    if not var:
        return {}
    brazos: Dict[str, Any] = {}
    for e in var["enums"]:
        texto = e["texto"]
        if not texto or "NO VALIDO" in texto.upper():
            continue
        key = _slug(texto)
        brazos[key] = {"nombre": f"Brazos {texto.title()}", "saltos_cm": []}
    return brazos


def _slug(s: str) -> str:
    s = s.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "_", s)
    return s.strip("_")


# ---------- Generación de JSON de catálogo ----------

def _int_or_none(s: Optional[str]) -> Optional[int]:
    if s is None:
        return None
    try:
        return int(s)
    except (ValueError, TypeError):
        return None


def to_catalog_json(parsed: Dict[str, Any], abd_filename: str, version: str = "2025.09") -> Dict[str, Any]:
    h = parsed["header"]
    e = parsed["estructura"]

    articulo = h.get("articulo", "").strip()
    desc = h.get("desc", "").strip()
    cat_id = _slug(articulo).upper().replace("__", "_") or _slug(Path(abd_filename).stem).upper()

    linea_min = _int_or_none(e.get("AltoMin"))
    linea_max = _int_or_none(e.get("AltoMax"))
    salida_min = _int_or_none(e.get("AnchoMin"))
    salida_max = _int_or_none(e.get("AnchoMax"))

    catalog: Dict[str, Any] = {
        "id": cat_id,
        "nombre": desc or articulo,
        "tipo": deducir_tipo(articulo, desc),
        "version": version,
        "fuente": {"abd": abd_filename},
        "dimensiones": {
            "linea": {
                "min": linea_min if linea_min is not None else 0,
                "max": linea_max if linea_max is not None else 0,
                "valores": [],
            },
            "salida": {
                "min": salida_min if salida_min is not None else 0,
                "max": salida_max if salida_max is not None else 0,
                "valores": [],
            },
        },
        "tarifa": {"matriz": {}},
        "motores": extraer_motores(parsed),
        "reglas": [],
    }

    brazos = extraer_brazos(parsed)
    if brazos:
        catalog["brazos"] = brazos

    # Reglas básicas de bloqueo por dimensiones
    reglas: List[Dict[str, Any]] = []
    if linea_min is not None and linea_min > 0:
        reglas.append({
            "id": "linea_min",
            "descripcion": "Línea mínima del modelo",
            "efecto": "bloqueo",
            "mensaje": f"Línea mínima del {cat_id}: {linea_min} cm.",
            "condicion": {"linea": {"lt": linea_min}},
        })
    if linea_max is not None and linea_max > 0:
        reglas.append({
            "id": "linea_max",
            "descripcion": "Línea máxima del modelo",
            "efecto": "bloqueo",
            "mensaje": f"Línea máxima del {cat_id}: {linea_max} cm.",
            "condicion": {"linea": {"gt": linea_max}},
        })
    if salida_min is not None and salida_min > 0:
        reglas.append({
            "id": "salida_min",
            "descripcion": "Salida mínima del modelo",
            "efecto": "bloqueo",
            "mensaje": f"Salida mínima del {cat_id}: {salida_min} cm.",
            "condicion": {"salida": {"lt": salida_min}},
        })
    if salida_max is not None and salida_max > 0:
        reglas.append({
            "id": "salida_max",
            "descripcion": "Salida máxima del modelo",
            "efecto": "bloqueo",
            "mensaje": f"Salida máxima del {cat_id}: {salida_max} cm.",
            "condicion": {"salida": {"gt": salida_max}},
        })
    catalog["reglas"] = reglas

    return catalog


# ---------- CLI ----------

def procesar_archivo(abd_path: Path, out_dir: Path, version: str) -> Path:
    raw = _read_abd(abd_path)
    parsed = parse_abd(raw)
    catalog = to_catalog_json(parsed, abd_path.name, version=version)
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{catalog['id']}.json"
    out_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2), encoding="utf-8")
    return out_path


def main() -> int:
    p = argparse.ArgumentParser(description="Convierte .abd a JSON awma-core")
    p.add_argument("input", nargs="?", help="Fichero .abd individual")
    p.add_argument("--dir", help="Directorio con .abd (procesa todos)")
    p.add_argument("--out", default="catalog/auto", help="Directorio destino")
    p.add_argument("--version", default="2025.09", help="Versión del catálogo")
    args = p.parse_args()

    out_dir = Path(args.out)
    if not out_dir.is_absolute():
        out_dir = Path(__file__).resolve().parent.parent / args.out

    if args.dir:
        d = Path(args.dir)
        files = sorted(d.glob("*.abd"))
        ok = 0
        fail: List[tuple[str, str]] = []
        for f in files:
            try:
                out = procesar_archivo(f, out_dir, args.version)
                ok += 1
                print(f"  ✓ {f.name} → {out.name}")
            except Exception as exc:  # noqa: BLE001
                fail.append((f.name, str(exc)))
                print(f"  ✗ {f.name}: {exc}")
        print(f"\n{ok}/{len(files)} OK, {len(fail)} fallos")
        return 0 if not fail else 1

    if not args.input:
        p.error("Debes pasar un fichero .abd o usar --dir")

    out = procesar_archivo(Path(args.input), out_dir, args.version)
    print(f"✓ {args.input} → {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
