"""Tests cruzados TS/Python — valida paridad de motores.

Casos de prueba diseñados para captar divergencias. Cada caso ejecuta
el cálculo en Python y verifica que el resultado sea el esperado.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "py"))

from engine import calcular


def test_box6100_ares_basico():
    """Caso válido simple: BOX6100 ARES 346×200 cm, manivela."""
    r = calcular("BOX6100_ARES", linea=346, salida=200)
    assert r.valido, f"Esperado válido, got: {r.motivo_invalido}"
    assert r.pvp_base == 1646, f"PVP base esperado 1646, got {r.pvp_base}"
    assert r.pvp_unitario == 1646, f"PVP unitario esperado 1646, got {r.pvp_unitario}"
    assert len(r.desglose) == 1


def test_box6100_ares_con_motor():
    """BOX6100 ARES 346×200 cm + Somfy RTS 50Nm."""
    r = calcular("BOX6100_ARES", linea=346, salida=200, motor_id="rts_50Nm")
    assert r.valido
    assert r.pvp_base == 1646
    assert r.pvp_unitario == 1646 + 295, f"Esperado 1941, got {r.pvp_unitario}"
    assert len(r.desglose) == 2  # máquina + motor


def test_box6100_ares_salida_fuera_rango():
    """Salida > 300 no existe en BOX6100 ARES (máx 300)."""
    r = calcular("BOX6100_ARES", linea=346, salida=350)
    assert not r.valido
    assert any("no tarifada" in b.mensaje.lower() for b in r.bloqueos)


def test_box6110_regla_linea_minima():
    """BOX6110: línea < 179 debe bloquear."""
    r = calcular("BOX6110", linea=170, salida=200)
    assert not r.valido
    assert any("179" in b.mensaje for b in r.bloqueos)


def test_box6110_regla_salida_minima():
    """BOX6110: salida < 150 debe bloquear."""
    r = calcular("BOX6110", linea=300, salida=140)
    assert not r.valido
    assert any("150" in b.mensaje for b in r.bloqueos)


def test_box6110_refuerzo_3_brazos():
    """BOX6110: línea > 500 Y salida > 300 → aviso refuerzo."""
    r = calcular("BOX6110", linea=510, salida=310)
    # No bloquea, pero debe generar avisos
    assert any("refuerzo" in b.mensaje.lower() for b in r.avisos)


def test_box6110_color_blanco_linea_grande():
    """BOX6110: línea > 505 solo permite blanco."""
    r = calcular("BOX6110", linea=510, salida=200, color="rojo")
    assert not r.valido
    assert any("blanco" in b.mensaje.lower() for b in r.bloqueos)


def test_box6110_color_blanco_valido():
    """BOX6110: línea > 505 + blanco = OK."""
    r = calcular("BOX6110", linea=510, salida=200, color="blanco")
    # No debería haber bloqueo por color
    assert not any("blanco" in b.mensaje for b in r.bloqueos)


def test_box6110_techo_linea_grande():
    """BOX6110: línea > 510 → aviso instalación a techo."""
    r = calcular("BOX6110", linea=520, salida=200)
    assert any("techo" in b.mensaje.lower() for b in r.avisos)


def test_cantidad_multiple():
    """PVP Total debe ser PVP Unitario × cantidad."""
    r = calcular("BOX6100_ARES", linea=300, salida=200, cantidad=3)
    assert r.pvp_total == r.pvp_unitario * 3


def test_sobreprecios():
    """BOX6100 ARES + sobreprecio Kit Cofre Blanco."""
    r = calcular(
        "BOX6100_ARES",
        linea=346,
        salida=200,
        sobreprecios=[{"ref": "80131370", "cantidad": 1}],
    )
    assert r.valido
    # PVP = base + sobreprecio
    assert 211.02 in [d.importe for d in r.desglose]
    assert abs(r.pvp_unitario - (1646 + 211.02)) < 0.01


def test_sobreprecios_multiple():
    """BOX6100 ARES + 2 sobreprecio brazo premium."""
    r = calcular(
        "BOX6100_ARES",
        linea=346,
        salida=200,
        sobreprecios=[
            {"ref": "80080805", "cantidad": 2},  # Brazo 2,00 x 2 = 318.53 * 2
        ],
    )
    assert r.valido
    # Debe aparecer en desglose con "x2"
    assert any("x2" in d.concepto for d in r.desglose)


def test_normalizacion_color():
    """Normalización: "  BLANCO  " == "blanco" == "9010" — no bloquea."""
    r1 = calcular("BOX6110", linea=510, salida=200, color="  BLANCO  ")
    r2 = calcular("BOX6110", linea=510, salida=200, color="blanco")
    r3 = calcular("BOX6110", linea=510, salida=200, color="9010")
    # Ninguno debería estar bloqueado por color
    assert not any("blanco" in b.mensaje.lower() for b in r1.bloqueos)
    assert not any("blanco" in b.mensaje.lower() for b in r2.bloqueos)
    assert not any("blanco" in b.mensaje.lower() for b in r3.bloqueos)


if __name__ == "__main__":
    tests = [
        test_box6100_ares_basico,
        test_box6100_ares_con_motor,
        test_box6100_ares_salida_fuera_rango,
        test_box6110_regla_linea_minima,
        test_box6110_regla_salida_minima,
        test_box6110_refuerzo_3_brazos,
        test_box6110_color_blanco_linea_grande,
        test_box6110_color_blanco_valido,
        test_box6110_techo_linea_grande,
        test_cantidad_multiple,
        test_sobreprecios,
        test_sobreprecios_multiple,
        test_normalizacion_color,
    ]

    failed = []
    for test in tests:
        try:
            test()
            print(f"✓ {test.__name__}")
        except AssertionError as e:
            print(f"✗ {test.__name__}: {e}")
            failed.append(test.__name__)

    if failed:
        print(f"\n{len(failed)}/{len(tests)} tests fallaron.")
        sys.exit(1)
    else:
        print(f"\n{len(tests)}/{len(tests)} tests OK.")
        sys.exit(0)
