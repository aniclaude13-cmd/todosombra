"""Tests cruzados TS/Python — valida paridad de motores.

Casos de prueba diseñados para captar divergencias. Cada caso ejecuta
el cálculo en Python y verifica que el resultado sea el esperado.
"""
import json
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
    """BOX6110: línea < 178 debe bloquear (mínimo real de la tarifa 2026)."""
    r = calcular("BOX6110", linea=170, salida=200)
    assert not r.valido
    assert any("178" in b.mensaje for b in r.bloqueos)


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


def test_box6010_indie_basico():
    """BOX6010 INDIE 300×175 cm con manivela."""
    r = calcular("BOX6010_INDIE", linea=300, salida=175)
    assert r.valido, f"Esperado válido, got: {r.motivo_invalido}"
    assert r.pvp_base == 1154, f"PVP base esperado 1154, got {r.pvp_base}"
    assert r.pvp_unitario == 1154


def test_box6010_indie_con_motor_rts():
    """BOX6010 INDIE 287×250 cm + Somfy RTS 50Nm."""
    r = calcular("BOX6010_INDIE", linea=287, salida=250, motor_id="rts_50Nm")
    assert r.valido
    assert r.pvp_base == 1217
    assert r.pvp_unitario == 1217 + 295


def test_box6010_indie_salida_fuera_rango():
    """BOX6010 INDIE: salida > 250 bloquea."""
    r = calcular("BOX6010_INDIE", linea=300, salida=275)
    assert not r.valido
    assert any("250" in b.mensaje for b in r.bloqueos)


def test_box6010_indie_linea_fuera_rango():
    """BOX6010 INDIE: línea > 500 ya no bloquea — se resuelve con módulos acoplados."""
    r = calcular("BOX6010_INDIE", linea=525, salida=200)
    assert r.valido, r.motivo_invalido
    assert any(a.regla_id == "acoplado" for a in r.avisos)


def test_box6010_indie_combinacion_no_tarifada():
    """BOX6010 INDIE: línea 450 con salida 225 no está en tarifa (línea > 400 limita salida ≤ 200)."""
    r = calcular("BOX6010_INDIE", linea=450, salida=225)
    assert not r.valido
    assert any("no tarifada" in b.mensaje.lower() for b in r.bloqueos)


def test_box6010_indie_aviso_salida_grande():
    """BOX6010 INDIE: línea > 400 + salida > 200 → aviso (no bloqueo)."""
    r = calcular("BOX6010_INDIE", linea=450, salida=225)
    # Aunque la matriz bloquee por falta de tarifa, el aviso debe estar presente
    assert any("400" in a.mensaje for a in r.avisos)


def test_box6010_indie_brazo_smart():
    """BOX6010 INDIE + 2 brazos SMART 2,00."""
    r = calcular(
        "BOX6010_INDIE",
        linea=300,
        salida=200,
        sobreprecios=[{"ref": "80081228", "cantidad": 2}],
    )
    assert r.valido
    assert abs(r.pvp_unitario - (1178 + 268.00 * 2)) < 0.01
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


# ---------- Resto de cofres AWMA 2026 ----------

def test_box5200_basico():
    """BOX5200 287×250 manivela."""
    r = calcular("BOX5200", linea=287, salida=250)
    assert r.valido, r.motivo_invalido
    assert r.pvp_base == 1518


def test_box5200_motor_io():
    """BOX5200 + Somfy iO 50Nm."""
    r = calcular("BOX5200", linea=287, salida=250, motor_id="io_50Nm")
    assert r.pvp_unitario == 1518 + 400


def test_box5200_linea_fuera_rango():
    """BOX5200: línea >500 se resuelve con módulos acoplados."""
    r = calcular("BOX5200", linea=525, salida=200)
    assert r.valido, r.motivo_invalido
    assert any(a.regla_id == "acoplado" for a in r.avisos)


def test_box6000_basico():
    """BOX6000 285×175 manivela."""
    r = calcular("BOX6000", linea=285, salida=175)
    assert r.valido, r.motivo_invalido
    assert r.pvp_base == 1146


def test_box6000_combinacion_no_tarifada():
    """BOX6000: 425×275 no está en tarifa (max salida 250)."""
    r = calcular("BOX6000", linea=425, salida=275)
    assert not r.valido


def test_box6100_basico():
    """BOX6100 (base, sin ARES) — misma matriz que BOX6100_ARES."""
    r = calcular("BOX6100", linea=346, salida=200)
    assert r.valido
    assert r.pvp_base == 1646


def test_box6100_no_kit_ares_en_sobreprecios():
    """BOX6100 base no debe ofrecer el Kit Cofre ARES (es de la variante ARES)."""
    cat = json.load(open(Path(__file__).parent.parent / "catalog" / "BOX6100.json"))
    refs = [sp["ref"] for sp in cat["sobreprecios"]]
    assert "80131370" not in refs, "BOX6100 base no debe tener Kit Cofre ARES como sobreprecio"


def test_box6110_basico_con_matriz():
    """BOX6110 287×200 — ahora la matriz está cargada."""
    r = calcular("BOX6110", linea=287, salida=200)
    assert r.valido, r.motivo_invalido
    assert r.pvp_base == 1537


def test_box6300_basico():
    """BOX6300 285×200 manivela."""
    r = calcular("BOX6300", linea=285, salida=200)
    assert r.valido
    assert r.pvp_base == 1662


def test_box6300_salida_400():
    """BOX6300 425×400 — combinación grande con tarifa."""
    r = calcular("BOX6300", linea=425, salida=400)
    assert r.valido
    assert r.pvp_base == 2697


def test_box6400_bug_348_corregido():
    """BOX6400 348×275 = 1752 (fila que el PDF extraía mal como '248')."""
    r = calcular("BOX6400", linea=348, salida=275)
    assert r.valido
    assert r.pvp_base == 1752, f"Esperado 1752, got {r.pvp_base}"


def test_box6500_basico():
    """BOX6500 397×300 manivela."""
    r = calcular("BOX6500", linea=397, salida=300)
    assert r.valido
    assert r.pvp_base == 3212


def test_box6500_salida_minima():
    """BOX6500: salida mínima 200 cm."""
    r = calcular("BOX6500", linea=400, salida=175)
    assert not r.valido


def test_box7000_basico():
    """BOX7000 365×400 — cofre grande de terraza."""
    r = calcular("BOX7000", linea=365, salida=400)
    assert r.valido
    assert r.pvp_base == 4436


def test_box7000_salida_minima():
    """BOX7000: salida mínima 300 cm."""
    r = calcular("BOX7000", linea=400, salida=200)
    assert not r.valido


def test_box8100_basico_parcial():
    """BOX8100 302×200 — extracción parcial pero válido en rango."""
    r = calcular("BOX8100", linea=302, salida=200)
    assert r.valido
    assert r.pvp_base == 3119
    # Debe haber aviso de tarifa parcial
    assert any("parcial" in a.mensaje.lower() for a in r.avisos)


# ---------- Palillería PL (80×40) ----------

def test_pl7000_basico():
    """PL7000 400×400 manual = 1432€ (línea 400, salida 400)."""
    r = calcular("PL7000", linea=400, salida=400)
    assert r.valido, r.motivo_invalido
    assert r.pvp_base == 1432
    assert r.pvp_unitario == 1432


def test_pl7000_3guias_aviso():
    """PL7000 salida 625+ avisa 3 guías incluidas."""
    r = calcular("PL7000", linea=400, salida=650)
    assert r.valido
    assert any("3 guías" in a.mensaje.lower() or "3 guias" in a.mensaje.lower() for a in r.avisos)


def test_pl7000_linea_bloqueada():
    """PL7000: línea > 700 se resuelve con módulos acoplados."""
    r = calcular("PL7000", linea=800, salida=400)
    assert r.valido, r.motivo_invalido
    assert any(a.regla_id == "acoplado" for a in r.avisos)


def test_pl7000_variante_D_palillo_doble():
    """PL7000_D = base + 10% palillo doble. 400×400 → 1432 + 143.2 = 1575.2."""
    r = calcular("PL7000", linea=400, salida=400, variante="PL7000_D")
    assert r.valido
    assert r.pvp_base == 1432
    assert abs(r.pvp_unitario - (1432 + 1432 * 0.10)) < 0.01
    assert any("palillo doble" in d.concepto.lower() for d in r.desglose)


def test_pl7010_variante_D_palillo_doble_8pct():
    """PL7010_D = base + 8% palillo doble."""
    r = calcular("PL7010", linea=400, salida=400, variante="PL7010_D")
    assert r.valido
    esperado = r.pvp_base * 1.08
    assert abs(r.pvp_unitario - esperado) < 0.01


def test_pl7000_variante_M_motor_incluido():
    """PL7000_M con motor RTS 40Nm → base + 240."""
    r = calcular("PL7000", linea=400, salida=400, variante="PL7000_M", motor_id="rts_40Nm")
    assert r.valido
    assert r.pvp_unitario == 1432 + 240


def test_pl7000_variante_DM_doble_mas_motor():
    """PL7000_DM = base + 10% palillo doble + motor."""
    r = calcular("PL7000", linea=400, salida=400, variante="PL7000_DM", motor_id="rts_40Nm")
    assert r.valido
    esperado = 1432 + 1432 * 0.10 + 240
    assert abs(r.pvp_unitario - esperado) < 0.01


def test_pl7000_variante_DP_alias_de_D():
    """PL7000_DP es alias de _D — mismo resultado."""
    r1 = calcular("PL7000", linea=400, salida=400, variante="PL7000_D")
    r2 = calcular("PL7000", linea=400, salida=400, variante="PL7000_DP")
    assert abs(r1.pvp_unitario - r2.pvp_unitario) < 0.01


def test_pl7000_variante_ESP_requiere_dac():
    """PL7000ESP debe emitir aviso 'requiere DAC' (sin tarifa pública)."""
    r = calcular("PL7000", linea=400, salida=400, variante="PL7000ESP")
    assert r.valido  # sigue válido para precio orientativo
    assert any("dac" in a.mensaje.lower() or "tarifa pública" in a.mensaje.lower() for a in r.avisos)


def test_pl7000_variante_CC_requiere_dac():
    """PL7000CC también requiere DAC."""
    r = calcular("PL7000", linea=400, salida=400, variante="PL7000CC")
    assert any("dac" in a.mensaje.lower() or "tarifa pública" in a.mensaje.lower() for a in r.avisos)


def test_pl7000_variante_desconocida_bloquea():
    """Variante inventada → bloqueo."""
    r = calcular("PL7000", linea=400, salida=400, variante="PL7000_XYZ")
    assert not r.valido
    assert any("variante" in b.mensaje.lower() for b in r.bloqueos)


def test_pl7020_palillo_doble_6pct():
    """PL7020 tiene incremento 6% por palillo doble."""
    r = calcular("PL7020", linea=400, salida=400, variante="PL7020_D")
    assert r.valido
    assert abs(r.pvp_unitario - r.pvp_base * 1.06) < 0.01


def test_pl7030_palillo_doble_4pct():
    """PL7030 tiene incremento 4% por palillo doble."""
    r = calcular("PL7030", linea=400, salida=400, variante="PL7030_D")
    assert r.valido
    assert abs(r.pvp_unitario - r.pvp_base * 1.04) < 0.01


def test_acoplado_box6100_dos_modulos():
    """BOX6100 800×250 = 2 módulos de 400×250 (suma literal de precios)."""
    r = calcular("BOX6100", linea=800, salida=250)
    assert r.valido, r.motivo_invalido
    assert r.pvp_base == 1840 * 2  # precio de 400×250 multiplicado por 2
    assert any(a.regla_id == "acoplado" for a in r.avisos)
    # Desglose debe mostrar "× 2 módulos (acoplado)"
    assert any("2 módulos" in d.concepto and "acoplado" in d.concepto for d in r.desglose)


def test_acoplado_pl7000_dos_modulos():
    """PL7000 800×400 = 2 módulos de 400×400 (palillería acoplada)."""
    r = calcular("PL7000", linea=800, salida=400)
    assert r.valido
    base_1mod = 1432  # PL7000 400×400
    assert r.pvp_base == base_1mod * 2
    assert any(a.regla_id == "acoplado" for a in r.avisos)


def test_acoplado_box6100_prioriza_menor_numero():
    """BOX6100 900×250: elige 2×450 (menor número de módulos) sobre 3×300."""
    # 900 cm / max 600 → necesita acoplado
    # Opción 1: n=2 → 450 cada uno (ambos iguales) ✓
    # Opción 2: n=3 → 300 cada uno (ambos iguales) ✓
    # Gana opción 1 porque n es menor
    r = calcular("BOX6100", linea=900, salida=250)
    assert r.valido
    assert any("2 módulos" in a.mensaje and "450" in a.mensaje for a in r.avisos)


def test_acoplado_no_aplica_dentro_tabla():
    """BOX6100 420×200: dentro de tabla (max 600), no acopla, solo snapea."""
    r = calcular("BOX6100", linea=420, salida=200)
    assert r.valido
    # No debe haber aviso de acoplado
    assert not any(a.regla_id == "acoplado" for a in r.avisos)
    # Desglose muestra medidas snapeadas, no acoplado
    assert any("425" in d.concepto for d in r.desglose)
    assert not any("módulo" in d.concepto.lower() for d in r.desglose)


def test_acoplado_no_resuelve_salida_fuera():
    """BOX6100 800×350: línea se resuelve, pero salida fuera de tabla → sigue bloqueado."""
    r = calcular("BOX6100", linea=800, salida=350)
    # Salida máxima es 300, no hay acoplado en salida
    assert not r.valido
    assert any("salida" in b.mensaje.lower() for b in r.bloqueos)


def test_acoplado_con_motor():
    """BOX6100 800×250 acoplado + motor RTS 50Nm → 1 mando, N motores."""
    # En la cotización, el mando se cobra una vez, pero el motor debería ser por módulo.
    # Aquí solo verificamos que se calcula.
    r = calcular("BOX6100", linea=800, salida=250, motor_id="rts_50Nm")
    assert r.valido
    # pvp_base = 1840 * 2 = 3680
    # motor_recargo = 295 * 2 = 590
    # pvp_unitario = 3680 + 590
    assert r.pvp_unitario == 3680 + 590


def test_normalizar_ref_wrapper():
    """El wrapper del bot reconoce todos los modelos de cofre."""
    import sys as _sys
    _sys.path.insert(0, str(Path(__file__).parent.parent.parent / "todosombra-bot"))
    from awma_rules_core import _normalizar_ref
    casos = [
        ("BOX5200", "BOX5200"),
        ("BOX6000 cofre", "BOX6000"),
        ("BOX6100 cofre", "BOX6100"),
        ("BOX6100 ARES", "BOX6100_ARES"),
        ("BOX6010 INDIE", "BOX6010_INDIE"),
        ("BOX6010 estándar", "BOX6010"),
        ("BOX6110", "BOX6110"),
        ("BOX6300", "BOX6300"),
        ("BOX6400", "BOX6400"),
        ("BOX6500", "BOX6500"),
        ("BOX7000", "BOX7000"),
        ("BOX8100", "BOX8100"),
    ]
    for ref, esperado in casos:
        got = _normalizar_ref(ref)
        assert got == esperado, f"{ref!r} → {got!r} (esperado {esperado!r})"


if __name__ == "__main__":
    import json
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
        test_box6010_indie_basico,
        test_box6010_indie_con_motor_rts,
        test_box6010_indie_salida_fuera_rango,
        test_box6010_indie_linea_fuera_rango,
        test_box6010_indie_combinacion_no_tarifada,
        test_box6010_indie_aviso_salida_grande,
        test_box6010_indie_brazo_smart,
        test_normalizacion_color,
        test_box5200_basico,
        test_box5200_motor_io,
        test_box5200_linea_fuera_rango,
        test_box6000_basico,
        test_box6000_combinacion_no_tarifada,
        test_box6100_basico,
        test_box6100_no_kit_ares_en_sobreprecios,
        test_box6110_basico_con_matriz,
        test_box6300_basico,
        test_box6300_salida_400,
        test_box6400_bug_348_corregido,
        test_box6500_basico,
        test_box6500_salida_minima,
        test_box7000_basico,
        test_box7000_salida_minima,
        test_box8100_basico_parcial,
        test_pl7000_basico,
        test_pl7000_3guias_aviso,
        test_pl7000_linea_bloqueada,
        test_pl7000_variante_D_palillo_doble,
        test_pl7010_variante_D_palillo_doble_8pct,
        test_pl7000_variante_M_motor_incluido,
        test_pl7000_variante_DM_doble_mas_motor,
        test_pl7000_variante_DP_alias_de_D,
        test_pl7000_variante_ESP_requiere_dac,
        test_pl7000_variante_CC_requiere_dac,
        test_pl7000_variante_desconocida_bloquea,
        test_pl7020_palillo_doble_6pct,
        test_pl7030_palillo_doble_4pct,
        test_acoplado_box6100_dos_modulos,
        test_acoplado_pl7000_dos_modulos,
        test_acoplado_box6100_prioriza_menor_numero,
        test_acoplado_no_aplica_dentro_tabla,
        test_acoplado_no_resuelve_salida_fuera,
        test_acoplado_con_motor,
        test_normalizar_ref_wrapper,
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
