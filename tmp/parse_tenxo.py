#!/usr/bin/env python3
"""Parser de tablas TENXO del PDF text de la tarifa AWMA 2026.

Para cada modelo TX79XX:
- Localiza el header "TX79XX | MOTOR"
- Lee las 3 sub-tablas (2 GUÍAS / 3 GUÍAS / 4 GUÍAS)
- Cada sub-tabla: 1 header "S/L L1 L2 ..." y N filas "Salida V1 V2 ..."
- Termina al encontrar "OPCIONES | TX-TJD" o final del modelo

Salida: dict { modelo: { "lineas":[...], "salidas":[...], "matrix":{salida:{linea:precio}} } }
"""
import json
import re
from pathlib import Path

TXT = Path('/Users/ruben/.openclaw/workspace/tmp/tarifa-awma-2026.txt')

# Boundaries (línea del .txt, no del PDF)
MODELS = {
    'TX7900': (7970, 8040),   # hasta "187   TENXO" o TX7910 header
    'TX7910': (8041, 8113),
    'TX7930': (8114, 8184),
    'TX7950': (8185, 8256),
    'TX7970': (8257, 8330),
}


def parse_block(lines):
    """Lee un bloque de líneas y devuelve {salida: {linea: precio}} para 3 sub-tablas.

    Estrategia robusta:
    - Eliminar etiquetas que afectan al parsing: "N GUÍAS", "N tirantes", "PATAS LATERALES", "INCLUIDAS", "tirante", "MOTOR", "por guía", "hasta NNNcm", "de NNNcm a NNNcm"
    - Tras la limpieza, una fila de datos debe contener exactamente 1 + N números (salida + N precios)
    - La salida debe ser múltiplo de 50 ∈ [250, 1500]
    - Los precios deben ser ≥ 1000 (las pérgolas TENXO empiezan en ~5000€)
    """
    matrix = {}
    all_lineas = set()
    all_salidas = set()
    current_lineas = None  # columnas activas (del último header S/L)

    # Patrón para eliminar etiquetas de sub-tabla y notas embebidas
    LABEL_RE = re.compile(
        r'\b(?:'
        r'[1-4]\s*GU[ÍI]AS|'           # "2 GUÍAS", "3 GUÍAS"...
        r'[1-9]\s*tirantes?|'           # "1 tirante", "2 tirantes"
        r'PATAS\s+LATERALES|'
        r'INCLUIDAS|'
        r'MOTOR|'
        r'por\s+gu[ií]a|'
        r'hasta\s+\d+\s*cm|'
        r'de\s+\d+\s*cm\s+a\s+\d+\s*cm'
        r')\b',
        re.IGNORECASE
    )

    for raw in lines:
        line = raw.rstrip()
        if not line.strip():
            continue

        # Header "S/L L1 L2 ..."
        m = re.match(r'\s*S/L\s+(\d+(?:\s+\d+)*)\s*$', line)
        if m:
            current_lineas = [int(x) for x in m.group(1).split()]
            all_lineas.update(current_lineas)
            continue

        if not current_lineas:
            continue

        # Limpieza agresiva de etiquetas
        cleaned = LABEL_RE.sub('', line)
        tokens = re.findall(r'\b\d+\b', cleaned)
        n_expected = 1 + len(current_lineas)
        if len(tokens) < n_expected:
            continue

        # La salida es el primer token (después de limpieza). Validar.
        nums = [int(t) for t in tokens[:n_expected]]
        salida = nums[0]
        if salida % 50 != 0 or salida < 250 or salida > 1500:
            continue

        valores = nums[1:]
        # Validar que los precios son razonables (≥1000 €)
        if any(v < 1000 for v in valores):
            continue

        all_salidas.add(salida)
        row = matrix.setdefault(salida, {})
        for lin, val in zip(current_lineas, valores):
            if lin not in row:
                row[lin] = val

    lineas_sorted = sorted(all_lineas)
    salidas_sorted = sorted(all_salidas)
    return {
        'lineas': lineas_sorted,
        'salidas': salidas_sorted,
        'matrix': {s: dict(sorted(row.items())) for s, row in sorted(matrix.items())},
    }


def main():
    text = TXT.read_text().splitlines()
    out = {}
    for model, (start, end) in MODELS.items():
        # +0-1 offset porque awk usa 1-indexed pero Python 0-indexed
        block = text[start-1:end]
        parsed = parse_block(block)
        out[model] = parsed

    # Reporte resumido
    for model, data in out.items():
        n_cells = sum(len(r) for r in data['matrix'].values())
        print(f"{model}: lineas={len(data['lineas'])} ({data['lineas'][0]}-{data['lineas'][-1]}), "
              f"salidas={len(data['salidas'])} ({data['salidas'][0]}-{data['salidas'][-1]}), "
              f"celdas={n_cells}")

    # Guardar como JSON intermedio para inspección
    output_path = Path('/Users/ruben/.openclaw/workspace/tmp/tenxo_parsed.json')
    with output_path.open('w') as f:
        json.dump(out, f, indent=2)
    print(f"\nGuardado en {output_path}")
    return out


if __name__ == '__main__':
    main()
