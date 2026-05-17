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

TOKEN = "8594551708:AAGoGfoBXTCTwrzYRywlVn-OaSaLBFkB10U"
DATA_FILE = Path(__file__).parent / "../awma-products-with-prices.json"
LEADS_FILE = Path(__file__).parent / "leads.json"

# Estados de conversación
(MENU, BUSCAR_PRODUCTO, SELECCIONAR_PRODUCTO, PEDIR_MEDIDAS,
 ACCIONAMIENTO, SELECCIONAR_MOTOR, COLOR, TEJIDO, CONFIRMAR,
 CAPTAR_NOMBRE, CAPTAR_CONTACTO, CAPTAR_LOCALIDAD,
 ELEGIR_TIPO, MEDIDAS_BUSQUEDA, COMPARAR_MODELOS,
 ELEGIR_COMPLEMENTO, MEDIDA_COMPLEMENTO, TIPO_ESTRUCTURA, COLOR_ALUMINIO,
 AÑADIR_COMPLEMENTOS, MEDIDA_COMPLEMENTO_ADICIONAL) = range(21)

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
    "🏠 Tejadillo (cubrición protectora)": "TJD_TEJADILLO",
    "🪟 Costadillo lateral": "CSL_COSTADILLO_LATERAL",
}
# Complementos que derivan a técnico
COMPLEMENTOS_SIN_PRECIO = [
    "🎮 Mandos y automatismos",
    "📡 Sensores (viento, lluvia, sol)",
    "🔩 Perfiles, terminales y casquillos",
    "🔧 Otros accesorios",
]

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

    lineas_disponibles = sorted([int(k) for k in pw.keys()])
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

    salidas_disp = sorted([int(k) for k in salidas.keys()])
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

        lineas = sorted([int(k) for k in pw.keys()])
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
            salidas_disp = sorted([int(k) for k in salidas_para_linea.keys()])
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
    return resultados[:6]

def rango_lineas(producto: dict) -> str:
    pw = producto.get("precios_por_ancho", {})
    if isinstance(pw, dict) and "estimado" not in pw:
        lineas = sorted([int(k) for k in pw.keys()])
        return f"{lineas[0]}–{lineas[-1]} cm"
    return "consultar"

# ─── HANDLERS ────────────────────────────────────────────────

async def start(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    ctx.user_data.clear()
    ctx.user_data["datos"] = cargar_datos()

    teclado = [
        ["🔍 Sé el modelo que quiero"],
        ["💡 Ayúdame a elegir modelo"],
        ["🔧 Complementos y accesorios"],
    ]
    await update.message.reply_text(
        "☀️ *¡Bienvenido a TodoSombra!*\n\n"
        "🏆 Somos especialistas en *soluciones de sombra* — toldos, pérgolas, cerramientos y complementos para tu hogar.\n\n"
        "⚡ En 2 minutos te daré el *precio orientativo* exacto de tu proyecto sin compromiso.\n\n"
        "¿Por dónde empezamos?",
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
    )
    return MENU

async def menu(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    opcion = update.message.text.strip()
    if "modelo que quiero" in opcion.lower() or "sé el" in opcion.lower():
        await update.message.reply_text(
            "¿Qué modelo te interesa? Escribe el nombre o referencia (ej: *ARES*, *NEXUS 100*, *Tenxo*...)",
            parse_mode="Markdown",
            reply_markup=ReplyKeyboardRemove()
        )
        return BUSCAR_PRODUCTO
    elif "complemento" in opcion.lower() or "accesorio" in opcion.lower():
        todas = list(COMPLEMENTOS_CON_PRECIO.keys()) + COMPLEMENTOS_SIN_PRECIO
        teclado = [[c] for c in todas]
        await update.message.reply_text(
            "¿Qué complemento o accesorio necesitas?",
            reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
        )
        return ELEGIR_COMPLEMENTO
    else:
        teclado = [[t] for t in TIPOS_PRODUCTO.keys()] + [["❓ No sé / necesito asesoramiento"]]
        await update.message.reply_text(
            "¿Qué tipo de producto necesitas?",
            reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
        )
        return ELEGIR_TIPO

async def elegir_tipo(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    opcion = update.message.text.strip()

    if "no sé" in opcion.lower() or "asesoramiento" in opcion.lower():
        ctx.user_data["motivo_derivacion"] = "No sabe qué tipo de producto necesita"
        await update.message.reply_text(
            "Sin problema, uno de nuestros técnicos te asesorará sin compromiso. ¿Cómo te llamas?",
            reply_markup=ReplyKeyboardRemove()
        )
        return CAPTAR_NOMBRE

    tipo_interno = TIPOS_PRODUCTO.get(opcion)
    if not tipo_interno:
        teclado = [[t] for t in TIPOS_PRODUCTO.keys()] + [["❓ No sé / necesito asesoramiento"]]
        await update.message.reply_text(
            "Elige una opción del menú:",
            reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
        )
        return ELEGIR_TIPO

    ctx.user_data["tipo_busqueda"] = tipo_interno
    await update.message.reply_text(
        f"🎯 *Perfecto, vamos a encontrar la opción ideal para ti.*\n\n"
        f"📐 Cuéntame las medidas exactas que necesitas:\n\n"
        f"*Línea × Salida* (ej: `350x250`)\n\n"
        f"📏 *Línea* = anchura total\n"
        f"🎯 *Salida* = cuánto se extiende desde la pared",
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
        return await confirmar_modelo_seleccionado(update, ctx)

    # Mostrar comparativa
    lineas_msg = [
        f"✅ *Excelente, encontré {len(compatibles)} opciones* para {linea}×{salida} cm:\n"
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

    lineas_msg.append("\n" + "─" * 40)
    lineas_msg.append("\n👇 *Selecciona tu favorito para ver más detalles:*")

    teclado.append(["❌ Quiero otras opciones"])
    await update.message.reply_text(
        "\n".join(lineas_msg),
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
    )
    return COMPARAR_MODELOS

async def comparar_modelos(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    nombre = update.message.text.strip()

    if "ninguno" in nombre.lower():
        teclado = [[t] for t in TIPOS_PRODUCTO.keys()] + [["❓ No sé / necesito asesoramiento"]]
        await update.message.reply_text(
            "Sin problema. ¿Quieres cambiar el tipo de producto o las medidas?\n\n"
            "Elige de nuevo el tipo:",
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
        f"🎉 *Excelente elección:* *{producto['nombre']}*\n"
        f"📐 Medidas: {linea} × {salida} cm",
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardRemove()
    )

    # Si es pérgola, preguntar tipo de estructura
    if producto.get("tipo") == "pérgola":
        teclado = [["🏗️ Autoportante"], ["🧱 Pared portería"], ["🏢 Entre paredes"]]
        await update.message.reply_text(
            "🏢 *¿Tipo de estructura?*",
            reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
        )
        return TIPO_ESTRUCTURA

    # Si es toldo, preguntar donde se instala
    if producto.get("tipo") == "toldo":
        teclado = [["🏠 A techo"], ["🧱 A pared"], ["🏢 Entre paredes"]]
        await update.message.reply_text(
            "📍 *¿Dónde se instalará?*",
            reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
        )
        return TIPO_ESTRUCTURA

    # Para otros tipos, ir directamente a color aluminio
    return await preguntar_color_aluminio(update, ctx)

async def tipo_estructura(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    ctx.user_data["tipo_estructura"] = update.message.text.strip()
    return await preguntar_color_aluminio(update, ctx)

async def preguntar_color_aluminio(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    await update.message.reply_text(
        "🎨 *Color de aluminio* — escribe el color que deseas:\n"
        "_(ej: Blanco, Gris, Negro, Dorado, etc.)_",
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardRemove()
    )
    return COLOR_ALUMINIO

async def recibir_color_aluminio(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    color_aluminio = update.message.text.strip()
    ctx.user_data["color_aluminio"] = color_aluminio

    # Buscar el color en las categorías para calcular incremento
    producto = ctx.user_data["producto"]
    datos = ctx.user_data["datos"]
    grupo = producto.get("grupo_color")

    incremento_ral = 0
    nota_color_ral = ""

    if grupo and grupo in datos.get("grupos_color", {}):
        g = datos["grupos_color"][grupo]
        colores = g.get("colores", [])

        for c in colores:
            # Buscar si el color introducido coincide con alguno de la lista
            if color_aluminio.lower() in c["nombre"].lower():
                pct = c.get("incremento_pct", 0)
                minimo = c.get("minimo_eur", 0)
                if pct > 0:
                    incremento_ral = pct
                    minimo_txt = f" (mín. {minimo}€)" if minimo else ""
                    nota_color_ral = f"\n💰 *Incremento RAL:* +{pct}%{minimo_txt}"
                else:
                    nota_color_ral = "\n✅ Color incluido (sin incremento)"
                break

    # Confirmar al usuario
    msg_color = f"✅ Color de aluminio: *{color_aluminio}*"
    if nota_color_ral:
        msg_color += nota_color_ral

    await update.message.reply_text(
        msg_color,
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardRemove()
    )

    # Guardar el incremento
    ctx.user_data["incremento_ral_pct"] = incremento_ral

    teclado = [["☀️ Manual (sin motor)", "⚡ Motorizado (con Somfy)"]]
    await update.message.reply_text(
        "⚙️ *¿Accionamiento?* Elige el que mejor se ajuste a tu estilo de vida:",
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
        "Indícame las medidas en centímetros:\n"
        "📐 *Línea × Salida* (ej: `350x250`)\n\n"
        "_Línea = anchura total. Salida = proyección._",
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardRemove()
    )
    return PEDIR_MEDIDAS

async def recibir_medidas(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    texto = update.message.text.strip().replace(" ", "").replace(",", ".")
    match = re.match(r"(\d+)[xX×](\d+)", texto)
    if not match:
        await update.message.reply_text(
            "No reconozco el formato. Escribe las medidas así: `350x250` (línea × salida en cm)",
            parse_mode="Markdown"
        )
        return PEDIR_MEDIDAS

    linea = int(match.group(1))
    salida = int(match.group(2))

    # Validar medidas contra el modelo seleccionado
    producto = ctx.user_data.get("producto")
    if producto:
        pw = producto.get("precios_por_ancho", {})
        if pw and not (isinstance(pw, dict) and "estimado" in pw):
            lineas = sorted([int(k) for k in pw.keys()])
            if linea < lineas[0] or linea > lineas[-1]:
                rango = rango_lineas(producto)
                await update.message.reply_text(
                    f"⚠️ La línea {linea} cm está fuera del rango disponible para *{producto['nombre']}*.\n\n"
                    f"_Línea disponible: {rango}_\n\n"
                    f"¿Quieres cambiar la línea o seleccionar otro modelo?",
                    parse_mode="Markdown"
                )
                return PEDIR_MEDIDAS

            # Validar salida contra rango del producto
            salida_min = producto.get("salida_min")
            salida_max = producto.get("salida_max")
            if salida_min is not None and salida < salida_min:
                await update.message.reply_text(
                    f"⚠️ La salida {salida} cm está por debajo del mínimo para *{producto['nombre']}*.\n\n"
                    f"_Salida mínima: {salida_min} cm_\n\n"
                    f"¿Quieres ajustar la salida o seleccionar otro modelo?",
                    parse_mode="Markdown"
                )
                return PEDIR_MEDIDAS
            if salida_max is not None and salida > salida_max:
                await update.message.reply_text(
                    f"⚠️ La salida {salida} cm está fuera del rango para *{producto['nombre']}*.\n\n"
                    f"_Salida máxima disponible: {salida_max} cm_\n\n"
                    f"¿Quieres ajustar la salida o seleccionar otro modelo?",
                    parse_mode="Markdown"
                )
                return PEDIR_MEDIDAS

            # Buscar línea y validar salida (si hay estructura de salidas múltiples)
            linea_seleccionada = None
            for l in lineas:
                if l >= linea:
                    linea_seleccionada = l
                    break

            if linea_seleccionada:
                salidas_para_linea = pw[str(linea_seleccionada)]
                if isinstance(salidas_para_linea, dict):
                    salidas_disp = sorted([int(k) for k in salidas_para_linea.keys()])
                    salida_valida = any(s >= salida for s in salidas_disp)
                    if not salida_valida:
                        max_salida = salidas_disp[-1]
                        await update.message.reply_text(
                            f"⚠️ La salida {salida} cm no está disponible en *{producto['nombre']}*.\n\n"
                            f"_Salidas máximas disponibles: hasta {max_salida} cm_\n\n"
                            f"¿Quieres ajustar la salida o seleccionar otro modelo?",
                            parse_mode="Markdown"
                        )
                        return PEDIR_MEDIDAS

    ctx.user_data["linea"] = linea
    ctx.user_data["salida"] = salida

    teclado = [["Manual", "Motorizado"]]
    await update.message.reply_text(
        "⚙️ ¿Qué tipo de accionamiento necesitas?",
        reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
    )
    return ACCIONAMIENTO

# ─── FLUJO COMPARTIDO ────────────────────────────────────────

async def accionamiento(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    opcion = update.message.text.strip()
    ctx.user_data["motorizado"] = opcion.lower() == "motorizado"

    if ctx.user_data["motorizado"]:
        producto = ctx.user_data["producto"]
        datos = ctx.user_data["datos"]
        grupo_motor = producto.get("grupo_motor")

        if grupo_motor and str(grupo_motor) in datos.get("grupos_motor", {}):
            gm = datos["grupos_motor"][str(grupo_motor)]
            motores_str = ", ".join(gm.get("motores_somfy", []))
            await update.message.reply_text(
                f"🔌 Los motores Somfy compatibles con este producto son:\n"
                f"_{motores_str}_\n\n"
                f"El precio del motor se suma al precio base del producto. "
                f"¿Tienes preferencia de motor o potencia? (puedes escribir o poner «sin preferencia»)",
                parse_mode="Markdown",
                reply_markup=ReplyKeyboardRemove()
            )
            return SELECCIONAR_MOTOR
        else:
            await update.message.reply_text(
                "Para la motorización de este producto, nuestros técnicos te asesorarán sobre el motor más adecuado. "
                "Continuamos con el precio base.",
                reply_markup=ReplyKeyboardRemove()
            )

    return await preguntar_color(update, ctx)

async def seleccionar_motor(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    ctx.user_data["preferencia_motor"] = update.message.text.strip()
    return await preguntar_color(update, ctx)

async def preguntar_color(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    await update.message.reply_text(
        "🧵 *¿Qué color de tejido deseas?*\n\n"
        "Escribe el color o referencia Sauleda que prefieras.\n"
        "_(ej: Blanco, Gris oscuro, Antracita, etc.)_",
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardRemove()
    )
    return COLOR

async def recibir_color(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    color_tejido = update.message.text.strip()
    ctx.user_data["color_tejido"] = color_tejido

    teclado = [["✅ Sí, catálogo estándar"], ["❌ No, color personalizado"]]
    await update.message.reply_text(
        f"🎨 *{color_tejido}*\n\n"
        f"¿Este color está en el *catálogo estándar*?\n\n"
        f"_(Si es estándar, no lleva incremento de precio)_",
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
    )
    return TEJIDO

async def recibir_tejido(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    respuesta = update.message.text.strip()
    es_awma = "sí" in respuesta.lower()
    ctx.user_data["es_awma"] = es_awma

    if es_awma:
        await update.message.reply_text(
            "✅ *Perfecto, catálogo estándar*\n\n"
            f"Precio *sin incremento* de color",
            parse_mode="Markdown",
            reply_markup=ReplyKeyboardRemove()
        )
    else:
        await update.message.reply_text(
            "⚠️ *Color personalizado*\n\n"
            f"Precio con *incremento según color* (técnico confirmará)",
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

    # Calcular incremento de color RAL
    incremento_ral_pct = ctx.user_data.get("incremento_ral_pct", 0)
    incremento_ral_euros = 0
    if incremento_ral_pct > 0:
        incremento_ral_euros = precio_base * incremento_ral_pct / 100

    precio_final = precio_base + incremento_ral_euros

    lineas_resumen = [
        f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        f"🎯 *TU CONFIGURACIÓN PERSONALIZADA*",
        f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n",
        f"🏆 *Producto:* {producto['nombre']}",
        f"📏 *Medidas:* {linea}cm × {salida}cm de salida",
    ]
    if ctx.user_data.get("tipo_estructura"):
        label = "Instalación" if producto.get("tipo") == "toldo" else "Estructura"
        lineas_resumen.append(f"📍 *{label}:* {ctx.user_data['tipo_estructura']}")
    lineas_resumen.append(f"🎨 *Color aluminio:* {ctx.user_data.get('color_aluminio', '—')}")
    lineas_resumen.append(f"⚙️ *Accionamiento:* {'🔌 Motorizado (Somfy)' if motorizado else '☀️ Manual'}")
    if motorizado and ctx.user_data.get("preferencia_motor"):
        pref = ctx.user_data["preferencia_motor"]
        if "sin preferencia" not in pref.lower():
            lineas_resumen.append(f"🎛️ *Motor:* {pref}")
    color_tejido = ctx.user_data.get("color_tejido", "—")
    es_awma = ctx.user_data.get("es_awma", False)
    awma_label = "✅ Estándar (sin incremento)" if es_awma else "⚠️ Personalizado (con incremento)"
    lineas_resumen.append(f"🧵 *Color tejido:* {color_tejido}")
    lineas_resumen.append(f"   {awma_label}")

    lineas_resumen.extend([
        f"\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        f"💰 *DESGLOSE DE PRECIO*",
    ])

    lineas_resumen.append(f"• Producto base: *{precio_base:,.0f} €*")
    if incremento_ral_pct > 0:
        lineas_resumen.append(f"• Incremento RAL (+{incremento_ral_pct}%): +*{incremento_ral_euros:,.0f} €*")
    lineas_resumen.append(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    lineas_resumen.append(f"💰 *TOTAL ORIENTATIVO:* *{precio_final:,.0f} €*")

    if motorizado:
        lineas_resumen.append("\n_(+ motor Somfy según modelo)_")

    es_color_estandar = ctx.user_data.get("es_awma", False)
    if not es_color_estandar:
        lineas_resumen.append("_(+ incremento de color tejido según gama - técnico confirmará)_")

    if producto.get("tipo") == "toldo":
        lineas_resumen.append(
            f"\n💡 *Complemento recomendado:* TJD Tejadillo (protege tu tejido)"
        )

    lineas_resumen.extend([
        f"\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        f"✅ *¿Siguiente paso?*",
        f"Nuestros técnicos te visitarán SIN COMPROMISO para:",
        f"• Confirmar medidas exactas",
        f"• Asesorarte en colores y materiales",
        f"• Presupuesto final personalizado",
        f"\n_Precio orientativo PVP tarifa 2026._"
    ])

    texto = "\n".join(lineas_resumen)

    teclado = [["✅ Sí, contactar con técnico"], ["❌ Cambiar opciones"]]
    await update.message.reply_text(
        texto,
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
    )
    ctx.user_data["precio_calculado"] = precio_final
    return CONFIRMAR

async def confirmar(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    respuesta = update.message.text.strip()
    if "cambiar" in respuesta.lower() or "opciones" in respuesta.lower():
        # Usuario quiere cambiar opciones
        await update.message.reply_text(
            "De acuerdo, aquí te dejamos la información. 👍\n\n"
            "Si cambias de idea o tienes más dudas:\n"
            "📞 Llámanos o escríbenos\n"
            "✉️ Email: info@todosombra.es\n\n"
            "¡Estamos para ayudarte cuando lo necesites! ☀️",
            reply_markup=ReplyKeyboardRemove()
        )
        return ConversationHandler.END
    else:
        # Usuario quiere contactar, pero primero pregunta por complementos
        return await preguntar_complementos_adicionales(update, ctx)


async def preguntar_complementos_adicionales(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    teclado = [
        ["💡 Iluminación LED"],
        ["🏠 Tejadillo (cubrición)"],
        ["🪟 Costadillo lateral"],
        ["🎮 Mandos y automatismos"],
        ["📡 Sensores (viento, lluvia, sol)"],
        ["🔩 Perfiles y terminales"],
        ["❌ No, continuar sin complementos"]
    ]
    await update.message.reply_text(
        "¿Quieres añadir complementos adicionales?\n\n"
        "_(Puedes añadir uno o más)_",
        reply_markup=ReplyKeyboardMarkup(teclado, one_time_keyboard=True, resize_keyboard=True)
    )
    return AÑADIR_COMPLEMENTOS


async def añadir_complementos(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    opcion = update.message.text.strip()

    if "no, continuar" in opcion.lower() or "❌" in opcion:
        # Sin complementos, proceder a captar datos
        ctx.user_data["motivo_derivacion"] = "Solicita contacto con técnico tras ver precio"
        return await iniciar_captacion(update, ctx)

    # Guardar el complemento seleccionado
    if "Iluminación" in opcion or "Tejadillo" in opcion or "Costadillo" in opcion:
        # Complemento con potencial precio
        ctx.user_data["complemento_adicional_nombre"] = opcion
        await update.message.reply_text(
            f"¿Cuál es la *línea* (anchura) en centímetros?",
            parse_mode="Markdown",
            reply_markup=ReplyKeyboardRemove()
        )
        return MEDIDA_COMPLEMENTO_ADICIONAL
    else:
        # Complemento sin precio definido
        ctx.user_data["complemento_adicional_nombre"] = opcion
        await update.message.reply_text(
            f"✅ {opcion} será incluido en tu presupuesto.\n\n"
            f"¿Quieres añadir otro complemento más?",
            reply_markup=ReplyKeyboardMarkup(
                [["Sí, otro complemento"], ["❌ No, continuar"]],
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
    # Recalcular precio final con complementos
    precio_base = ctx.user_data.get("precio_calculado", 0)
    precio_complemento = ctx.user_data.get("precio_complemento_adicional", 0)
    precio_final_total = precio_base + precio_complemento
    ctx.user_data["precio_final_total"] = precio_final_total

    await update.message.reply_text(
        "🎉 *¡Perfecto!*\n\n"
        "Uno de nuestros especialistas en soluciones de sombra te contactará en las próximas *2-4 horas* con tu presupuesto sin compromiso.\n\n"
        "👤 *¿Cuál es tu nombre?*",
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardRemove()
    )
    return CAPTAR_NOMBRE

async def captar_nombre(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    ctx.user_data["lead_nombre"] = update.message.text.strip()
    await update.message.reply_text(
        "📱 *¿Tu teléfono o email?*\n"
        "_(Preferiblemente teléfono para que podamos contactarte rápido)_",
        parse_mode="Markdown"
    )
    return CAPTAR_CONTACTO

async def captar_contacto(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    contacto = update.message.text.strip()
    ctx.user_data["lead_contacto"] = contacto

    await update.message.reply_text(
        "📍 *¿En qué localidad o zona te encuentras?*\n"
        "_(Ej: Cartagena, Murcia, La Manga...)_",
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
        "tipo_estructura": ctx.user_data.get("tipo_estructura"),
        "color_aluminio": ctx.user_data.get("color_aluminio"),
        "incremento_ral_pct": ctx.user_data.get("incremento_ral_pct", 0),
        "motorizado": motorizado,
        "color_tejido": ctx.user_data.get("color_tejido"),
        "es_awma": ctx.user_data.get("es_awma"),
        "precio_base_orientativo": precio,
        "precio_final_orientativo": ctx.user_data.get("precio_calculado"),
        "complemento_adicional": ctx.user_data.get("complemento_adicional_nombre"),
        "precio_complemento": ctx.user_data.get("precio_complemento_adicional", 0),
        "precio_total_con_complementos": ctx.user_data.get("precio_final_total"),
        "motivo": motivo,
        "flujo_ficha_tecnica": es_ficha_tecnica,
        "telegram_user": update.effective_user.username or str(update.effective_user.id),
    }
    guardar_lead(lead)

    if es_ficha_tecnica:
        await update.message.reply_text(
            f"✅ *¡Perfecto, {nombre}!*\n\n"
            f"📄 *Nuestro equipo te enviará la ficha técnica de {producto.get('nombre')}* al {contacto}\n\n"
            f"📍 Zona: {localidad}\n\n"
            f"📞 *Te contactaremos en 2-4 horas* para:\n"
            f"• Enviar ficha técnica y especificaciones\n"
            f"• Aclarar todos tus detalles técnicos\n"
            f"• Preparar presupuesto 100% personalizado\n"
            f"• Agendar visita técnica sin compromiso\n\n"
            f"¡Gracias por tu confianza! ☀️",
            parse_mode="Markdown",
            reply_markup=ReplyKeyboardRemove()
        )
    else:
        await update.message.reply_text(
            f"🎉 *¡Gracias, {nombre}!*\n\n"
            f"✅ Tu consulta ha sido registrada correctamente.\n\n"
            f"📍 Zona: {localidad}\n\n"
            f"📞 *Un especialista te contactará en 2-4 horas* con:\n"
            f"• Presupuesto detallado personalizado\n"
            f"• Asesoramiento profesional sin compromiso\n"
            f"• Opciones de financiación disponible\n\n"
            f"☀️ *¡Gracias por elegir TodoSombra!*",
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
            TIPO_ESTRUCTURA: [MessageHandler(filters.TEXT & ~filters.COMMAND, tipo_estructura)],
            COLOR_ALUMINIO: [MessageHandler(filters.TEXT & ~filters.COMMAND, recibir_color_aluminio)],
            ACCIONAMIENTO: [MessageHandler(filters.TEXT & ~filters.COMMAND, accionamiento)],
            SELECCIONAR_MOTOR: [MessageHandler(filters.TEXT & ~filters.COMMAND, seleccionar_motor)],
            COLOR: [MessageHandler(filters.TEXT & ~filters.COMMAND, recibir_color)],
            TEJIDO: [MessageHandler(filters.TEXT & ~filters.COMMAND, recibir_tejido)],
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
