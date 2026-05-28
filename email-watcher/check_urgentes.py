#!/usr/bin/env python3
"""
Vigilante de email urgente — sin API de Anthropic.
Lee aniclaude13@gmail.com con gog y aplica reglas fijas para detectar urgentes.
Notifica por Telegram directamente (sin pasar por LLM).
"""

import html
import json
import os
import re
import subprocess
import sys
import urllib.request
import urllib.parse
from datetime import datetime

# ─── CONFIG ──────────────────────────────────────────────────────────────────

GMAIL_ACCOUNT  = "aniclaude13@gmail.com"
TELEGRAM_TOKEN = "8325937395:AAEAE0F3mk04jqftX1n0qZfya80tFvXgCls"
TELEGRAM_CHAT  = "10711943"
SEEN_FILE      = os.path.expanduser("~/.openclaw/workspace/email-watcher/seen_ids.json")
KEYRING_ENV    = os.path.expanduser("~/.openclaw/credentials/gog-keyring.env")

# Buscar correos no leídos en las últimas 75 minutos, excluyendo categorías automáticas
QUERY = "is:unread newer_than:75m -label:Promociones -label:Sistemas -label:Candidatos -category:promotions -category:social"

# ─── REGLAS DE URGENCIA ───────────────────────────────────────────────────────

# Dominios/remitentes que son SIEMPRE urgentes
SIEMPRE_URGENTE = ["@cmbarcelo.com"]

# Dominios de trabajo — urgente si además tienen palabra clave
DOMINIOS_TRABAJO = ["@tecnitoldo.es", "@awma.es"]

# Palabras en subject que elevan a urgente si es de trabajo
PALABRAS_CLAVE = [
    "urgente", "asap", "hoy", "vence", "plazo", "factura",
    "pedido", "llamar", "importante", "presupuesto", "cliente",
    "avería", "problema", "fallo",
]

# Palabras en subject que son urgentes por sí solas (sin importar remitente)
PALABRAS_FUERTES = ["urgente", "asap", "vence hoy", "plazo hoy"]

# Labels que excluyen el correo de ser urgente
LABELS_EXCLUIR = {"promociones", "sistemas", "candidatos", "spam",
                  "category_promotions", "category_social", "category_updates"}


def cargar_vistos():
    if os.path.exists(SEEN_FILE):
        with open(SEEN_FILE) as f:
            try:
                return set(json.load(f))
            except Exception:
                return set()
    return set()


def guardar_vistos(ids: set):
    with open(SEEN_FILE, "w") as f:
        json.dump(list(ids), f)


def gog_env():
    env = os.environ.copy()
    if os.path.exists(KEYRING_ENV):
        with open(KEYRING_ENV) as f:
            for line in f:
                line = line.strip()
                if line.startswith("export "):
                    line = line[7:]
                if "=" in line and not line.startswith("#"):
                    k, v = line.split("=", 1)
                    env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def listar_mensajes():
    cmd = [
        "gog", "-a", GMAIL_ACCOUNT, "--gmail-no-send",
        "-j", "--results-only",
        "gmail", "messages", "list",
        "--max", "20",
        "--include-body", "--body-format=text",
        QUERY,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, env=gog_env())
    if result.returncode != 0 or not result.stdout.strip():
        return []
    try:
        data = json.loads(result.stdout)
        return data if isinstance(data, list) else []
    except Exception:
        return []


_URL_RE = re.compile(r"https?://\S+")
_WS_RE = re.compile(r"[ \t]+")
_MULTILINE_RE = re.compile(r"\n{2,}")
_MD_SPECIAL_RE = re.compile(r"([*_`\[\]])")
# Restos de markdown de iconos sociales tras quitar la URL: [facebook]<, [instagram\]<, etc.
_LINK_FRAG_RE = re.compile(r"\[[^\]]{0,30}\\?\]\s*<?\s*>?\s*$")
# HTML
_BR_RE = re.compile(r"<br\s*/?>", re.IGNORECASE)
_P_RE = re.compile(r"</?p[^>]*>", re.IGNORECASE)
_TAG_RE = re.compile(r"<[^>]+>")

# Campos relevantes en formularios web (presupuesto Tecnitoldo, etc.)
_FORM_CAMPO_RE = re.compile(r"^\s*([A-Za-zÁÉÍÓÚÑáéíóúñ*][\w \-/.\*]{0,30}?)\s*[:：]\s*(.+?)\s*$")
_CAMPOS_UTILES = {
    "nombre", "apellidos", "teléfono", "telefono", "tel", "móvil", "movil",
    "email", "e-mail", "correo", "provincia", "localidad", "ciudad",
    "mensaje", "comentarios", "comentario", "asunto",
    "selección de producto", "producto", "seleccion de producto",
}
_CAMPOS_IGNORAR = {
    "fecha", "hora", "url de la página", "url", "agente de usuario",
    "user agent", "ip", "navegador", "página", "pagina",
    "on", "off",
}

# Cortes "duros": al detectar la línea, se descarta esa línea y todo lo posterior
_CORTES_FIRMA = (
    "un saludo", "saludos cordiales", "saludos,", "atentamente",
    "cordialmente", "gracias de antemano", "muchas gracias",
    "best regards", "kind regards", "regards,",
    "teléfono.", "telefono.", "móvil.", "movil.", "tel.", "tlf.",
    "email.", "e-mail.", "dirección.", "direccion.",
    "darse de baja", "unsubscribe", "ley 34/2002", "ley orgánica",
    "este mensaje y sus anexos", "este correo y sus anexos",
    "confidencialidad", "conforme a la ley",
)


def limpiar_html(texto: str) -> str:
    """Convierte <br>/<p> a saltos de línea y elimina el resto de etiquetas."""
    texto = _BR_RE.sub("\n", texto)
    texto = _P_RE.sub("\n", texto)
    texto = _TAG_RE.sub("", texto)
    return texto


def resumir_formulario(lineas):
    """Si el body parece un formulario (clave:valor), devuelve un resumen compacto.
    Si no, devuelve None."""
    campos = {}
    pares = 0
    for ln in lineas:
        m = _FORM_CAMPO_RE.match(ln)
        if not m:
            continue
        pares += 1
        clave = m.group(1).strip().strip("*").lower()
        valor = m.group(2).strip()
        if not valor or valor.lower() in _CAMPOS_IGNORAR:
            continue
        if clave in _CAMPOS_IGNORAR:
            continue
        if clave in _CAMPOS_UTILES:
            campos[clave] = valor

    # Necesita al menos 3 pares "clave: valor" para considerarse formulario
    if pares < 3 or not campos:
        return None

    nombre_completo = " ".join(
        v for k, v in campos.items() if k in ("nombre", "apellidos")
    ).strip()
    tel = campos.get("teléfono") or campos.get("telefono") or campos.get("tel") \
          or campos.get("móvil") or campos.get("movil")
    ubicacion = ", ".join(
        v for k, v in campos.items() if k in ("localidad", "ciudad", "provincia")
    )
    producto = campos.get("selección de producto") or campos.get("seleccion de producto") \
               or campos.get("producto")
    mensaje = campos.get("mensaje") or campos.get("comentarios") or campos.get("comentario")

    partes = []
    if nombre_completo:
        cabecera = nombre_completo
        if tel:
            cabecera += f" · {tel}"
        partes.append(cabecera)
    elif tel:
        partes.append(tel)

    linea2 = []
    if ubicacion:
        linea2.append(ubicacion)
    if producto:
        linea2.append(producto)
    if linea2:
        partes.append(" · ".join(linea2))

    if mensaje:
        if len(mensaje) > 180:
            mensaje = mensaje[:180].rstrip() + "…"
        partes.append(f"«{mensaje}»")

    return "\n".join(partes) if partes else None


def resumir_body(body: str, max_chars: int = 220) -> str:
    """Limpia y trunca el body para mostrarlo en Telegram."""
    if not body:
        return ""
    texto = html.unescape(body)
    texto = limpiar_html(texto)
    texto = _URL_RE.sub("", texto)
    # Normalizar saltos de línea
    texto = texto.replace("\r\n", "\n").replace("\r", "\n")
    # Quitar líneas que son solo decoración o vacías
    lineas = []
    for ln in texto.split("\n"):
        ln = _WS_RE.sub(" ", ln).strip()
        if not ln:
            continue
        # Cortar en despedida / firma / disclaimers
        if any(ln.lower().startswith(t) or t in ln.lower()[:40] for t in _CORTES_FIRMA):
            break
        # Saltar restos de iconos sociales o líneas que son sólo brackets
        if _LINK_FRAG_RE.search(ln):
            continue
        lineas.append(ln)

    # Si parece un formulario web, dar resumen estructurado
    resumen_form = resumir_formulario(lineas)
    if resumen_form:
        return _MD_SPECIAL_RE.sub(r"\\\1", resumen_form)

    texto = "\n".join(lineas)
    texto = _MULTILINE_RE.sub("\n", texto).strip()
    if len(texto) > max_chars:
        texto = texto[:max_chars].rstrip() + "…"
    # Escapar caracteres de Markdown para que no se rompa el formato
    texto = _MD_SPECIAL_RE.sub(r"\\\1", texto)
    return texto


_FROM_RE = re.compile(r'^\s*"?([^"<]+?)"?\s*<([^>]+)>\s*$')
_MESES_ES = ["ene", "feb", "mar", "abr", "may", "jun",
             "jul", "ago", "sep", "oct", "nov", "dic"]


def nombre_remitente(from_addr: str) -> str:
    """De 'Nombre' <email> devuelve el nombre limpio; si no, el usuario del email."""
    if not from_addr:
        return ""
    m = _FROM_RE.match(from_addr)
    if m:
        nombre = m.group(1).strip().strip('"').strip()
        return nombre or m.group(2).split("@")[0]
    return from_addr.strip().strip('"')


def formatear_fecha(date_str: str) -> str:
    """'2026-05-27 15:15' → '15:15' si es hoy, '27 may 15:15' si no."""
    if not date_str:
        return ""
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%Y-%m-%dT%H:%M:%S"):
        try:
            dt = datetime.strptime(date_str[:len(fmt) + 4 if "T" in fmt else 19], fmt)
            break
        except ValueError:
            continue
    else:
        return date_str
    hoy = datetime.now().date()
    if dt.date() == hoy:
        return dt.strftime("%H:%M")
    return f"{dt.day} {_MESES_ES[dt.month - 1]} {dt.strftime('%H:%M')}"


def es_urgente(from_addr: str, subject: str, labels: list) -> bool:
    from_lower = from_addr.lower()
    subject_lower = subject.lower()
    labels_lower = {l.lower() for l in labels}

    # Excluir si tiene label de descarte
    if labels_lower & LABELS_EXCLUIR:
        return False

    # Siempre urgente por dominio
    if any(d in from_lower for d in SIEMPRE_URGENTE):
        return True

    # Urgente si es de trabajo Y tiene palabra clave en asunto
    es_trabajo = any(d in from_lower for d in DOMINIOS_TRABAJO)
    tiene_clave = any(p in subject_lower for p in PALABRAS_CLAVE)
    if es_trabajo and tiene_clave:
        return True

    # Urgente por palabras fuertes en asunto (cualquier remitente)
    if any(p in subject_lower for p in PALABRAS_FUERTES):
        return True

    return False


def send_telegram(texto: str):
    data = json.dumps({
        "chat_id": TELEGRAM_CHAT,
        "text": texto,
        "parse_mode": "Markdown",
    }).encode()
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    try:
        urllib.request.urlopen(req, timeout=10)
    except Exception as e:
        print(f"Error enviando Telegram: {e}", file=sys.stderr)


def main():
    vistos = cargar_vistos()
    mensajes = listar_mensajes()

    urgentes = []
    nuevos_vistos = set(vistos)

    for msg in mensajes:
        msg_id = msg.get("id", "")
        if not msg_id or msg_id in vistos:
            continue

        nuevos_vistos.add(msg_id)

        from_addr = msg.get("from", "")
        subject   = msg.get("subject", "(sin asunto)")
        labels    = msg.get("labels", [])
        fecha     = msg.get("date", "")
        body      = msg.get("body", "")

        if es_urgente(from_addr, subject, labels):
            urgentes.append({
                "from": from_addr,
                "subject": subject,
                "date": fecha,
                "resumen": resumir_body(body),
            })

    guardar_vistos(nuevos_vistos)

    if urgentes:
        if len(urgentes) == 1:
            cabecera = "📧 *Correo urgente*"
        else:
            cabecera = f"📧 *{len(urgentes)} correos urgentes*"
        lineas = [cabecera, ""]
        for u in urgentes:
            asunto = _MD_SPECIAL_RE.sub(r"\\\1", u["subject"])
            nombre = _MD_SPECIAL_RE.sub(r"\\\1", nombre_remitente(u["from"]))
            fecha  = formatear_fecha(u["date"])
            meta = f"  {nombre}" + (f" · {fecha}" if fecha else "")
            lineas.append(f"• *{asunto}*")
            lineas.append(meta)
            if u["resumen"]:
                lineas.append(f"  ✉️ {u['resumen']}")
            lineas.append("")
        send_telegram("\n".join(lineas).strip())


if __name__ == "__main__":
    main()
