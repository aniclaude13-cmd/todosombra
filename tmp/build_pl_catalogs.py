#!/usr/bin/env python3
"""Genera catálogos PL en formato motor awma-core desde el PDF de tarifa AWMA 2026.

Salida:
  - awma-core/catalog/PL{7000,7010,7020,7030}.json  (formato motor)
  - awma-core/catalog/prices/PL{7000,7010,7020,7030}.json  (matriz cruda)
"""
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PDF = ROOT / "awma-docs" / "Tarifa-Awma-PVP-2026.pdf"
OUT_ENGINE = ROOT / "awma-core" / "catalog"
OUT_PRICES = ROOT / "awma-core" / "catalog" / "prices"

LINES = [200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700]
SALIDAS_2GUIAS = [150, 175, 200, 225, 250, 275, 300, 325, 350, 375, 400, 425, 450, 475, 500, 525, 550, 575, 600]
SALIDAS_3GUIAS = [625, 650, 675, 700]
SALIDAS_TODAS = SALIDAS_2GUIAS + SALIDAS_3GUIAS

# Motorización Somfy (común a todos los productos AWMA)
MOTORES = [
    {"id": "manual", "nombre": "Manivela", "recargo": 0, "familia": "manual"},
    {"id": "rts_30Nm", "nombre": "Somfy RTS 30Nm", "recargo": 215, "familia": "somfy"},
    {"id": "rts_40Nm", "nombre": "Somfy RTS 40Nm", "recargo": 240, "familia": "somfy"},
    {"id": "rts_50Nm", "nombre": "Somfy RTS 50Nm", "recargo": 295, "familia": "somfy"},
    {"id": "io_30Nm", "nombre": "Somfy iO 30Nm", "recargo": 320, "familia": "somfy"},
    {"id": "io_40Nm", "nombre": "Somfy iO 40Nm", "recargo": 345, "familia": "somfy"},
    {"id": "io_50Nm", "nombre": "Somfy iO 50Nm", "recargo": 400, "familia": "somfy"},
]

# Kits de motorización (pág. 156 de la tarifa)
KITS_MOTORIZACION = [
    {"ref": "KIT-MOT-G5", "desc": "Kit motorización cable hasta 5m (2 guías)", "precio": 531.21, "categoria": "kit_motorizacion"},
    {"ref": "KIT-MOT-G10", "desc": "Kit motorización cable hasta 10m (2 guías)", "precio": 537.76, "categoria": "kit_motorizacion"},
    {"ref": "KIT-MOT-5", "desc": "Kit motorización correa 2 guías hasta 5m", "precio": 1605.20, "categoria": "kit_motorizacion"},
    {"ref": "KIT-MOT-6", "desc": "Kit motorización correa 2 guías hasta 6m", "precio": 1700.30, "categoria": "kit_motorizacion"},
    {"ref": "KIT-MOT-7", "desc": "Kit motorización correa 2 guías hasta 7m", "precio": 1795.40, "categoria": "kit_motorizacion"},
    {"ref": "KIT-MOT1-5", "desc": "Kit motorización correa 3 guías hasta 5m", "precio": 2537.90, "categoria": "kit_motorizacion"},
    {"ref": "KIT-MOT1-6", "desc": "Kit motorización correa 3 guías hasta 6m", "precio": 2669.94, "categoria": "kit_motorizacion"},
    {"ref": "KIT-MOT1-7", "desc": "Kit motorización correa 3 guías hasta 7m", "precio": 2801.98, "categoria": "kit_motorizacion"},
]

MODELS = [
    {
        "id": "PL7000",
        "nombre": "PL7000 Palillería Entre Paredes",
        "page": 151,
        "abd": "PL7000.abd",
        "tipo_instalacion": "entre_paredes",
        "doble_pct": 10,
    },
    {
        "id": "PL7010",
        "nombre": "PL7010 Palillería Pared Portería",
        "page": 151,
        "abd": "PL7010.abd",
        "tipo_instalacion": "pared_porteria",
        "doble_pct": 8,
    },
    {
        "id": "PL7020",
        "nombre": "PL7020 Palillería Pared Portería + Larguero",
        "page": 152,
        "abd": "PL7020.abd",
        "tipo_instalacion": "pared_porteria_larguero",
        "doble_pct": 6,
    },
    {
        "id": "PL7030",
        "nombre": "PL7030 Palillería Autoportante + Larguero",
        "page": 152,
        "abd": "PL7030.abd",
        "tipo_instalacion": "autoportante_larguero",
        "doble_pct": 4,
    },
]


def extract_pdf_text():
    result = subprocess.run(['pdftotext', '-layout', str(PDF), '-'], capture_output=True, text=True)
    return result.stdout.split(chr(12))


def find_model_block(page_text, model_id):
    idx = page_text.find(f"{model_id} |")
    if idx < 0:
        return None
    rest = page_text[idx:]
    next_model = re.search(r'PL7\d{2,3}\s*\|', rest[10:])
    if next_model:
        rest = rest[: 10 + next_model.start()]
    return rest


def parse_matrix(block):
    """Devuelve dict[linea_str][salida_str] = precio (int)."""
    matrix_cm = {}
    for ln in block.splitlines():
        ln_clean = re.sub(r'3\s*GU[ÍI]AS.*$', '', ln, flags=re.IGNORECASE).strip()
        m = re.match(r'\s*(\d{3})\s+((?:\d{3,5}\s+){10}\d{3,5})\s*$', ln_clean)
        if m:
            salida = int(m.group(1))
            prices = [int(x) for x in m.group(2).split()]
            if len(prices) == 11 and 100 <= salida <= 700:
                for linea, precio in zip(LINES, prices):
                    matrix_cm.setdefault(str(linea), {})[str(salida)] = precio
    return {
        k: dict(sorted(v.items(), key=lambda x: int(x[0])))
        for k, v in sorted(matrix_cm.items(), key=lambda x: int(x[0]))
    }


def build_variantes(model):
    """Variantes del DAC. Las composables se calculan desde base + sobreprecios.
    Las 'requiere_dac' no tienen tarifa pública (se cotizan en configurador DAC)."""
    mid = model["id"]
    return [
        {
            "sufijo": "",
            "sku": mid,
            "desc": "Estándar (palillo simple, manual)",
            "composicion": {"palillo": "simple", "motor": "manual"},
            "requiere_dac": False,
        },
        {
            "sufijo": "_D",
            "sku": f"{mid}_D",
            "desc": "Palillo doble",
            "composicion": {"palillo": "doble", "motor": "manual"},
            "requiere_dac": False,
        },
        {
            "sufijo": "_DP",
            "sku": f"{mid}_DP",
            "desc": "Palillo doble (alias _D)",
            "composicion": {"palillo": "doble", "motor": "manual"},
            "requiere_dac": False,
        },
        {
            "sufijo": "_M",
            "sku": f"{mid}_M",
            "desc": "Motorizado (motor incluido)",
            "composicion": {"palillo": "simple", "motor": "incluido"},
            "requiere_dac": False,
        },
        {
            "sufijo": "_DM",
            "sku": f"{mid}_DM",
            "desc": "Palillo doble + motor incluido",
            "composicion": {"palillo": "doble", "motor": "incluido"},
            "requiere_dac": False,
        },
        {
            "sufijo": "CC",
            "sku": f"{mid}CC",
            "desc": "Variante CC (confección tensa/plus onda, faldones dobles)",
            "composicion": {"palillo": "simple", "motor": "manual", "confeccion_avanzada": True},
            "requiere_dac": True,
            "nota": "Sin tarifa pública. Cotizar a mano vía DAC/hoja de pedido AWMA.",
        },
        {
            "sufijo": "ESP",
            "sku": f"{mid}ESP",
            "desc": "Versión especial (dim2=345, configuración guías/patos/etc.)",
            "composicion": {"palillo": "simple", "motor": "manual", "especial": True},
            "requiere_dac": True,
            "nota": "Sin tarifa pública. Medidas/configuración especiales. Cotizar a mano.",
        },
        {
            "sufijo": "P",
            "sku": f"{mid}P",
            "desc": "Variante P (SKU DAC interno)",
            "composicion": {"palillo": "simple", "motor": "manual"},
            "requiere_dac": True,
            "nota": "Sin tarifa pública. Cotizar a mano vía DAC.",
        },
        {
            "sufijo": "_DESP",
            "sku": f"{mid}_DESP",
            "desc": "Palillo doble + especial",
            "composicion": {"palillo": "doble", "motor": "manual", "especial": True},
            "requiere_dac": True,
            "nota": "Sin tarifa pública. Cotizar a mano.",
        },
    ]


def build_engine_catalog(model, matrix_cm):
    sobreprecios = [
        {
            "ref": "PALILLO_DOBLE",
            "desc": f"Palillo doble (+{model['doble_pct']}% sobre tarifa base)",
            "precio_pct": model["doble_pct"],
            "categoria": "palillo",
        },
    ] + KITS_MOTORIZACION

    reglas = [
        {
            "id": "salida_3guias",
            "condicion": {"salida": {"gte": 625}},
            "efecto": "aviso",
            "mensaje": "Salida ≥ 625 cm: el sistema requiere 3 guías (ya incluido en tarifa).",
        },
        {
            "id": "linea_max",
            "condicion": {"linea": {"gt": 700}},
            "efecto": "bloqueo",
            "mensaje": "Línea máxima 700 cm para esta palillería.",
        },
        {
            "id": "salida_max",
            "condicion": {"salida": {"gt": 700}},
            "efecto": "bloqueo",
            "mensaje": "Salida máxima 700 cm para esta palillería.",
        },
        {
            "id": "salida_min",
            "condicion": {"salida": {"lt": 150}},
            "efecto": "bloqueo",
            "mensaje": "Salida mínima 150 cm para esta palillería.",
        },
        {
            "id": "linea_min",
            "condicion": {"linea": {"lt": 200}},
            "efecto": "bloqueo",
            "mensaje": "Línea mínima 200 cm para esta palillería.",
        },
    ]

    return {
        "id": model["id"],
        "nombre": model["nombre"],
        "tipo": "palilleria",
        "version": "2026.1",
        "fuente": {
            "abd": model["abd"],
            "tarifaPdf": "Tarifa-Awma-PVP-2026.pdf",
            "paginaTarifa": model["page"],
        },
        "tipo_instalacion": model["tipo_instalacion"],
        "dimensiones": {
            "linea": {"min": 200, "max": 700, "valores": LINES},
            "salida": {"min": 150, "max": 700, "valores": SALIDAS_TODAS},
        },
        "tarifa": {"matriz": matrix_cm},
        "motores": MOTORES,
        "sobreprecios": sobreprecios,
        "variantes": build_variantes(model),
        "reglas": reglas,
    }


def build_prices_catalog(model, matrix_cm):
    salidas = sorted({int(s) for v in matrix_cm.values() for s in v.keys()})
    return {
        "product": model["id"],
        "currency": "EUR",
        "source": "Tarifa-Awma-PVP-2026.pdf",
        "description": model["nombre"],
        "tipo_instalacion": model["tipo_instalacion"],
        "outputs_cm": salidas,
        "lines_cm": LINES,
        "matrix_cm": matrix_cm,
        "pdf_pages": [model["page"]],
    }


def main():
    pages = extract_pdf_text()
    print(f"📄 PDF: {len(pages)} páginas extraídas")
    for model in MODELS:
        block = find_model_block(pages[model["page"] - 1], model["id"])
        if not block:
            raise RuntimeError(f"No se encontró bloque para {model['id']}")
        matrix_cm = parse_matrix(block)
        n_celdas = sum(len(v) for v in matrix_cm.values())

        engine_cat = build_engine_catalog(model, matrix_cm)
        with (OUT_ENGINE / f"{model['id']}.json").open("w") as f:
            json.dump(engine_cat, f, ensure_ascii=False, indent=2)

        prices_cat = build_prices_catalog(model, matrix_cm)
        with (OUT_PRICES / f"{model['id']}.json").open("w") as f:
            json.dump(prices_cat, f, ensure_ascii=False, indent=2)

        print(f"✅ {model['id']}: {len(matrix_cm)} líneas × {len(engine_cat['dimensiones']['salida']['valores'])} salidas = {n_celdas} celdas")


if __name__ == "__main__":
    main()
