"""Wrapper de compatibilidad: emula awma_rules viejo pero usa el core nuevo.

Transición suave del bot.py. Cuando todo esté migrando, esto desaparece.

Interfaz antigua:
    validar(ref: str, linea: int, salida: int, color=None) -> Validacion

Nueva interfaz (core):
    calcular(producto_id, linea, salida, ...) -> Resultado

Este wrapper detecta el producto a partir de `ref` y delega al core.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional
import sys
from pathlib import Path

# Importar motor del core
sys.path.insert(0, str(Path(__file__).parent.parent / "awma-core" / "py"))
from engine import calcular as core_calcular


@dataclass
class Validacion:
    """Resultado del validar() antiguo — emulamos esto con Resultado del core."""
    bloqueos: list = None
    avisos: list = None

    def __post_init__(self):
        if self.bloqueos is None:
            self.bloqueos = []
        if self.avisos is None:
            self.avisos = []

    @property
    def ok(self) -> bool:
        return not self.bloqueos


def _normalizar_ref(ref: str) -> Optional[str]:
    """Extrae el producto_id del string ref, ej. 'BOX6110 cofre' -> 'BOX6110'."""
    if not ref:
        return None
    ref = ref.strip().upper()
    for modelo in ["BOX6110", "BOX6100", "BOX6100_ARES", "PALILLERIA_80X40"]:
        if modelo in ref:
            return modelo
    # Si no reconoce, assume que es el ID exacto
    return ref


def validar(
    ref: str,
    linea: int,
    salida: int,
    color_aluminio: Optional[str] = None,
) -> Validacion:
    """Valida una combinación de producto/medidas contra las reglas duras del DAC.

    Emula la interfaz antigua de awma_rules.validar() pero usa el core nuevo.

    Args:
        ref: Referencia del producto, ej. "BOX6110" o "BOX6110 cofre"
        linea: Ancho en cm
        salida: Profundidad en cm
        color_aluminio: Color RAL o nombre, ej. "blanco", "9010", "rojo"

    Returns:
        Validacion con .bloqueos (errores) y .avisos (warnings)
    """
    producto_id = _normalizar_ref(ref)
    if not producto_id:
        # Si no podemos identificar el producto, asumimos que es válido
        return Validacion(bloqueos=[], avisos=[])

    try:
        resultado = core_calcular(
            producto_id=producto_id,
            linea=linea,
            salida=salida,
            color=color_aluminio,
        )
    except FileNotFoundError:
        # Catálogo no existe aún
        return Validacion(bloqueos=[], avisos=[])

    # Convertir Resultado del core a Validacion antigua
    bloqueos = [b.mensaje for b in resultado.bloqueos]
    avisos = [a.mensaje for a in resultado.avisos]

    return Validacion(bloqueos=bloqueos, avisos=avisos)
