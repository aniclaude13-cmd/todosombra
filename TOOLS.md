# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

---

## TTS - Voz por defecto

- **Proveedor activo:** Microsoft Speech
- **Voz:** `es-ES-XimenaNeural` (español de España, femenina, natural)
- **Cómo generar:** `openclaw capability tts convert --voice es-ES-XimenaNeural --text "..." --output /path.mp3`
- **Adjuntar como nota de voz en Telegram:** usar `[[audio_as_voice]]` y `MEDIA:./tmp/archivo.mp3`

### ElevenLabs (configurado pero bloqueado)

- API key guardada en `messages.tts.providers.elevenlabs.apiKey`.
- Cuenta Free actualmente bloqueada por "unusual activity" — requiere plan de pago Starter ($6/mes) para usarla.
- Si Ruben paga el plan, ya tenemos credenciales listas; falta elegir voice_id en español.

## Related

- [Agent workspace](/concepts/agent-workspace)
