#!/usr/bin/env python3
"""Genera catálogos JSON de TENXO desde matrices parseadas + tejadillo + accesorios."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "awma-core" / "catalog"
TENXO_JSON = Path(__file__).resolve().parent / "tenxo_parsed.json"

# Motores TENXO con cambios en línea específica
MOTORES_TENXO = [
    {"id": "manual", "nombre": "Manivela", "recargo": 0, "familia": "manual"},
    {"id": "rts_30Nm", "nombre": "Somfy RTS 30Nm", "recargo": 215, "familia": "somfy"},
    {"id": "rts_40Nm", "nombre": "Somfy RTS 40Nm", "recargo": 240, "familia": "somfy"},
    {"id": "rts_50Nm", "nombre": "Somfy RTS 50Nm", "recargo": 295, "familia": "somfy"},
    {"id": "io_30Nm", "nombre": "Somfy iO 30Nm", "recargo": 320, "familia": "somfy"},
    {"id": "io_40Nm", "nombre": "Somfy iO 40Nm", "recargo": 345, "familia": "somfy"},
    {"id": "io_50Nm", "nombre": "Somfy iO 50Nm", "recargo": 400, "familia": "somfy"},
]

# Accesorios TENXO
ACCESORIOS_TENXO = [
    {"ref": "120.1.0022", "desc": "Perfil 120x40 400cm Blanco", "precio": 31.50, "categoria": "perfil"},
    {"ref": "120.1.0023", "desc": "Perfil 120x40 500cm Blanco", "precio": 31.51, "categoria": "perfil"},
    {"ref": "120.1.0027", "desc": "Perfil 120x40 600cm Blanco", "precio": 31.50, "categoria": "perfil"},
    {"ref": "120.1.0025", "desc": "Perfil 120x40 700cm Blanco", "precio": 31.50, "categoria": "perfil"},
    {"ref": "120.1.0044", "desc": "Perfil 140x140 400cm Blanco", "precio": 79.74, "categoria": "perfil"},
    {"ref": "120.1.0045", "desc": "Perfil 140x140 500cm Blanco", "precio": 79.74, "categoria": "perfil"},
    {"ref": "120.1.0046", "desc": "Perfil 140x140 600cm Blanco", "precio": 79.74, "categoria": "perfil"},
    {"ref": "120.1.0047", "desc": "Perfil 140x140 700cm Blanco", "precio": 79.74, "categoria": "perfil"},
    {"ref": "100.1.0021", "desc": "Canal 140x140 400cm Blanco", "precio": 88.19, "categoria": "canal"},
    {"ref": "100.1.0022", "desc": "Canal 140x140 500cm Blanco", "precio": 88.19, "categoria": "canal"},
    {"ref": "100.1.0023", "desc": "Canal 140x140 600cm Blanco", "precio": 88.19, "categoria": "canal"},
    {"ref": "100.1.0024", "desc": "Canal 140x140 700cm Blanco", "precio": 88.19, "categoria": "canal"},
    {"ref": "100.1.0045", "desc": "Guía 75x140 400cm Blanco", "precio": 95.79, "categoria": "guia"},
    {"ref": "100.1.0046", "desc": "Guía 75x140 500cm Blanco", "precio": 95.79, "categoria": "guia"},
    {"ref": "100.1.0047", "desc": "Guía 75x140 600cm Blanco", "precio": 95.79, "categoria": "guia"},
    {"ref": "100.1.0048", "desc": "Guía 75x140 700cm Blanco", "precio": 95.79, "categoria": "guia"},
    {"ref": "100.1.0029", "desc": "Palillo 56x70 400cm Blanco", "precio": 36.81, "categoria": "palillo"},
    {"ref": "100.1.0030", "desc": "Palillo 56x70 500cm Blanco", "precio": 36.81, "categoria": "palillo"},
    {"ref": "100.1.0031", "desc": "Palillo 56x70 600cm Blanco", "precio": 36.81, "categoria": "palillo"},
    {"ref": "100.1.0032", "desc": "Palillo 56x70 700cm Blanco", "precio": 36.81, "categoria": "palillo"},
    {"ref": "250.1.0005", "desc": "Soporte Guía Trasero A Pared Blanco", "precio": 59.49, "categoria": "soporte"},
    {"ref": "250.1.0007", "desc": "Soporte Guía Trasero A Techo Blanco", "precio": 71.39, "categoria": "soporte"},
    {"ref": "240.1.0003", "desc": "Soporte Guía-Canal Delantero (TX7900) Blanco", "precio": 44.30, "categoria": "soporte"},
    {"ref": "243.1.0003", "desc": "Soporte Guía-Canal Blanco", "precio": 37.32, "categoria": "soporte"},
    {"ref": "243.1.0005", "desc": "Soporte Guía-Canal Desplazado Blanco", "precio": 20.42, "categoria": "soporte"},
    {"ref": "230.1.0041", "desc": "Distanciador Para Soporte Trasero Blanco", "precio": 43.15, "categoria": "soporte"},
    {"ref": "242.0.0002", "desc": "Base Interior 140x140 600mm Zincada", "precio": 57.07, "categoria": "base"},
    {"ref": "202.1.0007", "desc": "Placa Base Exterior 140x140 600mm Blanco", "precio": 27.76, "categoria": "base"},
    {"ref": "230.0.0011", "desc": "Entronque 140x140", "precio": 24.91, "categoria": "entronque"},
    {"ref": "230.0.0025", "desc": "Entronque 140x140 Corto", "precio": 21.14, "categoria": "entronque"},
    {"ref": "230.0.0042", "desc": "Entronque 140x60", "precio": 15.86, "categoria": "entronque"},
    {"ref": "230.1.0043", "desc": "Composite Unión Pérgolas 3mm 300cm Blanco", "precio": 109.66, "categoria": "union"},
    {"ref": "121.0.0007", "desc": "Refuerzo Canal 100x40 Hierro (600cm)", "precio": 114.22, "categoria": "refuerzo"},
    {"ref": "120.0.0065", "desc": "Perfil Cuadrado Refuerzo Palillo TENXO 40x40x4", "precio": 24.59, "categoria": "refuerzo"},
    {"ref": "334.J.0001", "desc": "Correa De Transmisión", "precio": 20.29, "categoria": "transmision"},
    {"ref": "104.1.0002", "desc": "Goma Antilluvia Blanca", "precio": 5.80, "categoria": "goma"},
    {"ref": "104.2.0001", "desc": "Goma Antilluvia Negra", "precio": 6.09, "categoria": "goma"},
    {"ref": "265.0.0002", "desc": "Patín Delantero Completo", "precio": 57.77, "categoria": "patin"},
    {"ref": "265.1.0003", "desc": "Patín Palillo Intermedio Completo Blanco", "precio": 45.67, "categoria": "patin"},
    {"ref": "265.2.0004", "desc": "Patín Palillo Intermedio Completo Negro", "precio": 45.67, "categoria": "patin"},
    {"ref": "265.0.0005", "desc": "Conjunto Polea Lisa Delantera", "precio": 52.01, "categoria": "polea"},
    {"ref": "203.0.0005", "desc": "Perno Patín Zamak", "precio": 7.54, "categoria": "perno"},
    {"ref": "203.0.0006", "desc": "Perno Palillo Inox", "precio": 19.83, "categoria": "perno"},
    {"ref": "203.0.0009", "desc": "Perno Palillo Fijo", "precio": 28.75, "categoria": "perno"},
    {"ref": "203.0.0008", "desc": "Perno Patín Delantero Inox", "precio": 31.73, "categoria": "perno"},
]

# Tejadillo TX-TJD-1 (composite 3mm, para TX7900/7910/7930/7950)
TEJADILLO_TJD1 = {
    "id": "TX-TJD-1",
    "nombre": "Composite 3mm",
    "tipo": "tejadillo",
    "lineas": [250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250, 1300, 1350],
    "precios": {
        "bajo400": {  # <400 salida
            250: 347, 300: 415, 350: 483, 400: 551, 450: 619, 500: 696, 550: 764, 600: 832,
            650: 900, 700: 968, 750: 1036, 800: 1104, 850: 1172, 900: 1239, 950: 1317,
            1000: 1385, 1050: 1453, 1100: 1521, 1150: 1589, 1200: 1657, 1250: 1725, 1300: 1792, 1350: 1860,
        },
        "sobre400": {  # >400 salida
            250: 525, 300: 629, 350: 733, 400: 836, 450: 940, 500: 1053, 550: 1156, 600: 1260,
            650: 1364, 700: 1467, 750: 1571, 800: 1675, 850: 1778, 900: 1882, 950: 1995,
            1000: 2099, 1050: 2202, 1100: 2306, 1150: 2410, 1200: 2513, 1250: 2617, 1300: 2720, 1350: 2824,
        }
    }
}

# Tejadillo TX-TJD-3 (composite cumbrera, para TX7970)
TEJADILLO_TJD3 = {
    "id": "TX-TJD-3",
    "nombre": "Composite 3mm Cumbrera",
    "tipo": "tejadillo",
    "lineas": [250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250, 1300, 1350],
    "precios": {
        "bajo800": {  # <800 salida
            250: 694, 300: 829, 350: 965, 400: 1101, 450: 1237, 500: 1392, 550: 1528, 600: 1664,
            650: 1799, 700: 1935, 750: 2071, 800: 2207, 850: 2343, 900: 2479, 950: 2634,
            1000: 2770, 1050: 2905, 1100: 3041, 1150: 3177, 1200: 3313, 1250: 3449, 1300: 3585, 1350: 3721,
        },
        "sobre800": {  # >800 salida
            250: 1050, 300: 1258, 350: 1465, 400: 1672, 450: 1880, 500: 2106, 550: 2313, 600: 2520,
            650: 2728, 700: 2935, 750: 3142, 800: 3349, 850: 3557, 900: 3764, 950: 3990,
            1000: 4197, 1050: 4405, 1100: 4612, 1150: 4819, 1200: 5026, 1250: 5234, 1300: 5441, 1350: 5648,
        }
    }
}


def reglas_basicas_tenxo(modelo):
    return [
        {
            "id": "linea_min",
            "descripcion": "Línea mínima del modelo",
            "efecto": "bloqueo",
            "mensaje": f"Línea mínima del {modelo}: 250 cm.",
            "condicion": {"linea": {"lt": 250}},
        },
        {
            "id": "linea_max",
            "descripcion": "Línea máxima del modelo",
            "efecto": "bloqueo",
            "mensaje": f"Línea máxima del {modelo}: 1350 cm.",
            "condicion": {"linea": {"gt": 1350}},
        },
        {
            "id": "salida_min",
            "descripcion": "Salida mínima del modelo",
            "efecto": "bloqueo",
            "mensaje": f"Salida mínima del {modelo}: 250 cm.",
            "condicion": {"salida": {"lt": 250}},
        },
    ]


def reglas_guias_tenxo(modelo):
    """Avisos sobre cambios en número de guías según línea."""
    return [
        {
            "id": "guias_2_hasta_450",
            "descripcion": "2 guías para línea hasta 450 cm",
            "efecto": "info",
            "mensaje": f"Línea ≤450 cm: {modelo} lleva 2 guías.",
            "condicion": {"linea": {"lte": 450}},
        },
        {
            "id": "guias_3_entre_500_900",
            "descripcion": "3 guías para línea 500-900 cm",
            "efecto": "info",
            "mensaje": f"Línea 500-900 cm: {modelo} lleva 3 guías.",
            "condicion": {"and": [{"linea": {"gte": 500}}, {"linea": {"lte": 900}}]},
        },
        {
            "id": "guias_4_desde_950",
            "descripcion": "4 guías para línea desde 950 cm",
            "efecto": "info",
            "mensaje": f"Línea ≥950 cm: {modelo} lleva 4 guías.",
            "condicion": {"linea": {"gte": 950}},
        },
    ]


def build_tenxo_catalog(modelo, cat_id, nombre, pagina, salida_max, tejadillo_config, reglas_extra=None):
    """Construye catálogo TENXO a partir de datos parseados."""
    with TENXO_JSON.open() as f:
        parsed_data = json.load(f)

    model_data = parsed_data[modelo]
    lineas = model_data["lineas"]
    salidas = model_data["salidas"]
    matrix_raw = model_data["matrix"]

    # Convertir matrix a str keys como espera el formato
    matrix = {str(s): {str(l): v for l, v in row.items()} for s, row in matrix_raw.items()}

    reglas = reglas_basicas_tenxo(nombre)
    reglas.extend(reglas_guias_tenxo(nombre))
    if reglas_extra:
        reglas.extend(reglas_extra)

    return {
        "id": cat_id,
        "nombre": nombre,
        "tipo": "pergola",
        "version": "2026.1",
        "fuente": {
            "pdf": "Tarifa-Awma-PVP-2026.pdf",
            "paginaTarifa": pagina,
        },
        "dimensiones": {
            "linea": {"min": min(lineas), "max": max(lineas), "valores": lineas},
            "salida": {"min": min(salidas), "max": salida_max, "valores": salidas},
        },
        "tarifa": {
            "matriz": matrix,
        },
        "tejadillo": tejadillo_config,
        "motores": list(MOTORES_TENXO),
        "sobreprecios": list(ACCESORIOS_TENXO),
        "reglas": reglas,
    }


# Generar 5 catálogos
catalogs = {
    "TX7900": build_tenxo_catalog(
        "TX7900", "TX7900", "TX7900 Pared", 182,
        salida_max=1500,
        tejadillo_config=TEJADILLO_TJD1,
    ),
    "TX7910": build_tenxo_catalog(
        "TX7910", "TX7910", "TX7910 Pared Portería", 185,
        salida_max=1500,
        tejadillo_config=TEJADILLO_TJD1,
    ),
    "TX7930": build_tenxo_catalog(
        "TX7930", "TX7930", "TX7930 Autoportante", 186,
        salida_max=1500,
        tejadillo_config=TEJADILLO_TJD1,
    ),
    "TX7950": build_tenxo_catalog(
        "TX7950", "TX7950", "TX7950 Autoportante Grande", 188,
        salida_max=1500,
        tejadillo_config=TEJADILLO_TJD1,
    ),
    "TX7970": build_tenxo_catalog(
        "TX7970", "TX7970", "TX7970 Pérgola Plana Grande", 189,
        salida_max=2000,
        tejadillo_config=TEJADILLO_TJD3,
    ),
}

# Escribir catálogos
for cat_id, cat in catalogs.items():
    out = ROOT / f"{cat_id}.json"
    with out.open("w", encoding="utf-8") as f:
        json.dump(cat, f, indent=2, ensure_ascii=False)
    n_cells = sum(len(row) for row in cat["tarifa"]["matriz"].values())
    print(f"✓ {out} ({len(cat['dimensiones']['linea']['valores'])} lineas × {len(cat['dimensiones']['salida']['valores'])} salidas = {n_cells} celdas)")
