#!/usr/bin/env python3
"""Genera catálogos JSON de verticales AWMA (AV84xx-AV88xx) desde prices/*.json + matrices NIMBUS completas."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "awma-core" / "catalog"
PRICES = ROOT / "prices"

# Motores verticales: NEXUS y PARAVENTO/PARABOX/IGLOO usan máquinas distintas a los toldos cofre.
# La tarifa hace referencia a página 54 para motorización Somfy. Usamos el mismo bloque base
# que ya se aplica en otros catálogos para coherencia, pero los AV varían el motor de fábrica.
MOTORES_VERTICAL_NEXUS = [
    {"id": "manual", "nombre": "Manivela", "recargo": 0, "familia": "manual"},
    {"id": "rts_15Nm", "nombre": "Somfy RTS 15Nm", "recargo": 195, "familia": "somfy"},
    {"id": "rts_25Nm", "nombre": "Somfy RTS 25Nm", "recargo": 220, "familia": "somfy"},
    {"id": "io_15Nm", "nombre": "Somfy iO 15Nm", "recargo": 300, "familia": "somfy"},
    {"id": "io_25Nm", "nombre": "Somfy iO 25Nm", "recargo": 325, "familia": "somfy"},
]

MOTORES_PARAVENTO = [
    {"id": "manual", "nombre": "Manivela", "recargo": 0, "familia": "manual"},
    {"id": "rts_25Nm", "nombre": "Somfy RTS 25Nm (línea ≤350)", "recargo": 220, "familia": "somfy"},
    {"id": "rts_30Nm", "nombre": "Somfy RTS 30Nm (línea >350)", "recargo": 245, "familia": "somfy"},
    {"id": "io_25Nm", "nombre": "Somfy iO 25Nm (línea ≤350)", "recargo": 325, "familia": "somfy"},
    {"id": "io_30Nm", "nombre": "Somfy iO 30Nm (línea >350)", "recargo": 350, "familia": "somfy"},
]

MOTORES_PARABOX = [
    {"id": "manual", "nombre": "Manivela", "recargo": 0, "familia": "manual"},
    {"id": "rts_35Nm", "nombre": "Somfy RTS 35Nm (línea ≤350)", "recargo": 265, "familia": "somfy"},
    {"id": "rts_40Nm", "nombre": "Somfy RTS 40Nm (línea >350)", "recargo": 290, "familia": "somfy"},
    {"id": "io_35Nm", "nombre": "Somfy iO 35Nm (línea ≤350)", "recargo": 370, "familia": "somfy"},
    {"id": "io_40Nm", "nombre": "Somfy iO 40Nm (línea >350)", "recargo": 395, "familia": "somfy"},
]

MOTORES_NIMBUS = [
    {"id": "manual", "nombre": "Manivela", "recargo": 0, "familia": "manual"},
    {"id": "rts_20Nm", "nombre": "Somfy RTS 20Nm (línea ≤400)", "recargo": 215, "familia": "somfy"},
    {"id": "rts_30Nm", "nombre": "Somfy RTS 30Nm (línea >400)", "recargo": 245, "familia": "somfy"},
    {"id": "io_20Nm", "nombre": "Somfy iO 20Nm (línea ≤400)", "recargo": 320, "familia": "somfy"},
    {"id": "io_30Nm", "nombre": "Somfy iO 30Nm (línea >400)", "recargo": 350, "familia": "somfy"},
]


def load_prices(name):
    with (PRICES / f"{name}.json").open() as f:
        return json.load(f)


def reglas_basicas(modelo, lmin, lmax, smin, smax):
    return [
        {"id": "linea_min", "descripcion": "Línea mínima del modelo", "efecto": "bloqueo",
         "mensaje": f"Línea mínima del {modelo}: {lmin} cm.", "condicion": {"linea": {"lt": lmin}}},
        {"id": "linea_max", "descripcion": "Línea máxima del modelo", "efecto": "bloqueo",
         "mensaje": f"Línea máxima del {modelo}: {lmax} cm.", "condicion": {"linea": {"gt": lmax}}},
        {"id": "altura_min", "descripcion": "Altura/salida mínima del modelo", "efecto": "bloqueo",
         "mensaje": f"Altura mínima del {modelo}: {smin} cm.", "condicion": {"salida": {"lt": smin}}},
        {"id": "altura_max", "descripcion": "Altura/salida máxima del modelo", "efecto": "bloqueo",
         "mensaje": f"Altura máxima del {modelo}: {smax} cm.", "condicion": {"salida": {"gt": smax}}},
    ]


def matriz_lineas_salidas(matrix):
    lineas = sorted(int(k) for k in matrix.keys())
    salidas = sorted({int(s) for row in matrix.values() for s in row.keys()})
    return lineas, salidas


def build_catalog(*, cat_id, nombre, prices_name, pagina, motores, sobreprecios=None,
                  reglas_extra=None, matriz_override=None, descripcion=None, tipo="vertical"):
    p = load_prices(prices_name)
    matrix = matriz_override or p["matrix_cm"]
    lineas, salidas = matriz_lineas_salidas(matrix)
    lmin, lmax = lineas[0], lineas[-1]
    smin, smax = salidas[0], salidas[-1]
    reglas = reglas_basicas(nombre, lmin, lmax, smin, smax)
    if reglas_extra:
        reglas.extend(reglas_extra)
    cat = {
        "id": cat_id,
        "nombre": nombre,
        "tipo": tipo,
        "version": "2026.1",
        "fuente": {
            "abd": f"{prices_name}.abd",
            "tarifaPdf": "Tarifa-Awma-PVP-2026.pdf",
            "paginaTarifa": pagina,
        },
        "dimensiones": {
            "linea": {"min": lmin, "max": lmax, "valores": lineas, "etiqueta": "línea (ancho)"},
            "salida": {"min": smin, "max": smax, "valores": salidas, "etiqueta": "altura"},
        },
        "tarifa": {"matriz": {str(l): {str(s): v for s, v in row.items()} for l, row in matrix.items()}},
        "motores": list(motores),
        "sobreprecios": list(sobreprecios or []),
        "reglas": reglas,
    }
    if descripcion:
        cat["descripcion"] = descripcion
    return cat


# ---------- NIMBUS: matrices completas desde PDF p.241 ----------
ALTURAS_NIMBUS = [200, 225, 250, 275, 300, 325]
LINEAS_NIMBUS = [150, 175, 200, 225, 250, 275, 300, 325, 350, 375, 400, 425, 450, 475, 500]


def nimbus_matrix(rows):
    """rows: list[list[int]] paralela a LINEAS_NIMBUS, cada interna paralela a ALTURAS_NIMBUS."""
    assert len(rows) == len(LINEAS_NIMBUS)
    out = {}
    for l, vals in zip(LINEAS_NIMBUS, rows):
        assert len(vals) == len(ALTURAS_NIMBUS)
        out[str(l)] = {str(s): v for s, v in zip(ALTURAS_NIMBUS, vals)}
    return out


# AV8870-1 | CABLE | SIN COFRE  (PDF p.241)
av8870_1 = nimbus_matrix([
    [670, 680, 689, 699, 709, 718],   # 150
    [715, 726, 737, 748, 758, 769],   # 175
    [760, 772, 784, 796, 808, 820],   # 200
    [806, 819, 832, 845, 858, 871],   # 225
    [851, 865, 879, 893, 907, 921],   # 250
    [896, 911, 926, 941, 957, 972],   # 275
    [941, 957, 974, 990, 1006, 1023], # 300
    [986, 1003, 1021, 1038, 1056, 1073], # 325
    [1031, 1050, 1068, 1087, 1105, 1124], # 350
    [1076, 1096, 1116, 1135, 1155, 1175], # 375
    [1121, 1142, 1163, 1184, 1205, 1225], # 400
    [1166, 1188, 1210, 1232, 1254, 1276], # 425
    [1212, 1235, 1258, 1281, 1304, 1327], # 450
    [1257, 1281, 1305, 1329, 1353, 1378], # 475
    [1302, 1327, 1352, 1378, 1403, 1428], # 500
])

# AV8870-2 | VARILLA | SIN COFRE  (PDF p.241)
av8870_2 = nimbus_matrix([
    [738, 764, 790, 816, 842, 868],
    [783, 810, 837, 864, 891, 918],
    [827, 855, 884, 912, 940, 968],
    [872, 901, 930, 960, 989, 1018],
    [916, 947, 977, 1007, 1038, 1068],
    [961, 992, 1024, 1055, 1087, 1118],
    [1005, 1038, 1071, 1103, 1136, 1168],
    [1050, 1084, 1117, 1151, 1185, 1219],
    [1095, 1129, 1164, 1199, 1234, 1269],
    [1139, 1175, 1211, 1247, 1283, 1319],
    [1184, 1221, 1258, 1295, 1332, 1369],
    [1228, 1266, 1304, 1343, 1381, 1419],
    [1273, 1312, 1351, 1391, 1430, 1469],
    [1317, 1358, 1398, 1438, 1479, 1519],
    [1362, 1403, 1445, 1486, 1528, 1569],
])

# AV8890-1 | CABLE | CON COFRE  (PDF p.242)
av8890_1 = nimbus_matrix([
    [757, 766, 776, 786, 795, 805],
    [815, 826, 836, 847, 858, 869],
    [873, 885, 897, 909, 921, 932],
    [932, 944, 957, 970, 983, 996],
    [990, 1004, 1018, 1032, 1046, 1060],
    [1048, 1063, 1078, 1093, 1109, 1124],
    [1106, 1123, 1139, 1155, 1171, 1188],
    [1165, 1182, 1199, 1217, 1234, 1251],
    [1223, 1241, 1260, 1278, 1297, 1315],
    [1281, 1301, 1320, 1340, 1359, 1379],
    [1339, 1360, 1381, 1401, 1422, 1443],
    [1398, 1419, 1441, 1463, 1485, 1507],
    [1456, 1479, 1502, 1525, 1547, 1570],
    [1514, 1538, 1562, 1586, 1610, 1634],
    [1572, 1597, 1623, 1648, 1673, 1698],
])

# AV8890-2 | VARILLA | CON COFRE  (PDF p.242)
av8890_2 = nimbus_matrix([
    [827, 853, 878, 904, 930, 956],
    [900, 928, 957, 985, 1014, 1042],
    [947, 975, 1004, 1032, 1061, 1089],
    [994, 1022, 1051, 1079, 1108, 1136],
    [1067, 1098, 1129, 1160, 1191, 1223],
    [1114, 1145, 1176, 1207, 1238, 1270],
    [1187, 1221, 1255, 1288, 1322, 1356],
    [1234, 1268, 1301, 1335, 1369, 1403],
    [1281, 1315, 1348, 1382, 1416, 1450],
    [1354, 1390, 1427, 1463, 1500, 1536],
    [1401, 1437, 1474, 1510, 1547, 1583],
    [1474, 1513, 1552, 1591, 1630, 1670],
    [1521, 1560, 1599, 1638, 1677, 1717],
    [1594, 1636, 1678, 1719, 1761, 1803],
    [1641, 1683, 1724, 1766, 1808, 1850],
])


# ---------- Sobreprecios PARAVENTO / PARABOX / IGLOO ----------
SOBRE_PARAVENTO = [
    {"ref": "80141306", "desc": "Perfil guía Paravento blanco 7M", "precio": 50.36, "categoria": "guia", "unidad": "ML"},
    {"ref": "80141298", "desc": "Tope plástico cerrojillo Paravento", "precio": 3.03, "categoria": "accesorio", "unidad": "UD"},
    {"ref": "80141296", "desc": "J. embudo perfil guía Paravento blanco", "precio": 3.33, "categoria": "accesorio", "unidad": "JGO"},
    {"ref": "80140332", "desc": "Perfil faldón Paravento blanco 7M", "precio": 26.80, "categoria": "faldon", "unidad": "ML"},
    {"ref": "80140718", "desc": "Cerrojillo Paravento D10 ZnNi", "precio": 11.73, "categoria": "accesorio", "unidad": "UD"},
    {"ref": "80141335", "desc": "Perfil refuerzo curvo Paravento blanco 7M", "precio": 13.42, "categoria": "refuerzo", "unidad": "ML"},
    {"ref": "80141329", "desc": "Tapa perfil refuerzo curvo Paravento blanco", "precio": 0.22, "categoria": "accesorio", "unidad": "UD"},
]

SOBRE_IGLOO = [
    {"ref": "80170637", "desc": "J. perfiles cofre Igloo blanco 7M", "precio": 140.43, "categoria": "cofre", "unidad": "ML"},
    {"ref": "80170677", "desc": "J. perfiles guía Igloo blanco 6M", "precio": 115.77, "categoria": "guia", "unidad": "ML"},
    {"ref": "80170657", "desc": "Perfil barra carga Igloo blanco 7M", "precio": 75.69, "categoria": "barra_carga", "unidad": "ML"},
    {"ref": "80170696", "desc": "Kit tapas Igloo blanco", "precio": 188.09, "categoria": "accesorio", "unidad": "KIT"},
    {"ref": "80170707", "desc": "J. cerrojillos Igloo blanco", "precio": 111.50, "categoria": "accesorio", "unidad": "JGO"},
]


# ---------- Catálogos ----------
av8400 = build_catalog(
    cat_id="AV8400", nombre="AV8400 NEXUS 80 Cable",
    prices_name="AV8400", pagina=225, motores=MOTORES_VERTICAL_NEXUS,
    descripcion="Vertical NEXUS 80, guiado por cable. Cajón 80 mm.",
)
av8410 = build_catalog(
    cat_id="AV8410", nombre="AV8410 NEXUS 80 Guía",
    prices_name="AV8410", pagina=225, motores=MOTORES_VERTICAL_NEXUS,
    descripcion="Vertical NEXUS 80, guías laterales. Cajón 80 mm.",
)
av8430 = build_catalog(
    cat_id="AV8430", nombre="AV8430 NEXUS 80 Guía + ZIP",
    prices_name="AV8430", pagina=225, motores=MOTORES_VERTICAL_NEXUS,
    descripcion="Vertical NEXUS 80, guías con sistema ZIP. Cajón 80 mm.",
)

av8500 = build_catalog(
    cat_id="AV8500", nombre="AV8500 NEXUS 100 Cable",
    prices_name="AV8500", pagina=227, motores=MOTORES_VERTICAL_NEXUS,
    descripcion="Vertical NEXUS 100, guiado por cable. Cajón 100 mm.",
)
av8510 = build_catalog(
    cat_id="AV8510", nombre="AV8510 NEXUS 100 Guía",
    prices_name="AV8510", pagina=227, motores=MOTORES_VERTICAL_NEXUS,
    descripcion="Vertical NEXUS 100, guías laterales. Cajón 100 mm.",
)
av8530 = build_catalog(
    cat_id="AV8530", nombre="AV8530 NEXUS 100 Guía + ZIP",
    prices_name="AV8530", pagina=227, motores=MOTORES_VERTICAL_NEXUS,
    descripcion="Vertical NEXUS 100, guías con sistema ZIP. Cajón 100 mm.",
)

# NEXUS 130 — motor 30Nw para combinaciones grandes (regla de aviso)
nexus130_regla = [{
    "id": "motor_30Nw_grandes",
    "descripcion": "Motor 30Nw recomendado para combinaciones grandes",
    "efecto": "aviso",
    "mensaje": "Línea >350 cm o salida >300 cm: utilizar motor Somfy 30Nw en lugar de 25Nw.",
    "condicion": {"or": [{"linea": {"gt": 350}}, {"salida": {"gt": 300}}]},
}]
av8600 = build_catalog(
    cat_id="AV8600", nombre="AV8600 NEXUS 130 Cable",
    prices_name="AV8600", pagina=229, motores=MOTORES_VERTICAL_NEXUS,
    reglas_extra=nexus130_regla,
    descripcion="Vertical NEXUS 130, guiado por cable. Cajón 130 mm.",
)
av8610 = build_catalog(
    cat_id="AV8610", nombre="AV8610 NEXUS 130 Guía",
    prices_name="AV8610", pagina=229, motores=MOTORES_VERTICAL_NEXUS,
    reglas_extra=nexus130_regla,
    descripcion="Vertical NEXUS 130, guías laterales. Cajón 130 mm.",
)
av8630 = build_catalog(
    cat_id="AV8630", nombre="AV8630 NEXUS 130 Guía + ZIP",
    prices_name="AV8630", pagina=230, motores=MOTORES_VERTICAL_NEXUS,
    reglas_extra=nexus130_regla,
    descripcion="Vertical NEXUS 130, guías con sistema ZIP. Cajón 130 mm.",
)

# PARAVENTO — motor 25Nw/30Nw según línea
paravento_regla = [{
    "id": "motor_30Nw_linea_grande",
    "descripcion": "Motor 30Nw para línea >350",
    "efecto": "aviso",
    "mensaje": "Línea >350 cm: motor Somfy 30Nw (en lugar de 25Nw).",
    "condicion": {"linea": {"gt": 350}},
}]
av8700 = build_catalog(
    cat_id="AV8700", nombre="AV8700 PARAVENTO Cortavientos",
    prices_name="AV8700", pagina=233, motores=MOTORES_PARAVENTO,
    sobreprecios=SOBRE_PARAVENTO, reglas_extra=paravento_regla,
    descripcion="Cortavientos PARAVENTO clásico, fijación pared/techo/entre paredes.",
)
av8710 = build_catalog(
    cat_id="AV8710", nombre="AV8710 PARAVENTO Guía",
    prices_name="AV8710", pagina=233, motores=MOTORES_PARAVENTO,
    sobreprecios=SOBRE_PARAVENTO, reglas_extra=paravento_regla,
    descripcion="Cortavientos PARAVENTO con guías. Fijación pared/techo/entre paredes.",
)
av8730 = build_catalog(
    cat_id="AV8730", nombre="AV8730 PARAVENTO Guías + Refuerzos",
    prices_name="AV8730", pagina=234, motores=MOTORES_PARAVENTO,
    sobreprecios=SOBRE_PARAVENTO, reglas_extra=paravento_regla,
    descripcion="Cortavientos PARAVENTO con guías y refuerzos. Ventana panorámica transparente incluida.",
)

# PARABOX — motor 35/40Nw
parabox_regla = [{
    "id": "motor_40Nw_linea_grande",
    "descripcion": "Motor 40Nw para línea >350",
    "efecto": "aviso",
    "mensaje": "Línea >350 cm: motor Somfy 40Nw (en lugar de 35Nw).",
    "condicion": {"linea": {"gt": 350}},
}]
av8750 = build_catalog(
    cat_id="AV8750", nombre="AV8750 PARABOX Cortavientos con cofre",
    prices_name="AV8750", pagina=237, motores=MOTORES_PARABOX,
    sobreprecios=SOBRE_PARAVENTO, reglas_extra=parabox_regla,
    descripcion="Cortavientos PARABOX con cofre integrado. Fijación pared/techo/entre paredes.",
    tipo="vertical",
)

# IGLOO
av8770 = build_catalog(
    cat_id="AV8770", nombre="AV8770 IGLOO Toldo vertical",
    prices_name="AV8770", pagina=239, motores=MOTORES_VERTICAL_NEXUS,
    sobreprecios=SOBRE_IGLOO,
    descripcion="Toldo vertical IGLOO con cofre cuadrado 120x130 mm. Varilla de retención en guías. Opción iluminación LED.",
    tipo="vertical",
)

# NIMBUS — usamos matriz override completa
nimbus_regla = [{
    "id": "motor_30Nw_linea_grande",
    "descripcion": "Motor 30Nw para línea >400",
    "efecto": "aviso",
    "mensaje": "Línea >400 cm: motor Somfy 30Nw (en lugar de 20Nw).",
    "condicion": {"linea": {"gt": 400}},
}]
av8870_1_cat = build_catalog(
    cat_id="AV8870-1", nombre="AV8870-1 NIMBUS Cable sin cofre",
    prices_name="AV8870-1", pagina=241, motores=MOTORES_NIMBUS,
    matriz_override=av8870_1, reglas_extra=nimbus_regla,
    descripcion="Vertical NIMBUS con guiado por cable Ø4 mm, sin cofre.",
)
av8870_2_cat = build_catalog(
    cat_id="AV8870-2", nombre="AV8870-2 NIMBUS Varilla sin cofre",
    prices_name="AV8870-2", pagina=241, motores=MOTORES_NIMBUS,
    matriz_override=av8870_2, reglas_extra=nimbus_regla,
    descripcion="Vertical NIMBUS con guiado por varilla Ø10 mm acero inox, sin cofre.",
)
av8890_1_cat = build_catalog(
    cat_id="AV8890-1", nombre="AV8890-1 NIMBUS Cable con cofre",
    prices_name="AV8890-1", pagina=242, motores=MOTORES_NIMBUS,
    matriz_override=av8890_1, reglas_extra=nimbus_regla,
    descripcion="Vertical NIMBUS con guiado por cable Ø4 mm y cofre 100 mm.",
    tipo="vertical",
)
av8890_2_cat = build_catalog(
    cat_id="AV8890-2", nombre="AV8890-2 NIMBUS Varilla con cofre",
    prices_name="AV8890-2", pagina=242, motores=MOTORES_NIMBUS,
    matriz_override=av8890_2, reglas_extra=nimbus_regla,
    descripcion="Vertical NIMBUS con guiado por varilla Ø10 mm acero inox y cofre 100 mm.",
    tipo="vertical",
)

todos = {
    "AV8400": av8400, "AV8410": av8410, "AV8430": av8430,
    "AV8500": av8500, "AV8510": av8510, "AV8530": av8530,
    "AV8600": av8600, "AV8610": av8610, "AV8630": av8630,
    "AV8700": av8700, "AV8710": av8710, "AV8730": av8730,
    "AV8750": av8750, "AV8770": av8770,
    "AV8870-1": av8870_1_cat, "AV8870-2": av8870_2_cat,
    "AV8890-1": av8890_1_cat, "AV8890-2": av8890_2_cat,
}

for cat_id, cat in todos.items():
    out = ROOT / f"{cat_id}.json"
    with out.open("w", encoding="utf-8") as f:
        json.dump(cat, f, indent=2, ensure_ascii=False)
    n = sum(len(v) for v in cat["tarifa"]["matriz"].values())
    print(f"✓ {out.name}  ({n} celdas)")
