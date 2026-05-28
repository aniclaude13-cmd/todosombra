---
name: TodoSombra — Ecommerce 3D AWMA
description: Ecommerce con configurador 3D para toldos/pérgolas en drop shipping desde AWMA. Proyecto en todosombra/.
type: project
---

**Marca:** TodoSombra. Ecommerce custom con configurador 3D para vender toldos/pérgolas AWMA en drop shipping.

**Dominios:** todosombra.es (vence 20/01/2027) y todosombra.com (vence 19/01/2027). DNS todosombra.com: zona aún no inicializada en Lugo Internet.

**Stack:** Next.js + React Three Fiber, Stripe + Bizum, Resend, Supabase, Vercel.

**Estado configurador web (2026-05-21):**
- Configurador ARES operativo con tarifa 2026 completa. Modo admin (?admin=1) muestra coste y margen.
- Visor 3D con brazos articulados realistas (Seg1: 0°→50°, Seg2: 0°→-35°), fade-out suave al cerrar, sombra en suelo.
- Botón "Solicitar pedido" deshabilitado — falta checkout.

**Pendiente técnico:** Checkout Stripe+Bizum, configurador Palillería 80x40, Supabase para pedidos, generación PDF + Resend.

**Pendiente de Ruben:** PDFs editables de hoja de pedido, confirmar si AWMA tiene modelo 3D, negociar drop shipping con AWMA, escribir a soporte@lugointernet.com para inicializar zona DNS todosombra.com.

**Repo y deploy:** Ver `credenciales_todosombra.md` para GitHub + Vercel.
