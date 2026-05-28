"""Reglas duras del configurador AWMA (DAC) por modelo.

Extraído del .abd BOX6110 que nos pasó AWMA. Estructurado para añadir más
modelos a medida que recibamos sus .abd (BOX6300, etc.).

API pública:
    validar(modelo_id_o_linea, linea_cm, salida_cm, color_aluminio=None) -> Validacion
"""
from dataclasses import dataclass, field
from typing import Optional, Tuple


@dataclass
class Validacion:
    bloqueos: list = field(default_factory=list)
    avisos: list = field(default_factory=list)

    @property
    def ok(self) -> bool:
        return not self.bloqueos


# Tabla de brazos invisibles BOX6110 (en cm de salida).
# Premium acepta desde 125; Concept 350 desde 150. Máximo físico: 350.
_BRAZOS_PREMIUM = (125, 150, 175, 200, 225, 250, 275, 300, 325, 350)
_BRAZOS_CONCEPT = (150, 175, 200, 225, 250, 275, 300, 325, 350)


def _brazo_para_salida(salida_cm: int, tabla: Tuple[int, ...]) -> Optional[int]:
    for b in tabla:
        if salida_cm <= b:
            return b
    return None


def _es_box6110(ref: str) -> bool:
    ref = (ref or "").upper()
    return "BOX6110" in ref or "BOX 6110" in ref


def _normalizar_color(color: str) -> str:
    return (color or "").strip().lower()


def _validar_box6110(linea: int, salida: int, color: Optional[str]) -> Validacion:
    v = Validacion()

    if linea < 179:
        v.bloqueos.append(f"Línea mínima del BOX6110: 179 cm (has pedido {linea}).")
    if linea > 600:
        v.bloqueos.append(f"Línea máxima del BOX6110: 600 cm (has pedido {linea}).")
    if salida < 150:
        v.bloqueos.append(f"Salida mínima del BOX6110: 150 cm (has pedido {salida}).")
    if salida > 400:
        v.bloqueos.append(f"Salida máxima del BOX6110: 400 cm (has pedido {salida}).")

    # Salidas 350 < x ≤ 400: tarifa lo permite pero el DAC se queda en 350.
    # → requiere validación del técnico antes de cerrar venta.
    if 350 < salida <= 400:
        v.avisos.append(
            "Salida >350 cm: la tarifa la contempla pero el configurador AWMA solo "
            "monta brazos hasta 350 cm. Lo confirma el técnico antes de pedir."
        )

    # Refuerzo: línea >500 y salida >300 → kit con 3 brazos.
    if linea > 500 and salida > 300:
        v.avisos.append(
            "Para línea >500 cm y salida >300 cm el toldo lleva refuerzo "
            "(3 brazos en lugar de 2). Coste extra de fábrica."
        )

    # Color: por encima de 505 cm de línea solo va en blanco (perfil grande).
    if color and linea > 505:
        c = _normalizar_color(color)
        if "blanco" not in c and "9010" not in c:
            v.bloqueos.append(
                f"Para línea >505 cm el perfil del BOX6110 solo está disponible "
                f"en blanco. Has pedido «{color}»."
            )

    # Recordatorio de instalación (no preguntamos esto en el bot, pero conviene avisar).
    if linea > 510:
        v.avisos.append(
            "Línea >510 cm: la instalación a techo no es válida en este modelo "
            "(debe ir a pared o entreparedes)."
        )

    # Salto de tabla de brazos (informativo).
    brazo = _brazo_para_salida(salida, _BRAZOS_CONCEPT)
    if brazo is not None and brazo != salida:
        v.avisos.append(
            f"La salida real de fábrica será {brazo} cm (brazos Concept 350 "
            f"vienen en saltos de 25 cm)."
        )

    return v


def validar(modelo_ref: str, linea_cm: int, salida_cm: int, color_aluminio: Optional[str] = None) -> Validacion:
    """Aplica las reglas duras del modelo. Si el modelo no tiene reglas registradas,
    devuelve Validacion vacía (ok=True, sin avisos)."""
    if _es_box6110(modelo_ref):
        return _validar_box6110(linea_cm, salida_cm, color_aluminio)
    return Validacion()
