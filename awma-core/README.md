# AWMA Core — Motor de cálculo unificado

**Una sola fuente de verdad** para todas las tarifas, reglas y cálculos de productos AWMA.

```
awma-core/
├── catalog/              ← Catálogos JSON (una fuente)
│   ├── BOX6100_ARES.json
│   └── BOX6110.json
├── ts/engine.ts          ← Motor TypeScript (web)
├── py/engine.py          ← Motor Python (bot)
├── tests/                ← Tests cruzados (TS/Python)
└── schema.json           ← Esquema JSON-Schema
```

---

## Concepto

- **Un catálogo = un JSON en `catalog/`**, extraído del `.abd` de InGnio.
- **Dos motores** (TS y Python) leen los mismos JSON → imposible que diverjan.
- **Paridad garantizada**: tests cruzados validan que ambos motores dan el mismo resultado.

---

## Catálogo (JSON)

Cada producto es un JSON con:

- **`id`**, `nombre`, `tipo` — metadatos.
- **`dimensiones.linea/salida`** — min, max, valores tarifados (matriz).
- **`tarifa.matriz`** — precios PVP por combinación línea×salida.
- **`motores`** — recargos de motorización (Somfy, Cherubini, etc.).
- **`sobreprecios`** — componentes opcionales (kits, brazos, soportes, etc.).
- **`reglas`** — validaciones duras extraídas del `.abd` (bloqueos, avisos, refuerzos).
- **`brazos`** (opcional) — tablas de brazos invisibles (para cofres con brazo).

**Ejemplo:**

```json
{
  "id": "BOX6100_ARES",
  "nombre": "BOX6100 ARES",
  "dimensiones": {
    "linea": { "min": 179, "max": 600, "valores": [179, 204, ...] },
    "salida": { "min": 150, "max": 300, "valores": [150, 175, ...] }
  },
  "tarifa": {
    "matriz": {
      "179": { "150": 1192 },
      "204": { "150": 1250, "175": 1275 },
      ...
    }
  },
  "reglas": []
}
```

---

## Motor TypeScript

**Para la web (Next.js).**

```typescript
import { calcular, cargarCatalogo } from "@/awma-core/ts/engine";

const cat = cargarCatalogo(BOX6100_ARES_json);
const resultado = calcular(cat, {
  linea: 346,
  salida: 200,
  motorId: "rts_50Nm",
  color: "blanco",
  cantidad: 2,
});

console.log(resultado.valido);        // true|false
console.log(resultado.pvpUnitario);   // 1941 (1646 + 295)
console.log(resultado.pvpTotal);      // 3882 (1941 * 2)
console.log(resultado.bloqueos);      // avisos de validación
```

---

## Motor Python

**Para el bot Telegram.**

```python
from awma_core.py.engine import calcular

resultado = calcular(
    producto_id="BOX6100_ARES",
    linea=346,
    salida=200,
    motor_id="rts_50Nm",
    color="blanco",
    cantidad=2
)

print(resultado.valido)          # True|False
print(resultado.pvp_unitario)    # 1941
print(resultado.pvp_total)       # 3882
print(resultado.bloqueos)        # lista de avisos
```

---

## Cómo integrar en el bot

**Antes** (hoy):

```python
# todosombra-bot/bot.py
import awma_rules
validacion = awma_rules.validar("BOX6110", 300, 200)
# + cálculo manual de precios disperso por el código
```

**Después**:

```python
# todosombra-bot/bot.py
from awma_core.py.engine import calcular

resultado = calcular("BOX6110", linea=300, salida=200)
if not resultado.valido:
    mensaje = "❌ " + resultado.motivo_invalido
else:
    mensaje = f"✓ {resultado.pvp_unitario}€"
```

---

## Cómo integrar en la web

**Antes** (hoy):

```typescript
// todosombra/lib/tarifa-universal.ts (legacy)
import { calcularQuote } from "./tarifa-universal";
const q = calcularQuote({ productoId: "BOX6100_ARES", ... });
```

**Después**:

```typescript
// todosombra/lib/calcular.ts (nueva)
import { calcular, cargarCatalogo } from "@/awma-core/ts/engine";
import BOX6100_JSON from "@/awma-core/catalog/BOX6100_ARES.json";

const cat = cargarCatalogo(BOX6100_JSON);
const resultado = calcular(cat, { linea, salida, motorId, ... });
```

---

## Migrar un nuevo catálogo

Cuando obtengas un `.abd` de InGnio:

1. **Analiza el `.abd`** con el script `scripts/abd_to_json.py` (por hacer).
2. **Crea `catalog/MODELO.json`** siguiendo `schema.json`.
3. **Añade reglas** como JSON declarativo (no Python).
4. **Corre los tests** para validar paridad:
   ```bash
   python3 tests/test_cross_engine.py
   ```

---

## Tests

**Python:**

```bash
cd awma-core
python3 tests/test_cross_engine.py
```

**TypeScript** (próximo paso — jest + node):

```bash
cd awma-core
npm test  # cuando integremos en la web
```

---

## Roadmap

- [x] Schema JSON + 2 catálogos (BOX6100, BOX6110).
- [x] Motor TS + motor Python.
- [x] Tests cruzados (paridad garantizada).
- [ ] Script `abd_to_json.py` para automatizar ingesta de `.abd` de InGnio.
- [ ] Integración bot.py.
- [ ] Integración web (reemplaza `tarifa-universal.ts`).
- [ ] Tests jest en TS.
- [ ] API HTTP opcional si el bot necesita llamar la web.

---

## FAQ

**P: ¿Qué pasa si cambio un precio en el JSON?**
R: Se refleja inmediatamente en bot + web. Los tests cruzados te avisan si hay divergencia.

**P: ¿Y si InGnio actualiza el `.abd`?**
R: Reimporta a JSON, los motores leen la versión nueva sin cambios de código.

**P: ¿Puedo tener productos con la misma ID en dos JSONs?**
R: No. Cada `id` debe ser único. Usa versionado: `BOX6100_ARES_v2.json` si hay cambios retrocompatibles.

**P: ¿Los tests TS/Python son iguales?**
R: No exactamente. Los tests Python son los "canónicos". Los tests TS validan el mismo comportamiento pero con Jest.

---

## Contacto

Para preguntas sobre el core o migración de productos, contacta a Ánima.
