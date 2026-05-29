#!/usr/bin/env python3
"""Extract pricing matrices from the AWMA 2026 tariff PDF.

For each priced product page, find a header row that contains one of:
  L/BRAZO  LINEA/BRAZO  LÍNEA/BRAZO  L/SALIDA  LINEA/SALIDA  LÍNEA/SALIDA
  LINEA/ALTURA  L/ALTURA  ALTO/ANCHO  ANCHO/ALTO  BRAZO/SALIDA
followed by 2+ integer column dimensions, then capture data rows that
start with a row dimension (línea) and a sequence of integer prices.

Output:
  - awma-core/catalog/prices/<PRODUCT>.json      per-product matrix
  - awma-core/catalog/prices/_index.json         summary
"""
from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PDF = ROOT / "awma-docs" / "Tarifa-Awma-PVP-2026.pdf"
OUT = ROOT / "awma-core" / "catalog" / "prices"
OUT.mkdir(parents=True, exist_ok=True)

HEADER_KEYS = (
    "LÍNEA/BRAZO",
    "LINEA/BRAZO",
    "L/BRAZO",
    "LÍNEA/SALIDA",
    "LINEA/SALIDA",
    "L/SALIDA",
    "LÍNEA/ALTURA",
    "LINEA/ALTURA",
    "L/ALTURA",
    "ALTO/ANCHO",
    "ANCHO/ALTO",
    "BRAZO/SALIDA",
    "TUBO/SALIDA",
    "L/CORTE",
    "LINEA/CORTE",
    "LÍNEA/CORTE",
    "L/ARCO",
    "LINEA/MODELO",
    "LÍNEA/MODELO",
)

# Generic header pattern: "LÍNEA/", "LINEA/", "L/" at the start of a stripped
# line, immediately followed by whitespace and >= 2 integer column dimensions.
# The "/" implies the column label is on the next line.
HEADER_GENERIC_RE = re.compile(
    r"^\s*(L[IÍ]NEA|L)/\s+((?:\d{2,4}\s+){1,}\d{2,4})\b"
)

PRODUCT_PREFIXES = (
    "BOX", "ART", "ARX", "AV", "VS", "VSJ", "VRD", "TX", "TF", "TS", "TK",
    "MCK", "WZ", "PRCS", "PRCT", "PRS", "PRT", "PR", "STR", "BX", "PL", "PG",
    "SR", "FS", "VM", "PS", "VA", "TJD", "SBX", "SPL", "ET", "UVE", "TX",
    "VRD", "S6600", "S6800", "S8130", "S8135", "S2160", "P3600",
)
PRODUCT_RE = re.compile(
    r"\b((?:BOX|ART|ARX|AV|VSJ|VS|VRD|TX|TF|TS|TK|MCK|WZ|PRCS|PRCT|PRS|PRT|PR|STR|BX|PL|PG|SR|FS|VM|PS|VA|TJD|SBX|SPL|ET|UVE|P)\d{3,5}[A-Z0-9_/-]*)\b"
)

STOP_PHRASES = (
    "OPCIONES", "IMPORTANTE", "SOBREPRECIOS", "EXTRAS",
    "ACCESORIOS", "CARACTERÍSTICAS", "DETALLES", "FORMA DE",
    "PAQUETE", "LISTA DE PRECIOS", "PRECIOS EN EUR",
    "CONSULTAR", "OPCIONES | EXTRAS",
    "BRAZO INVERTIDO", "MOTOR ", "MOTORIZACIÓN",
)


def pdf_to_text(start: int, end: int) -> str:
    r = subprocess.run(
        ["pdftotext", "-layout", "-f", str(start), "-l", str(end), str(PDF), "-"],
        capture_output=True, text=True, check=False,
    )
    return r.stdout


def looks_like_data_row(line: str):
    """Return (line_dim, prices) if the line looks like a data row, else None.

    A data row starts with a 2-4 digit line dim and contains at least one
    integer price (≥ 50). Tokens may end with * to mark a special-condition
    price; non-integer tokens are kept as None placeholders.
    """
    stripped = line.strip()
    if not stripped:
        return None
    tokens = re.findall(r"[-+]?\d[\d.,]*\*?", stripped)
    if len(tokens) < 2:
        return None
    first = tokens[0].rstrip("*").replace(",", "").replace(".", "")
    if not first.isdigit():
        return None
    line_dim = int(first)
    if not (50 <= line_dim <= 2000):
        return None
    prices = []
    for t in tokens[1:]:
        star = t.endswith("*")
        num = t.rstrip("*").replace(".", "").replace(",", "")
        if not num.isdigit():
            prices.append(None)
            continue
        val = int(num)
        # Prices are at least 50€ and at most 99999€. Filter (2) markers.
        if val < 50 or val > 99999:
            prices.append(None)
            continue
        prices.append({"price": val, "special": True} if star else val)
    # Need at least one real price.
    if not any(p is not None for p in prices):
        return None
    return line_dim, prices


def find_pricing_tables(text: str):
    """Yield (product_code, header_outputs, rows, header_line_idx) tuples."""
    lines = text.splitlines()
    i = 0
    while i < len(lines):
        upper = lines[i].upper()
        hit_key = None
        hit_idx = -1
        for key in HEADER_KEYS:
            idx = upper.find(key)
            if idx != -1:
                hit_key = key
                hit_idx = idx
                break
        if hit_key is None:
            # Fall back to generic "LÍNEA/ <nums>" pattern with column label on
            # next line.
            gm = HEADER_GENERIC_RE.match(upper)
            if gm:
                hit_key = gm.group(1) + "/"
                hit_idx = upper.find(hit_key)
            else:
                i += 1
                continue
        after = lines[i][hit_idx + len(hit_key):]
        # If a multi-line header (e.g. "LINEA/\nSALIDA"), the next line may
        # be the column heading word; numbers may be on the current line OR
        # on the next non-blank line.
        nums = re.findall(r"\b\d{2,4}\b", after)
        consumed_extra = 0
        if len(nums) < 2:
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            if j < len(lines):
                nums = re.findall(r"\b\d{2,4}\b", lines[j])
                consumed_extra = j - i
        if len(nums) < 2:
            i += 1
            continue
        header_outputs = [int(n) for n in nums]
        # Sanity: outputs should be monotonic increasing, reasonable range.
        if not all(50 <= n <= 2500 for n in header_outputs):
            i += 1
            continue
        if not all(b > a for a, b in zip(header_outputs, header_outputs[1:])):
            i += 1
            continue

        # Look back for product code (search up to 30 lines above).
        product = None
        for back in range(1, 30):
            if i - back < 0:
                break
            m = PRODUCT_RE.findall(lines[i - back])
            if m:
                product = m[-1]
                break

        # Collect data rows.
        rows = []
        j = i + 1 + consumed_extra
        skip_budget = 4  # tolerate up to N non-data lines before first row
        seen_data = False
        consecutive_skips = 0
        while j < len(lines):
            raw = lines[j]
            stripped = raw.strip()
            up = stripped.upper()
            # Stop on next pricing header.
            if any(k in up for k in ("L/BRAZO", "LINEA/BRAZO", "LÍNEA/BRAZO",
                                     "L/SALIDA", "LINEA/SALIDA", "LÍNEA/SALIDA",
                                     "LINEA/ALTURA", "LÍNEA/ALTURA",
                                     "L/ALTURA", "ALTO/ANCHO", "ANCHO/ALTO",
                                     "BRAZO/SALIDA", "TUBO/SALIDA")):
                break
            # Stop on clear stop phrases once we have data.
            if seen_data and any(sp in up for sp in STOP_PHRASES):
                break
            data = looks_like_data_row(raw)
            if data is None:
                if not seen_data:
                    if not stripped:
                        j += 1
                        continue
                    if skip_budget > 0:
                        skip_budget -= 1
                        j += 1
                        continue
                    break
                # After data started: allow 1-2 blank/non-data lines
                # (motor band, separators), then stop.
                if not stripped:
                    consecutive_skips += 1
                    if consecutive_skips >= 2:
                        # Look further; some tables have a blank gap.
                        # Peek next non-blank: if data row, keep going.
                        k = j + 1
                        while k < len(lines) and not lines[k].strip():
                            k += 1
                        if k < len(lines) and looks_like_data_row(lines[k]):
                            j = k
                            consecutive_skips = 0
                            continue
                        break
                    j += 1
                    continue
                # Non-blank non-data after data: allow short caption lines.
                if len(stripped) <= 20 and not any(ch.isdigit() for ch in stripped):
                    consecutive_skips += 1
                    if consecutive_skips >= 2:
                        break
                    j += 1
                    continue
                break
            consecutive_skips = 0
            seen_data = True
            line_dim, prices = data
            rows.append((line_dim, prices))
            j += 1

        if rows and product:
            yield product, header_outputs, rows, i
        i = max(j, i + 1)


def main():
    pdfinfo = subprocess.check_output(["pdfinfo", str(PDF)]).decode()
    total_pages = int(next(
        ln.split()[1] for ln in pdfinfo.splitlines() if ln.startswith("Pages:")
    ))
    print(f"PDF pages: {total_pages}")

    products: dict[str, dict] = {}
    CHUNK = 3  # one product table usually fits inside 1-2 pages; 3 gives a buffer
    page = 25
    while page <= total_pages:
        end = min(page + CHUNK - 1, total_pages)
        text = pdf_to_text(page, end)
        for product, header, rows, _ in find_pricing_tables(text):
            entry = products.setdefault(product, {
                "product": product,
                "pages": [],
                "outputs": header,
                "matrix": {},
                "variants": [],
            })
            entry["pages"].append(f"{page}-{end}")
            # If the product already has a different header, store as variant.
            existing_header = entry["outputs"]
            target_matrix = entry["matrix"]
            target_outputs = existing_header
            if existing_header != header:
                # Try to merge: if new header is a subset/superset, expand.
                merged = sorted(set(existing_header) | set(header))
                # Detect a second variant with different header; record as variant.
                variant = {
                    "outputs_cm": header,
                    "matrix_cm": {},
                }
                entry["variants"].append(variant)
                target_matrix = variant["matrix_cm"]
                target_outputs = header
                entry["outputs_merged"] = merged
            for line_dim, prices in rows:
                row = target_matrix.setdefault(str(line_dim), {})
                for hi, p in enumerate(prices):
                    if hi >= len(target_outputs):
                        break
                    key = str(target_outputs[hi])
                    if p is None:
                        continue
                    if key in row:
                        continue
                    row[key] = p
        page = end + 1 - 1  # one-page overlap to catch tables straddling chunks
        if page <= end:
            page = end + 1

    for pid, data in products.items():
        out = {
            "product": pid,
            "currency": "EUR",
            "source": "Tarifa-Awma-PVP-2026.pdf",
            "outputs_cm": data["outputs"],
            "matrix_cm": data["matrix"],
            "pdf_pages": sorted(set(data["pages"])),
        }
        if data.get("variants"):
            out["variants"] = data["variants"]
        safe = re.sub(r"[/\\]", "_", pid)
        (OUT / f"{safe}.json").write_text(json.dumps(out, indent=2, ensure_ascii=False))

    index = {
        "count": len(products),
        "products": sorted(products.keys()),
    }
    (OUT / "_index.json").write_text(json.dumps(index, indent=2, ensure_ascii=False))
    print(f"Extracted {len(products)} priced products → {OUT}")


if __name__ == "__main__":
    main()
