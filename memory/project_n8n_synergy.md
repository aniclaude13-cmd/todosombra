---
name: Outlook → Synergy con n8n
description: Proyecto para automatizar creación de peticiones en Synergy a partir de correos de Outlook via n8n self-hosted
type: project
---

Caso de uso: Ruben recibe correos redirigidos a Outlook y quiere que ciertos correos se conviertan automáticamente en una petición en Synergy.

**Instalación (2026-05-06):** n8n 2.19.4 vía `npm install -g n8n`, escucha en `http://localhost:5678`. Log en `~/.n8n/n8n.log`.

**Pendiente de Ruben:** crear cuenta admin local en la UI de n8n.

**Pendiente del flujo:** conectar Outlook (OAuth Microsoft), conectar Synergy vía HTTP Request con creds que pasará Ruben, definir tipo de Request y mapeo de campos correo→petición.

**How to apply:** Cuando Ruben diga "seguimos con n8n", comprobar si el proceso sigue vivo (`curl -sS -o /dev/null -w "%{http_code}" http://localhost:5678`); si no, relanzar con `n8n start > ~/.n8n/n8n.log 2>&1 &`. Retomar desde el paso de cuenta admin.
