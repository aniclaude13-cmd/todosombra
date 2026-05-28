---
name: Revisar siempre el chat completo antes de preguntar
description: No hacer preguntas sobre detalles/decisiones ya discutidas. Verificar contexto previo.
type: feedback
---

**Regla:** Revisar siempre el historial del chat (aunque sea Telegram) antes de hacer preguntas sobre detalles que ya hemos hablado.

**Por qué:** Ruben ha pedido claramente que NO repita preguntas que ya se resolvieron. Es frustrante para él tener que explicar lo mismo dos veces.

**Cómo aplicar:** 
- Cuando hay dudas sobre estado actual, revisar:
  1. El contexto de la conversación (reply_to_id, mensajes anteriores)
  2. La memoria (MEMORY.md + memory/*.md)
  3. El historial reciente del chat
- Si falta contexto, ir a la fuente del hecho en lugar de preguntar.
- Ejemplo: el `gh auth login` no es una pregunta — es un paso que ya fue acordado y el usuario dirá "listo" cuando lo haya hecho.

**Primer incidente:** 2026-05-23 14:48 — Ánima preguntó "¿ya completaste gh auth login?" cuando ya había instrucciones claras en el chat anterior.
