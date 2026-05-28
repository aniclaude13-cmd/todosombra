---
name: Trigger "preséntate"
description: Cuando Ruben diga "preséntate" enviar el audio pregrabado de presentación como nota de voz
type: feedback
---

**Regla:** Cuando Ruben escriba "preséntate" (con o sin tilde, mayúsculas indiferentes), responder enviando el audio pregrabado como nota de voz, sin generar TTS nuevo.

**Ruta del audio:** `/Users/ruben/.openclaw/workspace/audio/presentacion.mp3`

**Cómo enviar:**
```
[[audio_as_voice]]
MEDIA:/Users/ruben/.openclaw/workspace/audio/presentacion.mp3
```

**Why:** Ruben pidió un audio reutilizable para no gastar TTS cada vez y tener una intro consistente.

**How to apply:** Si Ruben dice "preséntate" o variantes claras, enviar el archivo. Si pide una nueva versión o cambiar la voz, regenerar (avisando del coste).

**Voz del audio:** Sara Martín (ElevenLabs `KHCvMklQZZo0O30ERnVn`). Texto: "Hola, soy Ánima, tu ángel digital. Me encargo de tus correos, calendario, recordatorios y proyectos, con eficiencia y una pizca de humor cuando hace falta."
