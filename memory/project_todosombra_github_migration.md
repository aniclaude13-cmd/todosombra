---
name: TodoSombra — Migración repo a GitHub
description: Pasos pendientes para subir el repo local de TodoSombra a GitHub (aniclaude13-cmd) y reconectar Vercel
type: project
---

**Estado:** pendiente de que Ruben ejecute el auth login.

## Pasos pendientes

### 1. Ruben (manual)
```
gh auth login -h github.com -p ssh --skip-ssh-key -w
```
Loguearse como **aniclaude13-cmd** (no aniclaude13 ni otra cuenta). Esta es la cuenta con la clave SSH activa.

### 2. Ánima (tras "listo" de Ruben)
- Crear repo `aniclaude13-cmd/todosombra` (privado)
- Cambiar remote local y pushear todo el historial

### 3. Ruben (manual — dashboard Vercel)
- Ir a Vercel → settings/git → conectar el nuevo repo
- No hay CLI para este paso

**Why:** El repo de TodoSombra está solo local. Necesario para backup y para que Vercel haga deploy automático desde git.

**How to apply:** Cuando Ruben diga "listo" tras el auth login, ejecutar el paso 2 directamente sin volver a preguntar.
