---
name: Bot TodoSombra — Estructura y Flujo
description: Bot @TodoSombra_bot de Telegram para cotizaciones orientativas de productos AWMA 2026
type: project
---

Bot operativo en Telegram (@TodoSombra_bot) para consultas de precios orientativos de productos AWMA.

**Archivo:** `/Users/ruben/.openclaw/workspace/todosombra-bot/bot.py`
**Datos:** `awma-products-with-prices.json`
**Leads:** `todosombra-bot/leads.json`

## Flujo comercial (tras refactor 2026-05-20)

1. **Menú inicial:** Sé el modelo / Ayúdame a elegir / Complementos y accesorios
2. **Tipo de producto** (si elige ayuda)
3. **Medidas:** línea × salida — validadas contra min/max del JSON
4. **Color de aluminio:** teclado rápido (Blanco/Gris/Antracita/Negro/Bronce/Otro) → calcula incremento RAL
5. **Accionamiento:** Manual o Motorizado (Somfy)
6. **Motor:** si motorizado, preferencia de potencia
7. **Color de tejido:** texto libre (Sauleda) — en catálogo AWMA o especial
8. **Resumen con precio** + desglose IVA 21%
9. **Complementos opcionales** (LED, tejadillo, costadillo, mandos, sensores, perfiles)
10. **Captación de lead:** nombre, teléfono/email, localidad

**Datos técnicos eliminados en el refactor:** posición accionamiento, tipo fijación, instalación eléctrica, confección, faldilla, etc. Los recoge el técnico en la visita.

**Reglas especiales:**
- TJD TEJADILLO excluido de búsqueda de toldos (es accesorio, se ofrece como complemento)
- Toldos cofre (ARES): NO preguntar por faldilla
- Mando Somfy: 68,50€ automático al presupuesto
