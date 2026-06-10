#!/usr/bin/env python3
"""Genera catálogos JSON STR1000, STR1100 (stor balcón) y ART4100, ART4110 (brazos articulados) desde tarifa AWMA 2026."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "awma-core" / "catalog"
PRICES = ROOT / "prices"


# ---------- Motores ----------
# STR1000 — máquina + Somfy 10Nw
MOTORES_STR1000 = [
    {"id": "manual", "nombre": "Manivela", "recargo": 0, "familia": "manual"},
    {"id": "rts_10Nw", "nombre": "Somfy RTS 10Nw", "recargo": 180, "familia": "somfy"},
    {"id": "io_10Nw", "nombre": "Somfy iO 10Nw", "recargo": 285, "familia": "somfy"},
]

# STR1100 — máquina + Somfy 15Nw
MOTORES_STR1100 = [
    {"id": "manual", "nombre": "Manivela", "recargo": 0, "familia": "manual"},
    {"id": "rts_15Nw", "nombre": "Somfy RTS 15Nw", "recargo": 195, "familia": "somfy"},
    {"id": "io_15Nw", "nombre": "Somfy iO 15Nw", "recargo": 300, "familia": "somfy"},
]

# ART4100 — Somfy 30Nw / 40Nw según salida (aviso al motor el cambio)
MOTORES_ART4100 = [
    {"id": "manual", "nombre": "Manivela", "recargo": 0, "familia": "manual"},
    {"id": "rts_30Nw", "nombre": "Somfy RTS 30Nw (salida ≤175)", "recargo": 215, "familia": "somfy"},
    {"id": "rts_40Nw", "nombre": "Somfy RTS 40Nw (salida ≥200)", "recargo": 240, "familia": "somfy"},
    {"id": "io_30Nw", "nombre": "Somfy iO 30Nw (salida ≤175)", "recargo": 320, "familia": "somfy"},
    {"id": "io_40Nw", "nombre": "Somfy iO 40Nw (salida ≥200)", "recargo": 345, "familia": "somfy"},
]

# ART4110 — Somfy 30/40/55Nw según salida
MOTORES_ART4110 = [
    {"id": "manual", "nombre": "Manivela", "recargo": 0, "familia": "manual"},
    {"id": "rts_30Nw", "nombre": "Somfy RTS 30Nw (salida ≤200)", "recargo": 215, "familia": "somfy"},
    {"id": "rts_40Nw", "nombre": "Somfy RTS 40Nw (salida 225-300)", "recargo": 240, "familia": "somfy"},
    {"id": "rts_55Nw", "nombre": "Somfy RTS 55Nw (salida ≥325)", "recargo": 320, "familia": "somfy"},
    {"id": "io_30Nw", "nombre": "Somfy iO 30Nw (salida ≤200)", "recargo": 320, "familia": "somfy"},
    {"id": "io_40Nw", "nombre": "Somfy iO 40Nw (salida 225-300)", "recargo": 345, "familia": "somfy"},
    {"id": "io_55Nw", "nombre": "Somfy iO 55Nw (salida ≥325)", "recargo": 420, "familia": "somfy"},
]


# ---------- Sobreprecios ----------
SOBRE_STR1000 = [
    {"ref": "80070007", "desc": "J. Brazo STOR 500 blanco", "precio": 53.00, "categoria": "brazo"},
    {"ref": "80070139", "desc": "J. Spte. pared horizontal STOR blanco", "precio": 17.00, "categoria": "soporte"},
    {"ref": "80070110", "desc": "J. Soporte pared STOR blanco", "precio": 14.00, "categoria": "soporte"},
    {"ref": "80070094", "desc": "J. Soporte barandilla STOR blanco", "precio": 25.00, "categoria": "soporte"},
    {"ref": "80070171", "desc": "Spte. barandilla Ø50 STOR blanco", "precio": 31.00, "categoria": "soporte"},
]

SOBRE_STR1100 = SOBRE_STR1000 + [
    {"ref": "80130241", "desc": "Perfiles cofre Desert blanco 4M", "precio": 82.00, "categoria": "cofre", "unidad": "ML"},
    {"ref": "80130242", "desc": "Perfiles cofre Desert blanco 5M", "precio": 82.00, "categoria": "cofre", "unidad": "ML"},
    {"ref": "80130243", "desc": "Perfiles cofre Desert blanco 5,8M", "precio": 80.00, "categoria": "cofre", "unidad": "ML"},
    {"ref": "80130244", "desc": "Perfiles cofre Desert blanco 6M", "precio": 82.00, "categoria": "cofre", "unidad": "ML"},
    {"ref": "80130270", "desc": "J. tapas cofre Desert blanco", "precio": 50.00, "categoria": "cofre"},
    {"ref": "80130262", "desc": "Soporte pared-techo cofre Desert blanco", "precio": 9.00, "categoria": "soporte"},
    {"ref": "80130282", "desc": "Soporte lateral cofre Desert blanco", "precio": 10.00, "categoria": "soporte"},
]

# Brazos SMART (ART4100) — tarifa página 87
BRAZOS_SMART = [
    {"ref": "80081200", "desc": "J. Brazos INV. SMART 1,00", "precio": 216.15, "categoria": "brazo"},
    {"ref": "80081207", "desc": "J. Brazos INV. SMART 1,25", "precio": 231.30, "categoria": "brazo"},
    {"ref": "80081214", "desc": "J. Brazos INV. SMART 1,50", "precio": 241.84, "categoria": "brazo"},
    {"ref": "80081221", "desc": "J. Brazos INV. SMART 1,75", "precio": 256.29, "categoria": "brazo"},
    {"ref": "80081228", "desc": "J. Brazos INV. SMART 2,00", "precio": 268.00, "categoria": "brazo"},
    {"ref": "80081235", "desc": "J. Brazos INV. SMART 2,25", "precio": 296.40, "categoria": "brazo"},
    {"ref": "80081242", "desc": "J. Brazos INV. SMART 2,50", "precio": 311.07, "categoria": "brazo"},
]

SOBRE_ART4100 = [
    {"ref": "80081265", "desc": "J. Soporte SMART blanco", "precio": 176.34, "categoria": "soporte"},
] + BRAZOS_SMART + [
    {"ref": "80080885", "desc": "J. Regletas inferior brazo Premium blanco", "precio": 25.74, "categoria": "accesorio"},
    {"ref": "80081800", "desc": "Pivote largo barra de carga A1 blanco", "precio": 2.00, "categoria": "accesorio"},
]

# Brazos PREMIUM (ART4110) — tarifa página 89
BRAZOS_PREMIUM = [
    {"ref": "80080785", "desc": "J. Brazos INV. Premium 1,50", "precio": 286.24, "categoria": "brazo"},
    {"ref": "80080795", "desc": "J. Brazos INV. Premium 1,75", "precio": 301.36, "categoria": "brazo"},
    {"ref": "80080805", "desc": "J. Brazos INV. Premium 2,00", "precio": 318.53, "categoria": "brazo"},
    {"ref": "80080815", "desc": "J. Brazos INV. Premium 2,25", "precio": 329.79, "categoria": "brazo"},
    {"ref": "80080825", "desc": "J. Brazos INV. Premium 2,50", "precio": 344.37, "categoria": "brazo"},
    {"ref": "80080835", "desc": "J. Brazos INV. Premium 2,75", "precio": 367.46, "categoria": "brazo"},
    {"ref": "80080845", "desc": "J. Brazos INV. Premium 3,00", "precio": 402.89, "categoria": "brazo"},
    {"ref": "80080855", "desc": "J. Brazos INV. Premium 3,25", "precio": 422.17, "categoria": "brazo"},
    {"ref": "80080865", "desc": "J. Brazos INV. Premium 3,50", "precio": 465.37, "categoria": "brazo"},
]

SOBRE_ART4110 = [
    {"ref": "80081813", "desc": "J. Soporte A1 Premium Plus blanco", "precio": 167.06, "categoria": "soporte"},
] + BRAZOS_PREMIUM + [
    {"ref": "80080885", "desc": "J. Regletas inferior brazo Premium blanco", "precio": 25.74, "categoria": "accesorio"},
    {"ref": "80081800", "desc": "Pivote largo barra de carga A1 blanco", "precio": 2.00, "categoria": "accesorio"},
    {"ref": "80081723", "desc": "Puntal telescópico p/barra de carga blanco", "precio": 174.21, "categoria": "accesorio"},
    {"ref": "80081697", "desc": "Soporte central LIRA A1 Premium blanco", "precio": 138.77, "categoria": "soporte"},
]


# ---------- Tarifas (datos del PDF) ----------
# STR1000: matriz con ALT.TECHO/BARANDA como salida (no L/CORTE LONA). Tarifa página 67-68.
#   ALT.TECHO/BARANDA: 170 | 200 | 225 | 250
#   (corte lona equivalente: 295 | 325 | 350 | 375)
ALTURAS_STR1000 = [170, 200, 225, 250]
STR1000_MATRIX_ROWS = {
    100: [306, 313, 318, 324],
    125: [351, 361, 370, 378],
    150: [364, 374, 382, 391],
    175: [409, 423, 434, 445],
    200: [422, 435, 446, 457],
    225: [467, 484, 498, 512],
    250: [480, 496, 510, 524],
    275: [525, 545, 562, 578],
    300: [538, 558, 574, 591],
    325: [550, 570, 587, 604],
    350: [596, 619, 638, 658],
    375: [608, 632, 651, 670],
    400: [654, 680, 702, 725],
    425: [666, 693, 715, 737],
    450: [679, 705, 728, 750],
    475: [724, 754, 779, 804],
    500: [737, 767, 792, 817],
    525: [782, 815, 843, 871],
    550: [795, 828, 856, 883],
    575: [840, 877, 907, 938],
    600: [853, 889, 920, 950],
}
STR1000_MATRIX = {str(l): {str(a): p for a, p in zip(ALTURAS_STR1000, row)}
                  for l, row in STR1000_MATRIX_ROWS.items()}

# STR1100: una sola altura (170 cm). Tarifa página 70.
STR1100_MATRIX_ROWS = {
    100: 362,
    125: 399,
    150: 422,
    175: 477,
    200: 500,
    225: 555,
    250: 578,
    275: 632,
    300: 655,
    325: 704,
    350: 759,
    375: 782,
    400: 837,
    425: 860,
    450: 883,
    475: 946,
    500: 969,
}
STR1100_MATRIX = {str(l): {"170": p} for l, p in STR1100_MATRIX_ROWS.items()}


# ---------- Helpers ----------
def load_prices(name):
    with (PRICES / f"{name}.json").open() as f:
        return json.load(f)


def matriz_lineas_salidas(matrix):
    lineas = sorted(int(k) for k in matrix.keys())
    salidas = sorted({int(s) for row in matrix.values() for s in row.keys()})
    return lineas, salidas


def reglas_basicas(modelo, lmin, lmax, smin, smax, etq_salida="salida"):
    return [
        {"id": "linea_min", "descripcion": f"Línea mínima del {modelo}", "efecto": "bloqueo",
         "mensaje": f"Línea mínima del {modelo}: {lmin} cm.", "condicion": {"linea": {"lt": lmin}}},
        {"id": "linea_max", "descripcion": f"Línea máxima del {modelo}", "efecto": "bloqueo",
         "mensaje": f"Línea máxima del {modelo}: {lmax} cm.", "condicion": {"linea": {"gt": lmax}}},
        {"id": f"{etq_salida}_min", "descripcion": f"{etq_salida.capitalize()} mínima del {modelo}", "efecto": "bloqueo",
         "mensaje": f"{etq_salida.capitalize()} mínima del {modelo}: {smin} cm.", "condicion": {"salida": {"lt": smin}}},
        {"id": f"{etq_salida}_max", "descripcion": f"{etq_salida.capitalize()} máxima del {modelo}", "efecto": "bloqueo",
         "mensaje": f"{etq_salida.capitalize()} máxima del {modelo}: {smax} cm.", "condicion": {"salida": {"gt": smax}}},
    ]


def build_catalog(*, cat_id, nombre, tipo, matrix, pagina, motores, sobreprecios=None,
                  reglas_extra=None, descripcion=None, etiqueta_salida="salida",
                  abd_name=None):
    lineas, salidas = matriz_lineas_salidas(matrix)
    lmin, lmax = lineas[0], lineas[-1]
    smin, smax = salidas[0], salidas[-1]
    reglas = reglas_basicas(nombre, lmin, lmax, smin, smax, etq_salida=etiqueta_salida)
    if reglas_extra:
        reglas.extend(reglas_extra)
    cat = {
        "id": cat_id,
        "nombre": nombre,
        "tipo": tipo,
        "version": "2026.1",
        "fuente": {
            "abd": f"{abd_name or cat_id}.abd",
            "tarifaPdf": "Tarifa-Awma-PVP-2026.pdf",
            "paginaTarifa": pagina,
        },
        "dimensiones": {
            "linea": {"min": lmin, "max": lmax, "valores": lineas, "etiqueta": "línea (ancho)"},
            "salida": {"min": smin, "max": smax, "valores": salidas, "etiqueta": etiqueta_salida},
        },
        "tarifa": {"matriz": matrix},
        "motores": list(motores),
        "sobreprecios": list(sobreprecios or []),
        "reglas": reglas,
    }
    if descripcion:
        cat["descripcion"] = descripcion
    return cat


# ---------- STR1000 ----------
str1000_reglas = [
    {
        "id": "stor_balcon_motor_recomendado",
        "descripcion": "STR1000 admite máquina (manivela) o motorización ligera Somfy 10Nw",
        "efecto": "aviso",
        "mensaje": "STR1000: motor recomendado Somfy 10Nw. Para 150 cm de motor consultar referencia exacta.",
        "condicion": {"linea": {"gte": 0}},
    },
]
str1000 = build_catalog(
    cat_id="STR1000",
    nombre="STR1000 SOLARIS Stor Balcón",
    tipo="toldo_brazo",
    matrix=STR1000_MATRIX,
    pagina=68,
    motores=MOTORES_STR1000,
    sobreprecios=SOBRE_STR1000,
    reglas_extra=str1000_reglas,
    etiqueta_salida="altura (techo/barandilla)",
    descripcion=("Stor balcón SOLARIS con brazos abatibles de 50 cm. La salida indica "
                 "altura del techo/barandilla (170-250 cm). Fijación a pared/techo/barandilla."),
)

# ---------- STR1100 ----------
str1100_reglas = [
    {
        "id": "soportes_segun_linea",
        "descripcion": "Nº de soportes según línea: 2 hasta 350, 3 hasta 450, 4 hasta 500",
        "efecto": "aviso",
        "mensaje": "STR1100: 2 soportes hasta 350 cm de línea, 3 soportes hasta 450 cm, 4 soportes para 475-500 cm.",
        "condicion": {"linea": {"gte": 0}},
    },
    {
        "id": "tubo_max_265",
        "descripcion": "Capacidad máxima de tejido con tubo Ø70mm",
        "efecto": "aviso",
        "mensaje": "STR1100: capacidad máxima de lona con tubo Ø70mm es 265 cm de altura. Para alturas mayores consultar.",
        "condicion": {"linea": {"gte": 0}},
    },
]
str1100 = build_catalog(
    cat_id="STR1100",
    nombre="STR1100 DESERT Stor Cofre Balcón",
    tipo="toldo_cofre",
    matrix=STR1100_MATRIX,
    pagina=70,
    motores=MOTORES_STR1100,
    sobreprecios=SOBRE_STR1100,
    reglas_extra=str1100_reglas,
    etiqueta_salida="altura (techo/barandilla)",
    descripcion=("Stor cofre DESERT con brazos abatibles de 50 cm y cofre estético. "
                 "Tubo Ø70mm. Salida 170 cm (capacidad máxima 265 cm de lona)."),
)

# ---------- ART4100 ----------
art4100_prices = load_prices("ART4100")
art4100_reglas = [
    {
        "id": "motor_40Nw_salida_grande",
        "descripcion": "Motor 40Nw recomendado para salidas ≥200",
        "efecto": "aviso",
        "mensaje": "ART4100: salida ≥200 cm utiliza motor Somfy 40Nw (en lugar de 30Nw).",
        "condicion": {"salida": {"gte": 200}},
    },
    {
        "id": "ensamblado_max_450",
        "descripcion": "Se entrega ensamblado hasta 450 cm",
        "efecto": "aviso",
        "mensaje": "ART4100: se sirve ensamblado hasta 450 cm de línea; resto se entrega en partes lo más montado posible.",
        "condicion": {"linea": {"gt": 450}},
    },
]
art4100 = build_catalog(
    cat_id="ART4100",
    nombre="ART4100 A1 SMART Brazos Articulados",
    tipo="toldo_brazo",
    matrix=art4100_prices["matrix_cm"],
    pagina=86,
    motores=MOTORES_ART4100,
    sobreprecios=SOBRE_ART4100,
    reglas_extra=art4100_reglas,
    etiqueta_salida="salida (brazo)",
    descripcion=("Toldo de brazos articulados SMART con sistema de tensión interna. "
                 "Tubo Ø70mm. Compatible con cajón Spiral Smart y tejadillo V2. "
                 "Salida = longitud del brazo (125-250 cm)."),
)

# ---------- ART4110 ----------
art4110_prices = load_prices("ART4110")
art4110_reglas = [
    {
        "id": "motor_40Nw_salida_225_300",
        "descripcion": "Motor 40Nw para salidas 225-300",
        "efecto": "aviso",
        "mensaje": "ART4110: salida 225-300 cm utiliza motor Somfy 40Nw.",
        "condicion": {"and": [{"salida": {"gte": 225}}, {"salida": {"lte": 300}}]},
    },
    {
        "id": "motor_55Nw_salida_325",
        "descripcion": "Motor 55Nw para salidas ≥325",
        "efecto": "aviso",
        "mensaje": "ART4110: salida ≥325 cm utiliza motor Somfy 55Nw (motor reforzado).",
        "condicion": {"salida": {"gte": 325}},
    },
    {
        "id": "ensamblado_max_595",
        "descripcion": "Se entrega ensamblado hasta 595 cm",
        "efecto": "aviso",
        "mensaje": "ART4110: se sirve totalmente montado hasta 595 cm de línea; el resto se entrega en partes lo más montado posible.",
        "condicion": {"linea": {"gt": 595}},
    },
]
art4110 = build_catalog(
    cat_id="ART4110",
    nombre="ART4110 A1 PREMIUM Brazos Articulados",
    tipo="toldo_brazo",
    matrix=art4110_prices["matrix_cm"],
    pagina=88,
    motores=MOTORES_ART4110,
    sobreprecios=SOBRE_ART4110,
    reglas_extra=art4110_reglas,
    etiqueta_salida="salida (brazo)",
    descripcion=("Toldo de brazos articulados PREMIUM de gran resistencia con sistema "
                 "de tensión interna. Tubo Ø78mm. Compatible con cajón Spiral Premium y "
                 "tejadillo V2. Salida = longitud del brazo (150-350 cm)."),
)


# ---------- Escribir ----------
todos = {
    "STR1000": str1000,
    "STR1100": str1100,
    "ART4100": art4100,
    "ART4110": art4110,
}

for cat_id, cat in todos.items():
    out = ROOT / f"{cat_id}.json"
    with out.open("w", encoding="utf-8") as f:
        json.dump(cat, f, indent=2, ensure_ascii=False)
    n = sum(len(v) for v in cat["tarifa"]["matriz"].values())
    print(f"✓ {out.name}  ({n} celdas)")
