---
name: Revisar skills antes de instalar
description: Antes de instalar cualquier skill, revisarla con skill-vetter y confirmar con Ruben
type: feedback
---

**Regla:** Antes de instalar cualquier skill (ClawHub, repos externos, cualquier fuente), revisarla con `openclaw-skills:skill-vetter` y confirmar con Ruben antes de proceder.

**Why:** Ruben quiere control sobre lo que se añade a su entorno. Las skills pueden tener riesgos (Agent Goal Hijack, Tool Misuse, acceso a credenciales).

**How to apply:**
1. No instalar directamente.
2. Invocar `openclaw-skills:skill-vetter`.
3. Revisar audits en ClawHub (ClawScan, Static Analysis, VirusTotal).
4. Presentar veredicto con motivos.
5. Esperar confirmación explícita antes de instalar.
