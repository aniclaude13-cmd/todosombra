---
name: Mecanismo brazos ARES — especificación de diseño
description: Brazos del toldo cofre ARES van por debajo de la lona, se cierran hacia el centro y se ocultan en el cofre
type: project
---

## Especificación técnica del mecanismo de brazos (ARES)

### Cómo funcionan los brazos

- **Posición**: Van por debajo del tejido (lona). El hombro del brazo está 7 cm por debajo de la base del cofre
- **Movimiento al cerrar**: 
  - Segmento 1 (superior): rota hacia arriba (pitch: -6° → 82°)
  - Segmento 2 (inferior): se pliega sobre el segmento 1 (codo: 0° → -176°)
  - Ambos se cierran simultáneamente hacia el centro
- **Ocultamiento**: Se ocultan completamente dentro del cofre cuando el toldo está cerrado

### Implementación en el Configurador 3D

**Archivo**: `/Users/ruben/.openclaw/workspace/todosombra/components/ares/Visor3D.tsx`

**Cambios realizados** (2026-05-23):
- Añadido fade-out gradual: los brazos desaparecen suavemente entre 15%-5% de extensión
- Antes: desaparecían abruptamente (threshold = 0.08)
- Ahora: transición suave con `armOpacity = r > 0.15 ? 1 : (r > 0.05 ? (r - 0.05) / 0.1 : 0)`
- Cada mesh de los brazos ahora incluye `transparent opacity={armOpacity}`

### Próximos pasos

- [ ] Revisar si los brazos se ven con claridad cuando están abiertos
- [ ] Considerar animación más dramática si es necesario (glow al abrir/cerrar)
- [ ] Documentar en bot y ecommerce si es relevante

**Estatus**: Implementado en configurador 3D ✅
