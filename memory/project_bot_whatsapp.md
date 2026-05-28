---
name: Bot TodoSombra — Replicar en WhatsApp
description: Plan para portar el bot de Telegram a WhatsApp Cloud API. Pendiente input de Ruben antes de arrancar código.
type: project
---

Decisión 2026-05-26: portar el bot de Telegram (@TodoSombra_bot) a WhatsApp usando **WhatsApp Cloud API oficial de Meta** (descartado Twilio/Baileys).

**Why:** vía gratuita hasta 1.000 conversaciones/mes, oficial, sin riesgo de baneo. Descartado Baileys/whatsapp-web.js por riesgo de baneo del número en uso comercial. Twilio descartado porque cobra por mensaje.

**How to apply:** retomar con este plan, no rediscutir la elección de canal salvo que Ruben lo pida.

## Estado al pausar (2026-05-26 23:35)

Pendiente de input de Ruben antes de tocar código:
1. **Número de teléfono dedicado** — no puede estar en WhatsApp normal. ¿Virtual o físico suelto?
2. **Cuenta Meta Business** — ¿reutilizar la de Instagram/Facebook de TodoSombra o crear nueva?
3. **Nombre comercial + descripción** visible en WhatsApp.
4. **Hosting del webhook** — recomendado Railway/Fly.io (free tier) o VPS Lugo Internet.

## Plan técnico cuando retomemos

1. Refactor `todosombra-bot/bot.py` (1761 líneas) separando:
   - **Lógica de cotización** (medidas, RAL, Sauleda, complementos, precios) → reutilizable
   - **Capa Telegram** (handlers, teclados inline) → a sustituir
2. Adaptador WhatsApp Cloud API: webhook HTTPS, verify token, envío de mensajes/botones/listas.
3. Adaptar teclados: WhatsApp permite máx 3 botones rápidos o listas de máx 10 opciones (vs teclados libres de Telegram).
4. El bot de Telegram **se mantiene operativo en paralelo**, no se sustituye.

## Costes previstos (a avisar antes de incurrir)

- WhatsApp Cloud API: 0€ hasta 1.000 conversaciones cliente/mes. Plantillas iniciadas por nosotros: ~0,03–0,05€/conv tras free tier.
- Hosting: Railway/Fly.io free tier (~5€/mes si lo superamos). VPS Lugo ya pagado.
- Número virtual si hace falta: ~1–3€/mes.

## Trigger para retomar

Cuando Ruben diga "seguimos con el bot de WhatsApp" o similar, releer este memory y pedirle las 4 cosas pendientes.
