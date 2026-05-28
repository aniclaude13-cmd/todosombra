# Memory index

## Feedback (reglas de comportamiento)
- [Usar siempre Opus](memory/user_model_preference.md) — Opus 4.7 SIEMPRE. Haiku descartado. No cambiar sin que Ruben lo pida explícitamente.
- [Revisar siempre el chat](memory/feedback_revisar_chat_completo.md) — no preguntar cosas ya discutidas, verificar contexto previo
- [Avisar antes de cualquier coste](memory/feedback_no_costs_without_warning.md) — pausar y avisar SIEMPRE antes de generar gasto (API, TTS, dominios, hosting, etc.)
- [Tono de avisos de seguridad](memory/feedback_security_tone.md) — bajar la paranoia para cuentas dedicadas/throwaway que solo usa Ánima
- [Preguntar y analizar skills antes de instalar](memory/feedback_skills_install.md) — vetarla con skill-vetter y confirmar con Ruben antes de instalar
- [No repetir avisos de correos](memory/feedback_email_notifications.md) — llevar registro en notified-emails.json y no volver a avisar del mismo
- [Respuesta corta al revisar correos](memory/feedback_email_check_response.md) — sin urgente: silencio o frase corta; con urgente: remitente+asunto+hora+resumen
- [Trigger "preséntate"](memory/feedback_presentate_trigger.md) — enviar audio pregrabado `/audio/presentacion.mp3` como nota de voz
- [Precios fijos con modelo concreto](memory/feedback_precios_fijos_modelo.md) — siempre especificar modelo + disclaimer al dar un precio cerrado

## Proyectos activos
- [TodoSombra — Ecommerce 3D AWMA](memory/project_ecommerce_awma.md) — configurador 3D Next.js/R3F, bot Telegram, dominios todosombra.es/.com. Visor 3D con brazos realistas deployado.
- [Bot TodoSombra @TodoSombra_bot](memory/project_bot_todosombra.md) — bot.py en todosombra-bot/. Cotizaciones orientativas AWMA, tono comercial, captación de leads
- [Bot TodoSombra — Replicar en WhatsApp](memory/project_bot_whatsapp.md) — decidido WhatsApp Cloud API. Pendiente input Ruben: número, Meta Business, nombre, hosting
- [TodoSombra — Migración repo GitHub](memory/project_todosombra_github_migration.md) — pendiente: Ruben hace gh auth login como aniclaude13-cmd, Ánima crea repo y pushea
- [I Love Mar Menor — Ecommerce merchandising](memory/project_ilovemarmenor.md) — Shopify creado, pendiente activación con tarjeta. Dominios vencen 19/07/2026
- [Integración de email aniclaude13@gmail.com](memory/project_email_integration.md) — Gmail operativo vía gog/OAuth. Vigilante urgentes activo. Filtros automáticos configurados.
- [Reglas de urgencia por remitente/dominio](memory/project_email_urgency_rules.md) — @cmbarcelo.com, @awma.es, @tecnitoldo.es, @espacius.com → siempre urgente
- [Outlook → Synergy con n8n](memory/project_n8n_synergy.md) — n8n 2.19.4 self-hosted en localhost:5678. Pendiente: cuenta admin, conectar Outlook+Synergy
- [Zona de trabajo (toldos/pérgolas)](memory/project_work_zone.md) — Mar Menor + costa Murcia (Cartagena, Mazarrón, Águilas, San Javier, etc.). NO interior
- [Voz de Ánima (TTS)](memory/project_voice.md) — ElevenLabs Starter, Sara Martín (voiceId KHCvMklQZZo0O30ERnVn), fallback XimenaNeural

## Producto / Especificaciones
- [Mecanismo brazos ARES](memory/product_spec_ares_brazos.md) — brazos bajo lona, se cierran hacia centro, fade-out suave al cerrar
- [Toldos cofre sin faldilla](memory/product_toldos_cofre_sin_faldilla.md) — el cofre protege la barra frontal; NO añadir faldilla en configurador, bot ni cotizaciones
- [Tarifa AWMA 2026 — BOX6100 ARES](memory/project_awma_tarifa.md) — tabla completa precios máquina (línea×salida), sobreprecios, motores

## Referencias
- [Credenciales TodoSombra](memory/credenciales_todosombra.md) — GitHub anima-s-projects1/todosombra, Vercel projectId + sync
- [Portfolio ruben-gm.com](memory/project_ruben_gm_portfolio.md) — en Vercel (76.76.21.21), formularios → aniclaude13@gmail.com, notificar por Telegram
- [Hosting MenorPlastic (PLAN 2)](memory/reference_menorplastic_hosting.md) — Lugo Internet. IP: 151.80.237.40, NS: ns1/ns2.servidortierra.com
- [Credenciales Lugo Internet](memory/credentials_lugointernet.md) — Panel DNS de ruben-gm.com. Usuario: garciamartinezruben@hotmail.es
- [Skills aprobadas](memory/approved_skills.md) — 8 skills vetadas y aprobadas: ontology, self-improvement, github, simplify, review, security-review, taskflow, browser-automation
