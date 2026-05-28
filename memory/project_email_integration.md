---
name: Integración de email aniclaude13@gmail.com
description: Estado del canal Gmail dedicado — lectura+envío vía gog/OAuth, filtros automáticos, vigilante de urgentes activo
type: project
---

Cuenta Gmail dedicada: `aniclaude13@gmail.com`. Canal entre Ruben y yo: él escribe a esa cuenta, yo aviso por Telegram cuando entra correo urgente y respondo a su Hotmail (`garciamartinezruben@hotmail.es`).

**Estado (2026-05-06):** Lectura y envío operativos vía `gog` CLI con OAuth. Reenvío de Tecnitoldo (trabajo) → aniclaude13@gmail.com operativo. Vigilante de urgentes activo (cron OpenClaw cada 60 min).

**Datos técnicos:**
- Binario: `gog` (v0.14.0, instalado por brew `steipete/tap/gogcli`)
- OAuth: `gog-client-secret.json` en `~/.openclaw/credentials/` (chmod 600)
- Token en keyring; password en `~/.openclaw/credentials/gog-keyring.env` (chmod 600)
- Hay que `source` ese env y `export GOG_KEYRING_PASSWORD` antes de cualquier `gog`
- Cliente: `--client anima`; Scope: Gmail (modify + settings) únicamente
- Política por defecto: llamar con `--gmail-no-send` (bloquea envío)

**Comando base de lectura:**
```
source ~/.openclaw/credentials/gog-keyring.env && export GOG_KEYRING_PASSWORD && \
  gog -a aniclaude13@gmail.com --gmail-no-send gmail messages list --max 10 'in:inbox'
```

**Etiquetas creadas:** Clientes, Tecnitoldo, AWMA, Proveedores, Candidatos, Sistemas, Promociones, Personal, Asesoría.

**Filtros automáticos:** @tecnitoldo.es→Tecnitoldo, @awma.es→AWMA, ana.martinez@espacius.es→Clientes, @indeedemail.com→Candidatos, sistemas→Sistemas, newsletters→Promociones, gmruben82→Personal, @sierraymoreno.es→Asesoría.

**Why:** Ruben quería un canal email persistente conmigo sin depender de Telegram para todo.

**How to apply:** Cualquier comando `gog` necesita el `source` previo del env file. Para enviar desde aniclaude13, confirmar primero con Ruben y quitar `--gmail-no-send` solo en esa llamada concreta.
