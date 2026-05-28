---
name: Voz de Ánima (TTS)
description: Configuración de voz para mensajes hablados — Sara Martín en ElevenLabs Starter, fallback XimenaNeural
type: project
---

Voz de Ánima: **Sara Martín** del Voice Library de ElevenLabs.

- Provider por defecto: `elevenlabs` (configurado en `messages.tts.provider`)
- Voice ID: `KHCvMklQZZo0O30ERnVn`
- Modelo: `eleven_multilingual_v2`
- Plan: ElevenLabs Starter ($6/mes). Pagado por Ruben el 2026-05-05.
- API key con scope solo `text_to_speech` (sin `voices_read`). Para buscar/cambiar voces, pedir a Ruben que regenere la key con scopes completos.
- Fallback: Microsoft `es-ES-XimenaNeural` (provider secundario)

**Why:** Ruben quería una voz femenina, expresiva, en español nativo. Probamos varias premade y eligió Sara Martín del Voice Library, voz nativa española.

**How to apply:** Por defecto, todo TTS sale por ElevenLabs / Sara Martín. Solo usar XimenaNeural si ElevenLabs falla o se queda sin créditos (~30k caracteres/mes en Starter). Para cambiar de voz: `openclaw config set messages.tts.providers.elevenlabs.voiceId <id>`.
