---
name: Respuesta corta al revisar correos
description: Sin urgentes en chequeos proactivos → silencio. En consultas directas → frase corta. Con urgentes → resumen completo.
type: feedback
---

**Regla:** El reporte de correos incluye solo los urgentes. Nunca listar promos, newsletters ni no urgentes.

- **Chequeo proactivo (heartbeat/cron):** si no hay urgente → no enviar nada.
- **Consulta directa de Ruben:** si no hay urgente → "no hay correo urgente". Sin listar ruido.
- **Hay urgente:** remitente + asunto + hora de recepción + resumen del cuerpo (1-3 líneas). Ordenar de más antiguo a más nuevo.

**Why:** Ruben no quiere ruido. Si él no preguntó y no hay nada importante, mejor silencio. Si hay urgente, contenido resumido para actuar (asunto solo no basta).
