---
name: Avisar antes de cualquier coste
description: Parar y avisar SIEMPRE antes de cualquier acción que pueda generar gasto (API, TTS, hosting, dominios, suscripciones)
type: feedback
---

**Regla:** Antes de hacer cualquier cosa que pueda generar coste — extra usage de API, suscripciones, créditos, planes de pago, dominios, hosting, llamadas a TTS/imagen/vídeo de pago, etc. — parar y avisar a Ruben de inmediato. Cero tolerancia a "se cobró sin avisar".

**Why:** Ruben lo dejó explícito el 2026-05-09 tras detectar que Anthropic estaba tirando de "extra usage". No quiere sorpresas en facturas — prefiere que pause aunque sea molesto.

**How to apply:**
- Si detecto en logs/errores un cargo, notificarlo antes de continuar la tarea.
- Antes de instalar herramientas con tier de pago, advertir y pedir confirmación, aunque haya free tier.
- Si una acción puede subir el consumo (modelos caros, ejecuciones largas, voz TTS de pago), avisar previamente.
- Aplica a TODO: Anthropic, ElevenLabs, Stripe, Vercel, Supabase, dominios, n8n cloud, etc.
