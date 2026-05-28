---
name: Precios fijos siempre con modelo concreto
description: Cuando el bot/cotización dé un precio cerrado, especificar el modelo exacto para poder argumentar cambios después
type: feedback
---

Cuando demos un precio fijo cerrado (mando, motor, sensor, accesorio…), especificar siempre el modelo concreto que se está cotizando y avisar de que otros modelos pueden tener precio distinto.

**Why:** si el cliente luego pide otra referencia (p.ej. Telis 4 en lugar de Situo 1, o Sunea RTS en lugar de IO), el técnico tiene que poder argumentar el cambio de precio sin parecer que cambia las reglas. Si en la cotización pone solo "Mando Somfy = 68,50€" sin especificar modelo, queda atado.

**How to apply:**
- En el texto del bot/email/mensaje: incluir modelo, características diferenciales (canales, radio io vs RTS, etc.) y disclaimer "si prefieres otro modelo, el precio puede variar; el técnico lo confirma en la visita".
- Aplicable a: mandos, motores, sensores con marca/modelo, perfiles específicos, packs Tahoma con referencia.
- En el lead guardado: campo `modelo` además de `nombre`, para que el técnico vea qué cotizó exactamente el bot.
