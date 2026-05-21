#!/usr/bin/env python3
"""
Vigilante de email urgente — sin API de Anthropic.
Lee aniclaude13@gmail.com con gog y aplica reglas fijas para detectar urgentes.
Notifica por Telegram directamente (sin pasar por LLM).
"""

import json
import os
import re
import subprocess
import sys
import urllib.request
import urllib.parse

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
        "gmail", "messages", "list", "--max", "20", QUERY,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, env=gog_env())
    if result.returncode != 0 or not result.stdout.strip():
        return []
    try:
        data = json.loads(result.stdout)
        return data if isinstance(data, list) else []
    except Exception:
        return []


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

        if es_urgente(from_addr, subject, labels):
            urgentes.append({"from": from_addr, "subject": subject, "date": fecha})

    guardar_vistos(nuevos_vistos)

    if urgentes:
        lineas = ["📧 *Correo urgente*\n"]
        for u in urgentes:
            lineas.append(f"• *{u['subject']}*")
            lineas.append(f"  De: {u['from']}")
            if u["date"]:
                lineas.append(f"  {u['date']}")
            lineas.append("")
        send_telegram("\n".join(lineas).strip())


if __name__ == "__main__":
    main()
