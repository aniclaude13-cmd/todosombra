---
name: No repetir avisos de correos ya notificados
description: Llevar registro de correos ya reportados a Ruben y no repetirlos en heartbeats posteriores
type: feedback
---

**Regla:** No repetir correos que ya he reportado a Ruben, ni en heartbeats ni en consultas directas.

**Why:** Ruben no quiere recibir el mismo aviso varias veces — es ruido.

**How to apply:** Llevar registro de IDs de mensaje ya notificados en `memory/notified-emails.json`. Antes de reportar cualquier correo, comprobar contra ese registro. Solo incluir correos no reportados previamente. Aplica siempre, independientemente de si la revisión es proactiva o a petición.
