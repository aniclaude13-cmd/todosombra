#!/usr/bin/env python3
"""
Bot de Telegram TodoSombra — Consultas de precios de soluciones de sombra
"""

import json
import logging
import os
import re
from pathlib import Path
from typing import Optional
from telegram import Update, ReplyKeyboardMarkup, ReplyKeyboardRemove
from telegram.ext import (
    Application, CommandHandler, MessageHandler, ConversationHandler,
    ContextTypes, filters
)

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger(__name__)

def _int_keys(d: dict) -> list:
    return sorted(int(k) for k in d.keys() if k.isdigit())

TOKEN = "8594551708:AAGoGfoBXTCTwrzYRywlVn-OaSaLBFkB10U"
DATA_FILE = Path(__file__).parent / "../awma-products-with-prices.json"
LEADS_FILE = Path(__file__).parent / "leads.json"

# Estados de conversación
(MENU, BUSCAR_PRODUCTO, SELECCIONAR_PRODUCTO, PEDIR_MEDIDAS,
 ACCIONAMIENTO, SELECCIONAR_MARCA_MOTOR, SELECCIONAR_MOTOR, COLOR, CONFIRMAR,
 CAPTAR_NOMBRE, CAPTAR_CONTACTO, CAPTAR_LOCALIDAD,
 ELEGIR_TIPO, MEDIDAS_BUSQUEDA, COMPARAR_MODELOS,
 ELEGIR_COMPLEMENTO, MEDIDA_COMPLEMENTO, COLOR_ALUMINIO,
 AÑADIR_COMPLEMENTOS, MEDIDA_COMPLEMENTO_ADICIONAL, COLOR_CATEGORIA) = range(21)

# Catálogo Sauleda PLAINS LISOS (sin incremento de precio)
CATEGORIAS_SAULEDA = {
    "⬜ Blancos y neutros": [
        "Optik", "Blanco", "Natural", "Vainilla", "Crema", "Champagne",
        "Alabastro", "Shell", "Salt", "Zurich",
    ],
    "🟤 Beiges y arenas": [
        "Caramel", "Trigo", "Arena", "Sand", "Beige", "Avena", "Toast",
        "Alamo", "Tenneré", "Gobi", "Siroco", "Integral", "Pergamino",
        "Almond", "Toffee", "Visón", "Tweed Avena", "Coco", "Maquillaje",
    ],
    "🟫 Marrones y tierras": [
        "Trufa", "Bronce", "Ocre", "Cobre", "Teja", "Terracota", "Marrón",
        "Chocolat", "Café", "Miel", "Seda", "Mármol", "Lugano", "Berna",
        "Hormigón", "Rain",
    ],
    "🟡 Amarillos y naranjas": [
        "Oro", "Mostaza", "Maiz", "Cereal", "Limón", "Lima", "Amarillo",
        "Dallas", "Melocotón", "Mandarina", "Naranja", "Salmón",
    ],
    "🔴 Rojos y granates": [
        "Azafrán", "Tomate", "Rojo", "Logo Red", "Generation Red", "Cherry",
        "Splendore", "Rioja", "Brasserie", "Granite", "Tweed Rojo", "Sandia", "Lava",
    ],
    "🌸 Rosas y lilas": [
        "Berry", "Pink", "Grape", "Maiva", "Lila", "Lavanda", "Malva",
    ],
    "🔵 Azules": [
        "Turkis", "Celeste", "Blue Mist", "Glacier", "Denim", "Bombay",
        "Indigo", "Regata", "Brisa", "Trópic", "Ocean", "Azul Real", "Azul",
        "Marino", "Admiral", "Commodore", "Jade", "Aquamarina", "Lagoon",
    ],
    "🟢 Verdes": [
        "Oliva", "Bambú", "Eucaliptus", "Cactus", "Fresh", "Musgo", "Tirol",
        "Verde Cl.", "Anis", "Confetti", "Tweed Verde", "Verde", "Botella",
        "Deep Blue", "Racing",
    ],
    "⚫ Grises y negros": [
        "Quartz", "Niebla", "Silver", "Perla", "Piedra", "Tweed Gris Cl.",
        "Tweed Perla", "Gris", "Mineral", "Basalto", "Grafito", "Antracita",
        "Carbón", "Tweed Negro", "Coal", "Negro",
    ],
}

COLORES_SAULEDA_PLAINS = {
    c.lower() for colores in CATEGORIAS_SAULEDA.values() for c in colores
}

# Mapeo tipo visible → tipo interno JSON
TIPOS_PRODUCTO = {
    "🏠 Toldo": "toldo",
    "🏗️ Pérgola": "pérgola",
    "🪟 Toldo vertical / cerramiento": "vertical",
    "📋 Palillería": "palillería",
}

# Productos excluidos de la búsqueda por tipo (se ofrecen como complemento aparte)
EXCLUIDOS_BUSQUEDA = {"TJD_TEJADILLO"}

# Complementos con precio por línea (anchura en cm)
COMPLEMENTOS_CON_PRECIO = {
    "💡 Iluminación LED": "ILUMINACIÓN",
    "🏠 Tejadillo (protección)": "TJD_TEJADILLO",
    "🪟 Costadillo lateral": "CSL_COSTADILLO_LATERAL",
}

MANDOS_POR_MARCA = {
    "somfy": {"label": "Situo 1 io", "precio": 68.50},
}

# Complementos sin precio (derivan a técnico)
COMPLEMENTOS_SIN_PRECIO = [
    "🎮 Mandos y automatismos",
    "📡 Sensores (viento, lluvia, sol)",
    "🔩 Perfiles y accesorios",
]

# Colores comunes de aluminio (teclado rápido)
COLORES_ALUMINIO_RAPIDOS = {
    "⬜ Blanco": "Blanco",
    "🔘 Gris / Plata": "Gris",
    "⚫ Antracita": "Antracita",
    "⬛ Negro": "Negro",
    "🟤 Bronce / Marrón": "Marrón",
    "✏️ Otro color": "otro",
}

def cargar_datos():
    with open(DATA_FILE, encoding="utf-8") as f:
        return json.load(f)

def guardar_lead(datos: dict):
    leads = []
    if LEADS_FILE.exists():
        with open(LEADS_FILE) as f:
            leads = json.load(f)
    leads.append(datos)
    with open(LEADS_FILE, "w") as f:
        json.dump(leads, f, ensure_ascii=False, indent=2)

def buscar_productos(query: str, datos: dict) -> list:
    query = query.lower().strip()
    resultados = []
    for p in datos["productos"]:
        if p.get("tipo") in ("categoría", "material", "accesorio", "sección", "subsección"):
            continue
        if p.get("grupo_color") is None:
            continue
        nombre = p["nombre"].lower()
        pid = p["id"].lower()
        if query in nombre or query in pid:
            resultados.append(p)
    return resultados[:8]

def tiene_precio(producto: dict) -> bool:
    pw = producto.get("precios_por_ancho")
    if not pw:
        return False
    if isinstance(pw, dict) and "estimado" in pw:
        return False
    return True

def calcular_precio(producto: dict, linea_cm: int, salida_cm: int) -> Optional[float]:
    pw = producto.get("precios_por_ancho")
    if not pw or isinstance(pw, dict) and "estimado" in pw:
        return None

    lineas_disponibles = _int_keys(pw)
    linea_key = None
    for l in lineas_disponibles:
        if l >= linea_cm:
            linea_key = str(l)
            break
    if linea_key is None:
        return None

    salidas = pw[linea_key]
    if isinstance(salidas, (int, float)):
        return float(salidas)

    salidas_disp = _int_keys(salidas)
    salida_key = None
    for s in salidas_disp:
        if s >= salida_cm:
            salida_key = str(s)
            break
    if salida_key is None:
        return None

    return float(salidas[salida_key])

def precio_color(precio_base: float, grupo: str, tipo_color: str, datos: dict) -> float:
    grupos = datos.get("grupos_color", {})
    g = grupos.get(grupo, {})
    colores = g.get("colores", [])
    for c in colores:
        if tipo_color.lower() in c["nombre"].lower():
            pct = c.get("incremento_pct", 0)
            minimo = c.get("minimo_eur", 0)
            extra = precio_base * pct / 100
            extra = max(extra, minimo - precio_base) if minimo > precio_base else extra
            return precio_base + extra
    return precio_base

def filtrar_por_tipo_y_medidas(tipo: str, linea_cm: int, salida_cm: int, datos: dict) -> list:
    """Devuelve lista de (producto, precio) compatibles con las medidas, ordenados por precio."""
    resultados = []
    for p in datos["productos"]:
        if p.get("tipo") != tipo:
            continue
        if p["id"] in EXCLUIDOS_BUSQUEDA:
            continue
        if p.get("grupo_color") is None:
            continue
        pw = p.get("precios_por_ancho")
        if not pw or (isinstance(pw, dict) and "estimado" in pw):
            continue

        lineas = _int_keys(pw)
        if linea_cm < lineas[0] or linea_cm > lineas[-1]:
            continue

        # Buscar la línea más cercana >= a la solicitada
        linea_seleccionada = None
        for l in lineas:
            if l >= linea_cm:
                linea_seleccionada = l
                break
        if linea_seleccionada is None:
            continue

        # Validar salida contra rango (salida_min, salida_max) del producto
        salida_min = p.get("salida_min")
        salida_max = p.get("salida_max")
        if salida_min is not None and salida_cm < salida_min:
            continue
        if salida_max is not None and salida_cm > salida_max:
            continue

        # Verificar que la salida existe en esa línea específica (si hay estructura de salidas)
        salidas_para_linea = pw[str(linea_seleccionada)]
        if isinstance(salidas_para_linea, dict):
            salidas_disp = _int_keys(salidas_para_linea)
            # Buscar salida >= a la solicitada
            salida_valida = False
            for s in salidas_disp:
                if s >= salida_cm:
                    salida_valida = True
                    break
            if not salida_valida:
                continue

        precio = calcular_precio(p, linea_cm, salida_cm)
        if precio is not None:
            resultados.append((p, precio))

    resultados.sort(key=lambda x: x[1] if x[1] is not None else 999999)
    return resultados

def rango_lineas(producto: dict) -> str:
    pw = producto.get("precios_por_ancho", {})
    if isinstance(pw, dict) and "estimado" not in pw:
        lineas = _int_keys(pw)
        return f"{lineas[0]}–{lineas[-1]} cm"
    return "consultar"

# ─── HANDLERS ────────────────────────────────────────────────

async def start(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    ctx.user_data.clear()
    ctx.user_data["datos"] = cargar_datos()

    teclado = [
        ["🔍 Sé exactamente qué modelo quiero"],
        ["💡 Ayúdame a elegir el mejor toldo"],
        ["🔧 Complementos y extras"],
    ]
    await update.message.reply_text(
        "☀️ *¡Hola! Bienvenido a TodoSombra*\n\n"
        "Te doy *precio exacto en 2 minutos*, sin rodeos, sin compromiso.\n\n"
        "Nuestro técnico te visitará después para confirmar medidas y agendar la instalación. ¿Por dónde vamos?",
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
    )
    return MENU

async def menu(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    opcion = update.message.text.strip()
    if "modelo" in opcion.lower() or "sé" in opcion.lower():
        await update.message.reply_text(
            "Dime el nombre o referencia del modelo (ej: *ARES*, *NEXUS 100*, *Tenxo*...)",
            parse_mode="Markdown",
            reply_markup=ReplyKeyboardRemove()
        )
        return BUSCAR_PRODUCTO
    elif "complemento" in opcion.lower() or "extra" in opcion.lower() or "accesorio" in opcion.lower():
        todas = list(COMPLEMENTOS_CON_PRECIO.keys()) + COMPLEMENTOS_SIN_PRECIO
        teclado = [[c] for c in todas]
        await update.message.reply_text(
            "¿Qué necesitas?",
            reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
        )
        return ELEGIR_COMPLEMENTO
    else:
        teclado = [[t] for t in TIPOS_PRODUCTO.keys()] + [["❓ No sé, necesito asesoramiento"]]
        await update.message.reply_text(
            "¿Qué buscas?",
            reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
        )
        return ELEGIR_TIPO

async def elegir_tipo(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    opcion = update.message.text.strip()

    if "cambiar medidas" in opcion.lower() or "medidas" in opcion.lower():
        tipo = ctx.user_data.get("tipo_busqueda")
        if tipo:
            await update.message.reply_text(
                f"📐 ¿Cuánto mide?\n\n*Línea × Salida* (ej: `350x250`)\n\n_(Línea = anchura total, Salida = cuánto sobresale)_",
                parse_mode="Markdown",
                reply_markup=ReplyKeyboardRemove()
            )
            return MEDIDAS_BUSQUEDA

    if "cambiar color" in opcion.lower() or "color" in opcion.lower():
        return await preguntar_color(update, ctx)

    if "cambiar accionamiento" in opcion.lower() or "accionamiento" in opcion.lower():
        teclado = [["☀️ Manual"], ["⚡ Con motor (Somfy)"]]
        await update.message.reply_text(
            "¿Manual o motorizado?",
            parse_mode="Markdown",
            reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
        )
        return ACCIONAMIENTO

    if "cambiar tipo" in opcion.lower() or "tipo de producto" in opcion.lower():
        teclado = [[t] for t in TIPOS_PRODUCTO.keys()]
        await update.message.reply_text(
            "¿Qué necesitas?",
            parse_mode="Markdown",
            reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
        )
        return ELEGIR_TIPO

    if "no sé" in opcion.lower() or "asesoramiento" in opcion.lower():
        ctx.user_data["motivo_derivacion"] = "Cliente necesita asesoramiento profesional"
        await update.message.reply_text(
            "Perfecto. Nuestro técnico especializado te contactará. ¿Tu nombre?",
            reply_markup=ReplyKeyboardRemove()
        )
        return CAPTAR_NOMBRE

    tipo_interno = TIPOS_PRODUCTO.get(opcion)
    if not tipo_interno:
        teclado = [[t] for t in TIPOS_PRODUCTO.keys()] + [["❓ No sé, necesito asesoramiento"]]
        await update.message.reply_text(
            "Elige una opción:",
            reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
        )
        return ELEGIR_TIPO

    ctx.user_data["tipo_busqueda"] = tipo_interno
    await update.message.reply_text(
        f"📐 ¿Cuánto mide?\n\n*Línea × Salida* (ej: `350x250`)\n\n_(Línea = ancho total, Salida = cuánto sobresale)_",
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardRemove()
    )
    return MEDIDAS_BUSQUEDA

async def medidas_busqueda(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    texto = update.message.text.strip().replace(" ", "").replace(",", ".")
    match = re.match(r"(\d+)[xX×](\d+)", texto)
    if not match:
        await update.message.reply_text(
            "No reconozco el formato. Escríbelo así: `350x250` (línea × salida en cm)",
            parse_mode="Markdown"
        )
        return MEDIDAS_BUSQUEDA

    linea = int(match.group(1))
    salida = int(match.group(2))
    ctx.user_data["linea"] = linea
    ctx.user_data["salida"] = salida

    datos = ctx.user_data["datos"]
    tipo = ctx.user_data["tipo_busqueda"]
    compatibles = filtrar_por_tipo_y_medidas(tipo, linea, salida, datos)

    if not compatibles:
        await update.message.reply_text(
            f"No encuentro modelos de ese tipo que cubran exactamente {linea}×{salida} cm.\n"
            "Puede que esas medidas requieran un presupuesto personalizado. ¿Quieres que te contacte un técnico?",
            reply_markup=ReplyKeyboardRemove()
        )
        ctx.user_data["motivo_derivacion"] = f"Sin modelo compatible: {tipo} {linea}×{salida}cm"
        return await iniciar_captacion(update, ctx)

    ctx.user_data["compatibles"] = [p for p, _ in compatibles]

    if len(compatibles) == 1:
        ctx.user_data["producto"] = compatibles[0][0]
        # Ir a confirmar_modelo directamente sin mostrar comparativa
        return await confirmar_modelo_seleccionado(update, ctx)

    # Mostrar comparativa (primeras 6 opciones por defecto)
    mostrar_todas = ctx.user_data.get("mostrar_todas_opciones", False)
    opciones_a_mostrar = compatibles if mostrar_todas else compatibles[:6]

    if mostrar_todas:
        header = f"📋 *Todas las {len(compatibles)} opciones* para {linea}×{salida} cm:\n"
    else:
        header = f"💰 *Las 6 opciones más económicas* para {linea}×{salida} cm:\n"

    lineas_msg = [header]
    teclado = []
    for i, (p, precio) in enumerate(opciones_a_mostrar, 1):
        precio_txt = f"*{precio:,.0f} €*" if precio else "consultar"
        rango = rango_lineas(p)
        icono = "🏅" if i == 1 else "✨" if i <= 3 else "📌"
        lineas_msg.append(f"\n{icono} *{i}. {p['nombre']}*")
        lineas_msg.append(f"   💶 Precio: {precio_txt}")
        lineas_msg.append(f"   📏 Línea: {rango}")
        teclado.append([p["nombre"]])

    lineas_msg.append("\n👇 *Elige el que más te guste:*")

    if not mostrar_todas and len(compatibles) > 6:
        teclado.append(["🔍 Ver todas las opciones"])
    teclado.append(["❌ Cambiar criterios"])

    await update.message.reply_text(
        "\n".join(lineas_msg),
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
    )
    return COMPARAR_MODELOS

async def comparar_modelos(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    nombre = update.message.text.strip()

    if "ver más" in nombre.lower():
        ctx.user_data["mostrar_todas_opciones"] = True
        # Volver a mostrar la comparativa con todas las opciones
        linea = ctx.user_data.get("linea", 0)
        salida = ctx.user_data.get("salida", 0)
        datos = ctx.user_data["datos"]
        tipo = ctx.user_data["tipo_busqueda"]
        compatibles = filtrar_por_tipo_y_medidas(tipo, linea, salida, datos)
        ctx.user_data["compatibles"] = [p for p, _ in compatibles]

        lineas_msg = [
            f"📋 *Todas las {len(compatibles)} opciones* para {linea}×{salida} cm:\n"
        ]
        teclado = []
        for i, (p, precio) in enumerate(compatibles, 1):
            precio_txt = f"*{precio:,.0f} €*" if precio else "consultar"
            rango = rango_lineas(p)
            icono = "🏅" if i == 1 else "✨" if i <= 3 else "📌"
            lineas_msg.append(f"\n{icono} *{i}. {p['nombre']}*")
            lineas_msg.append(f"   💶 Precio: {precio_txt}")
            lineas_msg.append(f"   📏 Línea: {rango}")
            teclado.append([p["nombre"]])

        lineas_msg.append("\n👇 *Elige el que más te guste:*")
        teclado.append(["❌ Cambiar criterios"])
        await update.message.reply_text(
            "\n".join(lineas_msg),
            parse_mode="Markdown",
            reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
        )
        return COMPARAR_MODELOS

    if "ninguno" in nombre.lower() or "cambiar" in nombre.lower():
        teclado = [["📐 Cambiar medidas"], ["🏠 Cambiar tipo de producto"], ["❓ Necesito asesoramiento"]]
        await update.message.reply_text(
            "Sin problema. ¿Qué quieres cambiar?",
            reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
        )
        return ELEGIR_TIPO

    compatibles = ctx.user_data.get("compatibles", [])
    producto = next((p for p in compatibles if p["nombre"] == nombre), None)
    if not producto:
        teclado = [[p["nombre"]] for p in compatibles] + [["❌ Ninguno, quiero cambiar los criterios"]]
        await update.message.reply_text(
            "Elige uno de los modelos de la lista:",
            reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
        )
        return COMPARAR_MODELOS

    ctx.user_data["producto"] = producto
    return await confirmar_modelo_seleccionado(update, ctx)

async def confirmar_modelo_seleccionado(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    """Continúa el flujo cuando ya tenemos producto Y medidas."""
    producto = ctx.user_data["producto"]
    linea = ctx.user_data["linea"]
    salida = ctx.user_data["salida"]

    await update.message.reply_text(
        f"✅ *{producto['nombre']}* — {linea}×{salida} cm",
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardRemove()
    )
    return await preguntar_color_aluminio(update, ctx)

async def preguntar_color_aluminio(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    teclado = [[c] for c in COLORES_ALUMINIO_RAPIDOS.keys()]
    await update.message.reply_text(
        "🎨 *¿Color de aluminio?*",
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
    )
    return COLOR_ALUMINIO

async def recibir_color_aluminio(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    texto = update.message.text.strip()

    # Si es "otro color", pedir que lo escriba
    if "otro" in texto.lower() or "✏️" in texto:
        await update.message.reply_text(
            "Escribe el color o referencia RAL que deseas:",
            parse_mode="Markdown",
            reply_markup=ReplyKeyboardRemove()
        )
        ctx.user_data["_esperando_color_personalizado"] = True
        return COLOR_ALUMINIO

    # Si ya había seleccionado "otro" antes, procesar el color escrito
    if ctx.user_data.get("_esperando_color_personalizado"):
        color_aluminio = texto
        ctx.user_data.pop("_esperando_color_personalizado", None)
    else:
        # Convertir del teclado rápido a nombre limpio
        color_aluminio = COLORES_ALUMINIO_RAPIDOS.get(texto, texto)

    ctx.user_data["color_aluminio"] = color_aluminio

    producto = ctx.user_data["producto"]
    datos = ctx.user_data["datos"]
    grupo = producto.get("grupo_color")

    incremento_ral = 0
    minimo_ral = 0

    if grupo and grupo in datos.get("grupos_color", {}):
        g = datos["grupos_color"][grupo]
        colores = g.get("colores", [])
        for c in colores:
            if color_aluminio.lower() in c["nombre"].lower():
                incremento_ral = c.get("incremento_pct", 0)
                minimo_ral = c.get("minimo_eur", 0)
                break

    ctx.user_data["incremento_ral_pct"] = incremento_ral
    ctx.user_data["minimo_ral_eur"] = minimo_ral

    teclado = [["☀️ Manual"], ["⚡ Con motor (Somfy)"]]
    await update.message.reply_text(
        "⚙️ *¿Manual o con motor?*",
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
    )
    return ACCIONAMIENTO

# ─── FLUJO COMPLEMENTOS ──────────────────────────────────────

async def elegir_complemento(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    opcion = update.message.text.strip()

    # Complemento con precio por línea
    if opcion in COMPLEMENTOS_CON_PRECIO:
        ctx.user_data["complemento_id"] = COMPLEMENTOS_CON_PRECIO[opcion]
        ctx.user_data["complemento_nombre"] = opcion
        await update.message.reply_text(
            f"Perfecto. ¿Cuál es la *línea* (anchura) en centímetros?\n"
            f"_(ej: `350`)_",
            parse_mode="Markdown",
            reply_markup=ReplyKeyboardRemove()
        )
        return MEDIDA_COMPLEMENTO

    # Complemento sin precio → captura lead
    if opcion in COMPLEMENTOS_SIN_PRECIO:
        ctx.user_data["motivo_derivacion"] = f"Consulta complemento: {opcion}"
        await update.message.reply_text(
            f"Para *{opcion}* el precio depende del modelo exacto de tu instalación. "
            f"Uno de nuestros técnicos te preparará la cotización sin compromiso.\n\n"
            f"👤 ¿Cómo te llamas?",
            parse_mode="Markdown",
            reply_markup=ReplyKeyboardRemove()
        )
        return CAPTAR_NOMBRE

    # Opción no reconocida
    todas = list(COMPLEMENTOS_CON_PRECIO.keys()) + COMPLEMENTOS_SIN_PRECIO
    teclado = [[c] for c in todas]
    await update.message.reply_text(
        "Elige una opción del menú:",
        reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
    )
    return ELEGIR_COMPLEMENTO

async def medida_complemento(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    texto = update.message.text.strip().replace(" ", "").replace(",", ".")
    match = re.match(r"(\d+)", texto)
    if not match:
        await update.message.reply_text(
            "Escribe solo la anchura en cm (ej: `350`)",
            parse_mode="Markdown"
        )
        return MEDIDA_COMPLEMENTO

    linea = int(match.group(1))
    datos = ctx.user_data["datos"]
    pid = ctx.user_data["complemento_id"]
    nombre = ctx.user_data["complemento_nombre"]

    producto = next((p for p in datos["productos"] if p["id"] == pid), None)
    if not producto:
        await update.message.reply_text("No encuentro ese complemento en la tarifa. Contacta con nuestro equipo técnico.")
        return ConversationHandler.END

    precio = calcular_precio(producto, linea, 0)

    if precio is None:
        ctx.user_data["motivo_derivacion"] = f"{nombre} {linea}cm — fuera de tabla"
        await update.message.reply_text(
            f"No tengo precio para {nombre} a {linea} cm en la tarifa.\n"
            "¿Quieres que nuestros técnicos te preparen una cotización?",
            reply_markup=ReplyKeyboardRemove()
        )
        return await iniciar_captacion(update, ctx)

    teclado = [["✅ Contactar con técnico"], ["❌ Ver otras opciones"]]
    await update.message.reply_text(
        f"✨ *{nombre}*\n"
        f"📐 Ancho: *{linea} cm*\n\n"
        f"💰 *Precio orientativo: {precio:,.0f} €*\n\n"
        f"💡 Este complemento mejora significativamente tu solución de sombra.\n\n"
        f"¿Quieres que un especialista te asesore sobre cómo integrarlo?",
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
    )
    ctx.user_data["precio_calculado"] = precio
    ctx.user_data["motivo_derivacion"] = f"Complemento: {nombre} {linea}cm"
    return CONFIRMAR

# ─── FLUJO POR NOMBRE DE MODELO (original) ──────────────────

async def buscar(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    query = update.message.text.strip()
    datos = ctx.user_data["datos"]
    resultados = buscar_productos(query, datos)

    if not resultados:
        await update.message.reply_text(
            "No encuentro ese producto en la tarifa. "
            "¿Quieres que uno de nuestros técnicos te prepare una cotización personalizada? (sí/no)"
        )
        ctx.user_data["motivo_derivacion"] = f"Producto no encontrado: {query}"
        return CAPTAR_NOMBRE

    if len(resultados) == 1:
        ctx.user_data["producto"] = resultados[0]
        return await pedir_medidas_directo(update, ctx)

    ctx.user_data["resultados"] = resultados
    teclado = [[p["nombre"]] for p in resultados]
    await update.message.reply_text(
        "Encontré varios productos. ¿Cuál te interesa?",
        reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
    )
    return SELECCIONAR_PRODUCTO

async def seleccionar_producto(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    nombre = update.message.text.strip()
    resultados = ctx.user_data.get("resultados", [])
    producto = next((p for p in resultados if p["nombre"] == nombre), None)
    if not producto:
        await update.message.reply_text("No reconozco esa opción. Escribe el nombre exacto.")
        return SELECCIONAR_PRODUCTO
    ctx.user_data["producto"] = producto
    return await pedir_medidas_directo(update, ctx)

async def pedir_medidas_directo(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    producto = ctx.user_data["producto"]
    await update.message.reply_text(
        f"✅ *{producto['nombre']}*\n\n"
        "📐 Medidas: *Línea × Salida* (ej: `350x250`)",
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardRemove()
    )
    return PEDIR_MEDIDAS

async def recibir_medidas(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    texto = update.message.text.strip().replace(" ", "").replace(",", ".")
    match = re.match(r"(\d+)[xX×](\d+)", texto)
    if not match:
        await update.message.reply_text(
            "Formato: `350x250` (línea × salida en cm)",
            parse_mode="Markdown"
        )
        return PEDIR_MEDIDAS

    linea = int(match.group(1))
    salida = int(match.group(2))

    producto = ctx.user_data.get("producto")
    if producto:
        pw = producto.get("precios_por_ancho", {})
        if pw and not (isinstance(pw, dict) and "estimado" in pw):
            lineas = _int_keys(pw)
            if linea < lineas[0] or linea > lineas[-1]:
                rango = rango_lineas(producto)
                await update.message.reply_text(
                    f"⚠️ La línea {linea}cm está fuera del rango de *{producto['nombre']}*.\n\n_Disponible: {rango}_",
                    parse_mode="Markdown"
                )
                return PEDIR_MEDIDAS

            salida_min = producto.get("salida_min")
            salida_max = producto.get("salida_max")
            if salida_min is not None and salida < salida_min:
                await update.message.reply_text(
                    f"⚠️ Salida mínima para este modelo: {salida_min}cm",
                    parse_mode="Markdown"
                )
                return PEDIR_MEDIDAS
            if salida_max is not None and salida > salida_max:
                await update.message.reply_text(
                    f"⚠️ Salida máxima para este modelo: {salida_max}cm",
                    parse_mode="Markdown"
                )
                return PEDIR_MEDIDAS

            linea_seleccionada = None
            for l in lineas:
                if l >= linea:
                    linea_seleccionada = l
                    break

            if linea_seleccionada:
                salidas_para_linea = pw[str(linea_seleccionada)]
                if isinstance(salidas_para_linea, dict):
                    salidas_disp = _int_keys(salidas_para_linea)
                    salida_valida = any(s >= salida for s in salidas_disp)
                    if not salida_valida:
                        max_salida = salidas_disp[-1]
                        await update.message.reply_text(
                            f"⚠️ Salida máxima disponible: {max_salida}cm",
                            parse_mode="Markdown"
                        )
                        return PEDIR_MEDIDAS

    ctx.user_data["linea"] = linea
    ctx.user_data["salida"] = salida

    teclado = [[c] for c in COLORES_ALUMINIO_RAPIDOS.keys()]
    await update.message.reply_text(
        "🎨 *¿Color de aluminio?*",
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
    )
    return COLOR_ALUMINIO



# ─── FLUJO COMPARTIDO ────────────────────────────────────────

async def accionamiento(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    opcion = update.message.text.strip()
    ctx.user_data["motorizado"] = "motor" in opcion.lower()

    if ctx.user_data["motorizado"]:
        producto = ctx.user_data["producto"]
        datos = ctx.user_data["datos"]
        grupo_motor = producto.get("grupo_motor")
        tiene_somfy = grupo_motor and str(grupo_motor) in datos.get("grupos_motor", {})

        if tiene_somfy:
            await update.message.reply_text(
                "✅ Este modelo tiene motores Somfy disponibles. ¿Cuál te interesa?",
                parse_mode="Markdown",
                reply_markup=ReplyKeyboardRemove()
            )
            gm = datos["grupos_motor"][str(grupo_motor)]
            motores = gm.get("motores_somfy", [])
            teclado = [[m] for m in motores]
            mando_info = MANDOS_POR_MARCA["somfy"]
            await update.message.reply_text(
                f"_(Mando {mando_info['label']} incluido: +{mando_info['precio']:.2f}€)_",
                parse_mode="Markdown",
                reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
            )
            return SELECCIONAR_MOTOR
        else:
            ctx.user_data["marca_motor"] = "somfy"
            ctx.user_data["preferencia_motor"] = "Motor recomendado"
            return await preguntar_color(update, ctx)

    return await preguntar_color(update, ctx)

async def seleccionar_marca_motor(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    opcion = update.message.text.strip()

    if "somfy" in opcion.lower():
        ctx.user_data["marca_motor"] = "somfy"
        producto = ctx.user_data["producto"]
        datos = ctx.user_data["datos"]
        grupo_motor = producto.get("grupo_motor")

        if grupo_motor and str(grupo_motor) in datos.get("grupos_motor", {}):
            gm = datos["grupos_motor"][str(grupo_motor)]
            motores = gm.get("motores_somfy", [])
            teclado = [[m] for m in motores]
            mando_info = MANDOS_POR_MARCA["somfy"]
            await update.message.reply_text(
                f"✅ *Motor Somfy*\n\n"
                f"Elige el motor compatible con tu producto:\n\n"
                f"_(El mando {mando_info['label']} se incluye automáticamente: +{mando_info['precio']:.2f} €)_",
                parse_mode="Markdown",
                reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
            )
            return SELECCIONAR_MOTOR
        else:
            await update.message.reply_text(
                "Para la motorización Somfy de este producto, nuestros técnicos te asesorarán sobre el motor más adecuado.",
                reply_markup=ReplyKeyboardRemove()
            )
    else:
        ctx.user_data["marca_motor"] = "otra"
        ctx.user_data["preferencia_motor"] = "Otra marca"
        await update.message.reply_text(
            "🔧 *Otra marca de motor*\n\n"
            "Nuestros técnicos te asesorarán sobre las opciones disponibles y su precio. "
            "Continuamos con el precio base del producto.",
            parse_mode="Markdown",
            reply_markup=ReplyKeyboardRemove()
        )

    producto = ctx.user_data.get("producto", {})
    if producto.get("tipo") == "toldo":
        return await preguntar_tipo_motor(update, ctx)
    return await preguntar_color(update, ctx)

async def seleccionar_motor(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    ctx.user_data["preferencia_motor"] = update.message.text.strip()
    producto = ctx.user_data.get("producto", {})
    if producto.get("tipo") == "toldo":
        return await preguntar_tipo_motor(update, ctx)
    return await preguntar_color(update, ctx)

async def preguntar_color(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    teclado = [[cat] for cat in CATEGORIAS_SAULEDA.keys()]
    teclado.append(["✏️ Otro tejido"])
    await update.message.reply_text(
        "🧵 *Color de tejido*\n\n"
        "Elige una gama de color del catálogo Sauleda PLAINS:",
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
    )
    return COLOR_CATEGORIA

async def recibir_categoria_color(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    seleccion = update.message.text.strip()

    if seleccion == "✏️ Otro tejido":
        await update.message.reply_text(
            "✏️ *Escribe el color o tejido que deseas:*\n\n"
            "_(Si no está en el catálogo PLAINS Sauleda, puede llevar incremento de precio)_",
            parse_mode="Markdown",
            reply_markup=ReplyKeyboardRemove()
        )
        ctx.user_data["color_fuera_lista"] = True
        return COLOR

    categoria = CATEGORIAS_SAULEDA.get(seleccion)
    if not categoria:
        return await preguntar_color(update, ctx)

    teclado = [[c] for c in categoria]
    teclado.append(["↩️ Otras categorías"])
    await update.message.reply_text(
        f"🎨 *{seleccion}*\n\nElige tu color:",
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
    )
    return COLOR

async def recibir_color(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    color_tejido = update.message.text.strip()

    if color_tejido == "↩️ Otras categorías":
        return await preguntar_color(update, ctx)

    ctx.user_data["color_tejido"] = color_tejido

    fuera_lista = ctx.user_data.pop("color_fuera_lista", False)
    es_estandar = not fuera_lista and color_tejido.lower() in COLORES_SAULEDA_PLAINS
    ctx.user_data["es_awma"] = es_estandar

    if es_estandar:
        await update.message.reply_text(
            f"✅ *{color_tejido}* — catálogo PLAINS Sauleda\n"
            "Sin incremento de precio.",
            parse_mode="Markdown",
            reply_markup=ReplyKeyboardRemove()
        )
    else:
        await update.message.reply_text(
            f"⚠️ *{color_tejido}* — color personalizado\n"
            "El técnico confirmará si lleva incremento.",
            parse_mode="Markdown",
            reply_markup=ReplyKeyboardRemove()
        )

    return await mostrar_resumen(update, ctx)

async def mostrar_resumen(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    datos = ctx.user_data["datos"]
    producto = ctx.user_data["producto"]
    linea = ctx.user_data.get("linea", 0)
    salida = ctx.user_data.get("salida", 0)
    motorizado = ctx.user_data.get("motorizado", False)
    tipo_color = ctx.user_data.get("tipo_color", "estándar")
    tejido = ctx.user_data.get("tejido")

    precio_base = calcular_precio(producto, linea, salida)

    if precio_base is None:
        await update.message.reply_text(
            f"📋 *{producto['nombre']}* — {linea}×{salida} cm\n\n"
            "No tengo precio exacto para esa combinación de medidas en la tarifa.\n"
            "¿Quieres que nuestros técnicos te preparen una cotización personalizada?",
            parse_mode="Markdown",
            reply_markup=ReplyKeyboardRemove()
        )
        ctx.user_data["motivo_derivacion"] = (
            f"{producto['nombre']} {linea}×{salida}cm — medidas fuera de tabla"
        )
        return await iniciar_captacion(update, ctx)

    # Calcular incremento de color RAL (con mínimo si aplica)
    incremento_ral_pct = ctx.user_data.get("incremento_ral_pct", 0)
    minimo_ral_eur = ctx.user_data.get("minimo_ral_eur", 0)
    incremento_ral_euros = 0
    if incremento_ral_pct > 0:
        incremento_ral_euros = precio_base * incremento_ral_pct / 100
        # Aplicar el mínimo si existe
        if minimo_ral_eur > 0:
            incremento_ral_euros = max(incremento_ral_euros, minimo_ral_eur)

    # Calcular precio del mando según marca de motor
    precio_mando = 0
    marca_motor = ctx.user_data.get("marca_motor", "somfy") if motorizado else None
    if motorizado and marca_motor in MANDOS_POR_MARCA:
        precio_mando = MANDOS_POR_MARCA[marca_motor]["precio"]

    precio_final = precio_base + incremento_ral_euros + precio_mando

    lineas_resumen = [
        f"━━━━━━━━━━━━━━━━━━━━━━━",
        f"🎯 *TU PRESUPUESTO*",
        f"━━━━━━━━━━━━━━━━━━━━━━━\n",
        f"🏆 *Modelo:* {producto['nombre']}",
        f"📏 *Medidas:* {linea} × {salida} cm",
        f"🎨 *Aluminio:* {ctx.user_data.get('color_aluminio', '—')}",
    ]
    marca_label = (ctx.user_data.get("marca_motor", "somfy") or "somfy").capitalize()
    lineas_resumen.append(f"⚙️ *Accionamiento:* {'⚡ Motor ' + marca_label if motorizado else '☀️ Manual'}")
    if motorizado and ctx.user_data.get("preferencia_motor"):
        pref = ctx.user_data["preferencia_motor"]
        if "sin preferencia" not in pref.lower() and "otra marca" not in pref.lower():
            lineas_resumen.append(f"🎛️ *Motor:* {pref}")
    color_tejido = ctx.user_data.get("color_tejido", "—")
    es_awma = ctx.user_data.get("es_awma", False)
    awma_label = "✅ Sin incremento" if es_awma else "⚠️ Con posible incremento (técnico confirma)"
    lineas_resumen.append(f"🧵 *Tejido:* {color_tejido} — {awma_label}")

    lineas_resumen.extend([
        f"\n━━━━━━━━━━━━━━━━━━━━━━━",
        f"💰 *DESGLOSE*",
    ])

    lineas_resumen.append(f"• Producto base: {precio_base:,.0f} €")
    if incremento_ral_pct > 0:
        lineas_resumen.append(f"• Incremento RAL (+{incremento_ral_pct}%): +{incremento_ral_euros:,.0f} €")
    if motorizado and precio_mando > 0:
        mando_info = MANDOS_POR_MARCA.get(ctx.user_data.get("marca_motor", "somfy"), {})
        mando_tipo = mando_info.get("label", "Mando")
        lineas_resumen.append(f"• Mando {mando_tipo} (incluido): +{precio_mando:,.2f} €")

    lineas_resumen.append(f"━━━━━━━━━━━━━━━━━━━━━━━")
    lineas_resumen.append(f"📊 *Subtotal:* {precio_final:,.0f} €")

    iva = precio_final * 0.21
    total_con_iva = precio_final + iva
    lineas_resumen.append(f"📋 *IVA (21%):* +{iva:,.0f} €")
    lineas_resumen.append(f"━━━━━━━━━━━━━━━━━━━━━━━")
    lineas_resumen.append(f"💰 *TOTAL: {total_con_iva:,.0f} €*")

    if producto.get("tipo") == "toldo":
        nombre_producto = producto.get("nombre", "").upper()
        es_box = "BOX" in nombre_producto or "BX" in nombre_producto
        if not es_box:
            lineas_resumen.append(
                f"\n💡 _Recuerda añadir el tejadillo para proteger el tejido cuando no se use._"
            )

    lineas_resumen.extend([
        f"\n_Precio orientativo. El técnico confirma las medidas y cierra el presupuesto final, sin compromiso._",
    ])

    texto = "\n".join(lineas_resumen)

    teclado = [["✅ Sí, quiero la visita"], ["🔧 Añadir complementos"], ["❌ Cambiar algo"]]
    await update.message.reply_text(
        texto,
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
    )
    ctx.user_data["precio_calculado"] = precio_final
    ctx.user_data["precio_con_iva"] = total_con_iva
    return CONFIRMAR

async def confirmar(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    respuesta = update.message.text.strip().lower()

    if "complemento" in respuesta or "🔧" in respuesta:
        return await preguntar_complementos_adicionales(update, ctx)

    if "cambiar" in respuesta or "❌" in respuesta:
        teclado = [
            ["📐 Cambiar medidas"],
            ["🎨 Cambiar color"],
            ["⚙️ Cambiar accionamiento"],
            ["🧵 Cambiar tejido"],
            ["🏠 Cambiar tipo de producto"],
        ]
        await update.message.reply_text(
            "¿Qué quieres cambiar?",
            reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
        )
        return ELEGIR_TIPO

    # "Sí, quiero la visita" → directo a captación
    ctx.user_data["motivo_derivacion"] = "Solicita visita tras ver presupuesto"
    return await iniciar_captacion(update, ctx)


async def preguntar_complementos_adicionales(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    teclado = [
        ["💡 Iluminación LED"],
        ["🪟 Costadillo lateral"],
    ]

    producto = ctx.user_data.get("producto", {})
    nombre_producto = producto.get("nombre", "").upper()
    es_box = "BOX" in nombre_producto or "BX" in nombre_producto

    if not es_box:
        teclado.insert(0, ["🏠 Tejadillo protector"])

    teclado.append(["✅ Listo, pasar al técnico"])

    await update.message.reply_text(
        "¿Qué extras quieres añadir?",
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
    )
    return AÑADIR_COMPLEMENTOS


async def añadir_complementos(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    opcion = update.message.text.strip()
    opcion_lower = opcion.lower()

    if "listo" in opcion_lower or "pasar" in opcion_lower or "✅" in opcion or "no" in opcion_lower[:3]:
        ctx.user_data["motivo_derivacion"] = "Solicita visita tras presupuesto"
        return await iniciar_captacion(update, ctx)

    if "iluminación" in opcion_lower or "tejadillo" in opcion_lower or "costadillo" in opcion_lower:
        ctx.user_data["complemento_adicional_nombre"] = opcion
        await update.message.reply_text(
            f"¿Anchura del *{opcion}* en cm? (ej: `350`)",
            parse_mode="Markdown",
            reply_markup=ReplyKeyboardRemove()
        )
        return MEDIDA_COMPLEMENTO_ADICIONAL

    ctx.user_data["complemento_adicional_nombre"] = opcion
    await update.message.reply_text(
        f"✅ {opcion} apuntado. ¿Algo más?",
        reply_markup=ReplyKeyboardMarkup(
            [["Sí, otro extra"], ["✅ Listo, pasar al técnico"]],
            one_time_keyboard=True,
            resize_keyboard=True
        )
    )
    return AÑADIR_COMPLEMENTOS


async def medida_complemento_adicional(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    texto = update.message.text.strip().replace(" ", "").replace(",", ".")
    match = re.match(r"(\d+)", texto)
    if not match:
        await update.message.reply_text(
            "Escribe solo la anchura en cm (ej: `350`)",
            parse_mode="Markdown"
        )
        return MEDIDA_COMPLEMENTO_ADICIONAL

    linea = int(match.group(1))
    datos = ctx.user_data["datos"]
    nombre = ctx.user_data.get("complemento_adicional_nombre", "Complemento")

    # Buscar precio del complemento
    complemento_id = None
    for clave, valor in COMPLEMENTOS_CON_PRECIO.items():
        if nombre.lower() in clave.lower():
            complemento_id = valor
            break

    if complemento_id:
        producto = next((p for p in datos["productos"] if p["id"] == complemento_id), None)
        if producto:
            precio = calcular_precio(producto, linea, 0)
            if precio:
                # Guardar el complemento con precio
                ctx.user_data["precio_complemento_adicional"] = precio
                await update.message.reply_text(
                    f"✅ {nombre} a {linea}cm: *{precio:,.0f} €*\n\n"
                    f"¿Quieres añadir otro complemento?",
                    parse_mode="Markdown",
                    reply_markup=ReplyKeyboardMarkup(
                        [["Sí, otro complemento"], ["❌ No, continuar"]],
                        one_time_keyboard=True,
                        resize_keyboard=True
                    )
                )
                return AÑADIR_COMPLEMENTOS

    # Si no hay precio, guardar de todas formas
    ctx.user_data["complemento_adicional_linea"] = linea
    await update.message.reply_text(
        f"✅ {nombre} a {linea}cm será incluido en tu presupuesto.\n\n"
        f"¿Quieres añadir otro complemento?",
        reply_markup=ReplyKeyboardMarkup(
            [["Sí, otro complemento"], ["❌ No, continuar"]],
            one_time_keyboard=True,
            resize_keyboard=True
        )
    )
    return AÑADIR_COMPLEMENTOS

async def captar_datos_ficha_tecnica(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    """Captura datos para enviar ficha técnica del producto seleccionado."""
    producto = ctx.user_data.get("producto", {})
    linea = ctx.user_data.get("linea", "—")
    salida = ctx.user_data.get("salida", "—")

    await update.message.reply_text(
        f"🎯 *Excelente elección: {producto.get('nombre')}*\n\n"
        f"📐 Medidas: {linea} × {salida} cm\n\n"
        f"📄 Te enviaremos la *ficha técnica y especificaciones técnicas* del producto.\n\n"
        f"Para ello, necesitamos tus datos:\n\n"
        f"👤 *¿Cuál es tu nombre?*",
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardRemove()
    )
    ctx.user_data["flujo_ficha_tecnica"] = True
    return CAPTAR_NOMBRE

async def iniciar_captacion(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    precio_final_total = ctx.user_data.get("precio_con_iva", 0)
    if precio_final_total == 0:
        precio_final_total = ctx.user_data.get("precio_calculado", 0)

    precio_complemento = ctx.user_data.get("precio_complemento_adicional", 0)
    if precio_complemento > 0:
        precio_final_total += precio_complemento

    ctx.user_data["precio_final_total"] = precio_final_total

    await update.message.reply_text(
        "👍 Genial. Te paso con nuestro técnico para que confirme medidas en tu casa y te entregue el presupuesto final.\n\n"
        "👤 *¿Cómo te llamas?*",
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardRemove()
    )
    return CAPTAR_NOMBRE

async def captar_nombre(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    ctx.user_data["lead_nombre"] = update.message.text.strip()
    nombre = ctx.user_data["lead_nombre"]
    await update.message.reply_text(
        f"Encantado, {nombre} 👋\n\n"
        f"📱 *¿Tu teléfono?*\n"
        f"_(Mejor que el email — así te llamamos en seguida)_",
        parse_mode="Markdown"
    )
    return CAPTAR_CONTACTO

async def captar_contacto(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    contacto = update.message.text.strip()
    ctx.user_data["lead_contacto"] = contacto

    await update.message.reply_text(
        "📍 *¿En qué zona estás?*\n"
        "_(Ej: Cartagena, La Manga, Mazarrón...)_",
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardRemove()
    )
    return CAPTAR_LOCALIDAD

async def captar_localidad(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    localidad = update.message.text.strip()
    nombre = ctx.user_data.get("lead_nombre", "desconocido")
    contacto = ctx.user_data.get("lead_contacto", "—")
    producto = ctx.user_data.get("producto", {})
    linea = ctx.user_data.get("linea", "—")
    salida = ctx.user_data.get("salida", "—")
    motorizado = ctx.user_data.get("motorizado", False)
    color = ctx.user_data.get("tipo_color", "—")
    tejido = ctx.user_data.get("tejido", "—")
    precio = ctx.user_data.get("precio_calculado")
    motivo = ctx.user_data.get("motivo_derivacion", "")
    es_ficha_tecnica = ctx.user_data.get("flujo_ficha_tecnica", False)

    lead = {
        "nombre": nombre,
        "contacto": contacto,
        "localidad": localidad,
        "producto": producto.get("nombre", "—"),
        "medidas": f"{linea}×{salida} cm" if linea != "—" else "—",
        "color_aluminio": ctx.user_data.get("color_aluminio"),
        "incremento_ral_pct": ctx.user_data.get("incremento_ral_pct", 0),
        "motorizado": motorizado,
        "marca_motor": ctx.user_data.get("marca_motor"),
        "preferencia_motor": ctx.user_data.get("preferencia_motor"),
        "color_tejido": ctx.user_data.get("color_tejido"),
        "es_awma": ctx.user_data.get("es_awma"),
        "precio_base_orientativo": precio,
        "precio_final_orientativo": ctx.user_data.get("precio_calculado"),
        "precio_con_iva": ctx.user_data.get("precio_con_iva"),
        "complemento_adicional": ctx.user_data.get("complemento_adicional_nombre"),
        "precio_complemento": ctx.user_data.get("precio_complemento_adicional", 0),
        "precio_total_con_complementos": ctx.user_data.get("precio_final_total"),
        "motivo": motivo,
        "flujo_ficha_tecnica": es_ficha_tecnica,
        "telegram_user": update.effective_user.username or str(update.effective_user.id),
    }
    guardar_lead(lead)

    await update.message.reply_text(
        f"✅ *¡Listo, {nombre}!*\n\n"
        f"📞 Te llamamos en *menos de 24h laborales* para concertar la visita gratuita.\n\n"
        f"📍 Zona: {localidad}\n"
        f"📱 Contacto: {contacto}\n\n"
        f"_Si necesitas algo antes, escríbenos por aquí mismo._ ☀️",
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardRemove()
    )
    return ConversationHandler.END

async def cancelar(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    await update.message.reply_text(
        "❌ Consulta cancelada.\n\n"
        "Si cambias de idea, escribe /start cuando quieras volver. "
        "Estamos aquí para ayudarte ☀️",
        reply_markup=ReplyKeyboardRemove()
    )
    return ConversationHandler.END

async def ayuda(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "ℹ️ *TodoSombra Bot*\n\n"
        "Consulta precios orientativos de toldos, pérgolas y cerramientos AWMA 2026.\n\n"
        "• /start — Iniciar consulta de precio\n"
        "• /cancelar — Cancelar y salir\n\n"
        "_Para presupuesto exacto, nuestros técnicos te visitarán sin compromiso._",
        parse_mode="Markdown"
    )

def main():
    app = Application.builder().token(TOKEN).build()

    conv = ConversationHandler(
        entry_points=[CommandHandler("start", start)],
        states={
            MENU: [MessageHandler(filters.TEXT & ~filters.COMMAND, menu)],
            BUSCAR_PRODUCTO: [MessageHandler(filters.TEXT & ~filters.COMMAND, buscar)],
            SELECCIONAR_PRODUCTO: [MessageHandler(filters.TEXT & ~filters.COMMAND, seleccionar_producto)],
            PEDIR_MEDIDAS: [MessageHandler(filters.TEXT & ~filters.COMMAND, recibir_medidas)],
            ELEGIR_TIPO: [MessageHandler(filters.TEXT & ~filters.COMMAND, elegir_tipo)],
            MEDIDAS_BUSQUEDA: [MessageHandler(filters.TEXT & ~filters.COMMAND, medidas_busqueda)],
            COMPARAR_MODELOS: [MessageHandler(filters.TEXT & ~filters.COMMAND, comparar_modelos)],
            COLOR_ALUMINIO: [MessageHandler(filters.TEXT & ~filters.COMMAND, recibir_color_aluminio)],
            ACCIONAMIENTO: [MessageHandler(filters.TEXT & ~filters.COMMAND, accionamiento)],
            SELECCIONAR_MARCA_MOTOR: [MessageHandler(filters.TEXT & ~filters.COMMAND, seleccionar_marca_motor)],
            SELECCIONAR_MOTOR: [MessageHandler(filters.TEXT & ~filters.COMMAND, seleccionar_motor)],
            COLOR_CATEGORIA: [MessageHandler(filters.TEXT & ~filters.COMMAND, recibir_categoria_color)],
            COLOR: [MessageHandler(filters.TEXT & ~filters.COMMAND, recibir_color)],
            CONFIRMAR: [MessageHandler(filters.TEXT & ~filters.COMMAND, confirmar)],
            CAPTAR_NOMBRE: [MessageHandler(filters.TEXT & ~filters.COMMAND, captar_nombre)],
            CAPTAR_CONTACTO: [MessageHandler(filters.TEXT & ~filters.COMMAND, captar_contacto)],
            CAPTAR_LOCALIDAD: [MessageHandler(filters.TEXT & ~filters.COMMAND, captar_localidad)],
            ELEGIR_COMPLEMENTO: [MessageHandler(filters.TEXT & ~filters.COMMAND, elegir_complemento)],
            MEDIDA_COMPLEMENTO: [MessageHandler(filters.TEXT & ~filters.COMMAND, medida_complemento)],
            AÑADIR_COMPLEMENTOS: [MessageHandler(filters.TEXT & ~filters.COMMAND, añadir_complementos)],
            MEDIDA_COMPLEMENTO_ADICIONAL: [MessageHandler(filters.TEXT & ~filters.COMMAND, medida_complemento_adicional)],
        },
        fallbacks=[CommandHandler("cancelar", cancelar)],
        allow_reentry=True,
    )

    app.add_handler(conv)
    app.add_handler(CommandHandler("ayuda", ayuda))
    app.add_handler(CommandHandler("help", ayuda))

    logger.info("Bot TodoSombra arrancado.")
    app.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
