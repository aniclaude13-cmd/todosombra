#!/usr/bin/env python3
"""Generador de hoja de pedido AWMA (HPED) a partir de cotización del motor.

Universal: soporta cualquier familia con catálogo en awma-core/catalog/ (palillería,
toldo_cofre, toldo_brazo, vertical, ...). Las secciones específicas de cada familia
se renderizan según `tipo_producto` (o el campo `tipo` del catálogo). Campos no
aplicables a la familia se omiten.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Optional

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER

AWMA_CORE = Path(__file__).resolve().parent.parent


# Mapeo tipo_producto → etiqueta de título.
TIPO_LABEL = {
    "palilleria": "PALILLERÍA",
    "toldo_cofre": "TOLDO COFRE",
    "toldo_brazo": "TOLDO PUNTO RECTO",
    "vertical": "TOLDO VERTICAL",
}


@dataclass
class ConfiguracionHPED:
    """Configuración del toldo para la hoja de pedido."""
    cliente: str = ""
    nro_oferta: str = ""
    fecha: str = ""
    producto_id: str = ""
    producto_nombre: str = ""
    tipo_producto: str = ""  # palilleria | toldo_cofre | toldo_brazo | vertical | ""
    linea_cm: int = 0
    salida_cm: int = 0

    # Comunes
    color_ral: str = "9016"

    # Palillería (solo si tipo_producto == "palilleria")
    palillo: str = ""
    tipo_onda: str = ""

    # Motorización (todas las familias)
    motorizado: bool = False
    tipo_motor: str = ""
    mando_posicion: str = ""

    # Acabados de lona / orientación (palillería + toldo_brazo)
    caida_agua: str = ""
    faldilla_delantera: str = ""
    faldilla_trasera: str = ""
    altura_faldilla: str = ""
    ribete: str = ""

    # Accesorios: lista de tuplas (ref, desc, cant)
    accesorios: list = None

    # Observaciones libres
    observaciones: str = ""

    # PVP orientativo
    pvp_unitario: float = 0.0
    cantidad: int = 1

    # Extras por familia: dict[str, str] con etiquetas y valores.
    # Ej. toldo_cofre → {"Brazos": "Premium 2,00", "Tapas": "Aluminio"}
    extras: dict = field(default_factory=dict)

    def __post_init__(self):
        if self.accesorios is None:
            self.accesorios = []


# ---------- Helpers de estilo ----------

def _styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "Title", parent=base["Heading1"], fontSize=16,
            textColor=colors.HexColor("#1F4788"), spaceAfter=6, alignment=TA_CENTER,
        ),
        "heading": ParagraphStyle(
            "Heading", parent=base["Heading2"], fontSize=11,
            textColor=colors.HexColor("#1F4788"), spaceAfter=4, spaceBefore=6,
        ),
        "normal": ParagraphStyle(
            "Normal", parent=base["Normal"], fontSize=9, spaceAfter=2,
        ),
        "footer": ParagraphStyle(
            "Footer", parent=base["Normal"], fontSize=7, textColor=colors.grey,
        ),
    }


def _block_style(highlight_first_row: bool = True):
    style = [
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 3),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
    ]
    if highlight_first_row:
        style.append(("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E8F0F8")))
    return TableStyle(style)


def _kv_table(rows: list, styles: dict, col_widths=(3 * cm, 7 * cm)) -> Table:
    """Tabla simple de dos columnas (etiqueta, valor)."""
    data = [
        [Paragraph(f"<b>{k}</b>", styles["normal"]), Paragraph(str(v) if v not in (None, "") else "—", styles["normal"])]
        for k, v in rows
    ]
    t = Table(data, colWidths=list(col_widths))
    t.setStyle(_block_style(highlight_first_row=False))
    return t


# ---------- Secciones por familia ----------

def _config_rows(config: ConfiguracionHPED) -> list:
    """Devuelve filas (etiqueta, valor) para la sección Configuración según tipo."""
    tipo = (config.tipo_producto or "").lower()
    rows: list = []

    if tipo == "palilleria":
        rows.append(("Palillo", config.palillo or "SIMPLE"))
        rows.append(("Tipo Onda", config.tipo_onda or "NORMAL"))
        rows.append(("Color RAL", config.color_ral))
        if config.caida_agua:
            rows.append(("Caída Agua", config.caida_agua))
    elif tipo == "toldo_cofre":
        rows.append(("Color RAL cofre", config.color_ral))
        # Extras típicos: Brazos, Tapas, Soporte
        for k in ("Brazos", "Tapas", "Soporte"):
            if config.extras.get(k):
                rows.append((k, config.extras[k]))
        if config.caida_agua:
            rows.append(("Caída Agua", config.caida_agua))
    elif tipo == "toldo_brazo":
        rows.append(("Color RAL estructura", config.color_ral))
        for k in ("Brazos", "Tensor", "Soporte"):
            if config.extras.get(k):
                rows.append((k, config.extras[k]))
        if config.caida_agua:
            rows.append(("Caída Agua", config.caida_agua))
    elif tipo == "vertical":
        rows.append(("Color RAL cajón", config.color_ral))
        for k in ("Sistema", "Color tejido", "Guía"):
            if config.extras.get(k):
                rows.append((k, config.extras[k]))
    else:
        # Genérico: solo color RAL + extras.
        rows.append(("Color RAL", config.color_ral))

    # Volcamos extras no consumidos por las claves predefinidas.
    usados = {r[0] for r in rows}
    for k, v in config.extras.items():
        if k not in usados and v:
            rows.append((k, v))

    return rows


def _acabados_rows(config: ConfiguracionHPED) -> list:
    """Devuelve filas de acabados de lona (solo si la familia los usa)."""
    tipo = (config.tipo_producto or "").lower()
    if tipo not in ("palilleria", "toldo_cofre", "toldo_brazo"):
        return []
    rows = []
    if config.faldilla_delantera:
        rows.append(("Faldilla Delantera", config.faldilla_delantera))
    if config.faldilla_trasera:
        rows.append(("Faldilla Trasera", config.faldilla_trasera))
    if config.altura_faldilla:
        rows.append(("Altura Faldilla", config.altura_faldilla))
    if config.ribete:
        rows.append(("Ribete", config.ribete))
    return rows


# ---------- Generador principal ----------

def generar_hped_pdf(config: ConfiguracionHPED, output_path: Path) -> Path:
    """Genera PDF de hoja de pedido AWMA universal."""
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        rightMargin=10 * mm,
        leftMargin=10 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
    )
    styles = _styles()
    story = []

    # Título dinámico según tipo_producto.
    label = TIPO_LABEL.get((config.tipo_producto or "").lower(), "PRODUCTO")
    nombre = config.producto_nombre or config.producto_id or label
    story.append(Paragraph(f"HOJA DE PEDIDO AWMA — {label} {config.producto_id}".strip(), styles["title"]))
    story.append(Spacer(1, 4 * mm))

    # Datos cliente / oferta
    story.append(_kv_table(
        [
            ("CLIENTE", config.cliente),
            ("Nº OFERTA", config.nro_oferta),
            ("FECHA", config.fecha or datetime.now().strftime("%d/%m/%Y")),
        ],
        styles,
        col_widths=(4 * cm, 6 * cm),
    ))
    story.append(Spacer(1, 4 * mm))

    # Producto
    story.append(Paragraph("<b>PRODUCTO</b>", styles["heading"]))
    story.append(_kv_table(
        [
            ("SKU", config.producto_id),
            ("Descripción", nombre),
        ],
        styles,
    ))
    story.append(Spacer(1, 4 * mm))

    # Dimensiones
    story.append(Paragraph("<b>DIMENSIONES (cm)</b>", styles["heading"]))
    dim_data = [[
        Paragraph("<b>LÍNEA (ancho)</b>", styles["normal"]),
        Paragraph(str(config.linea_cm), styles["normal"]),
        Paragraph("<b>SALIDA (proyección)</b>", styles["normal"]),
        Paragraph(str(config.salida_cm), styles["normal"]),
    ]]
    dim_table = Table(dim_data, colWidths=[3 * cm, 2 * cm, 3 * cm, 2 * cm])
    dim_table.setStyle(_block_style(highlight_first_row=True))
    story.append(dim_table)
    story.append(Spacer(1, 4 * mm))

    # Configuración (dispatch por tipo)
    cfg_rows = _config_rows(config)
    if cfg_rows:
        story.append(Paragraph("<b>CONFIGURACIÓN</b>", styles["heading"]))
        story.append(_kv_table(cfg_rows, styles))
        story.append(Spacer(1, 4 * mm))

    # Motorización
    if config.motorizado:
        story.append(Paragraph("<b>MOTORIZACIÓN</b>", styles["heading"]))
        story.append(_kv_table(
            [
                ("Tipo Motor", config.tipo_motor),
                ("Mando", config.mando_posicion),
            ],
            styles,
        ))
        story.append(Spacer(1, 4 * mm))

    # Acabados (solo si aplica)
    acab_rows = _acabados_rows(config)
    if acab_rows:
        story.append(Paragraph("<b>ACABADOS</b>", styles["heading"]))
        story.append(_kv_table(acab_rows, styles))
        story.append(Spacer(1, 4 * mm))

    # Accesorios
    if config.accesorios:
        story.append(Paragraph("<b>ACCESORIOS</b>", styles["heading"]))
        acc_data = [["REF", "DESCRIPCIÓN", "CANT"]]
        for ref, desc, cant in config.accesorios:
            acc_data.append([
                Paragraph(str(ref), styles["normal"]),
                Paragraph(desc, styles["normal"]),
                Paragraph(str(cant), styles["normal"]),
            ])
        acc_table = Table(acc_data, colWidths=[2 * cm, 6 * cm, 1.5 * cm])
        acc_table.setStyle(TableStyle([
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1F4788")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
            ("ALIGN", (2, 0), (2, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("LEFTPADDING", (0, 0), (-1, -1), 2),
            ("RIGHTPADDING", (0, 0), (-1, -1), 2),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
        ]))
        story.append(acc_table)
        story.append(Spacer(1, 4 * mm))

    # PVP orientativo
    if config.pvp_unitario > 0:
        story.append(Paragraph("<b>PRESUPUESTO (orientativo)</b>", styles["heading"]))
        pvp_data = [
            [
                Paragraph("PVP Unitario (€)", styles["normal"]),
                Paragraph(f"{config.pvp_unitario:.2f}", styles["normal"]),
                Paragraph("Cantidad", styles["normal"]),
                Paragraph(str(config.cantidad), styles["normal"]),
            ],
            [
                Paragraph("<b>TOTAL (€)</b>", styles["normal"]),
                Paragraph(f"<b>{config.pvp_unitario * config.cantidad:.2f}</b>", styles["normal"]),
                Paragraph("", styles["normal"]),
                Paragraph("", styles["normal"]),
            ],
        ]
        pvp_table = Table(pvp_data, colWidths=[3 * cm, 2.5 * cm, 2.5 * cm, 2 * cm])
        pvp_table.setStyle(TableStyle([
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E8F0F8")),
            ("BACKGROUND", (0, 1), (-1, 1), colors.HexColor("#D0DFE8")),
            ("ALIGN", (0, 0), (-1, -1), "RIGHT"),
            ("ALIGN", (0, 0), (0, -1), "LEFT"),
            ("ALIGN", (2, 0), (2, -1), "LEFT"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("LEFTPADDING", (0, 0), (-1, -1), 3),
            ("RIGHTPADDING", (0, 0), (-1, -1), 3),
        ]))
        story.append(pvp_table)
        story.append(Spacer(1, 4 * mm))

    # Observaciones
    if config.observaciones:
        story.append(Paragraph("<b>OBSERVACIONES</b>", styles["heading"]))
        story.append(Paragraph(config.observaciones, styles["normal"]))
        story.append(Spacer(1, 4 * mm))

    # Footer
    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph(
        "<i>Documento generado automáticamente por AWMA Core Engine. "
        "PVP orientativo — sujeto a confirmación por AWMA.</i>",
        styles["footer"],
    ))

    doc.build(story)
    return output_path


# ---------- Constructor desde resultado del motor ----------

def desde_resultado_engine(
    resultado,
    cliente: str = "",
    nro_oferta: str = "",
    tipo_producto: str = "",
    motorizado: bool = False,
    tipo_motor: str = "",
    mando_posicion: str = "",
    caida_agua: str = "",
    palillo: str = "",
    tipo_onda: str = "",
    color_ral: str = "9016",
    extras: Optional[dict] = None,
    observaciones: str = "",
) -> ConfiguracionHPED:
    """Construye ConfiguracionHPED a partir de un Resultado del motor.

    `tipo_producto` puede pasarse explícito o inferirse del catálogo via
    `cargar_tipo_desde_catalogo(producto_id)` por quien llama.
    """
    return ConfiguracionHPED(
        cliente=cliente,
        nro_oferta=nro_oferta,
        fecha=datetime.now().strftime("%d/%m/%Y"),
        producto_id=resultado.producto_nombre.split()[0],
        producto_nombre=resultado.producto_nombre,
        tipo_producto=tipo_producto,
        linea_cm=resultado.linea,
        salida_cm=resultado.salida,
        palillo=palillo,
        tipo_onda=tipo_onda,
        motorizado=motorizado,
        tipo_motor=tipo_motor,
        mando_posicion=mando_posicion,
        caida_agua=caida_agua,
        color_ral=color_ral,
        extras=extras or {},
        pvp_unitario=resultado.pvp_unitario,
        cantidad=1,
        observaciones=observaciones,
    )


def cargar_tipo_desde_catalogo(producto_id: str) -> str:
    """Lee `tipo` del catálogo JSON. Devuelve "" si no existe."""
    ruta = AWMA_CORE / "catalog" / f"{producto_id}.json"
    if not ruta.exists():
        # Fallback al directorio auto/.
        ruta = AWMA_CORE / "catalog" / "auto" / f"{producto_id}.json"
        if not ruta.exists():
            return ""
    try:
        with ruta.open("r", encoding="utf-8") as f:
            return json.load(f).get("tipo", "")
    except Exception:
        return ""


# ---------- CLI: smoke tests para tres familias ----------

if __name__ == "__main__":
    import sys

    sys.path.insert(0, str(AWMA_CORE / "py"))
    from engine import calcular  # noqa: E402

    out_dir = AWMA_CORE / "catalog"

    samples = [
        # (producto_id, linea, salida, variante, tipo, extras, palillo, tipo_onda)
        ("PL7000", 400, 400, "PL7000_D", "palilleria",
         {}, "DOBLE", "NORMAL"),
        ("BOX6100_ARES", 346, 200, None, "toldo_cofre",
         {"Brazos": "Premium 2,00", "Tapas": "Aluminio cofre"}, "", ""),
        ("BOX6100", 400, 250, None, "toldo_cofre",
         {"Brazos": "Estándar 2,50"}, "", ""),
    ]

    for pid, linea, salida, variante, tipo, extras, palillo, tipo_onda in samples:
        try:
            r = calcular(pid, linea=linea, salida=salida, variante=variante) if variante \
                else calcular(pid, linea=linea, salida=salida)
        except Exception as e:
            print(f"⚠️ {pid} {linea}×{salida}: motor falló ({e}) — saltando")
            continue
        cfg = desde_resultado_engine(
            r,
            cliente="Cliente Ejemplo",
            nro_oferta="2026-DEMO",
            tipo_producto=tipo or cargar_tipo_desde_catalogo(pid),
            motorizado=False,
            palillo=palillo,
            tipo_onda=tipo_onda,
            color_ral="9016",
            extras=extras,
            observaciones="Demo HPED universal (fase 2).",
        )
        out = out_dir / f"HPED_{pid}_{linea}x{salida}.pdf"
        generar_hped_pdf(cfg, out)
        print(f"✅ {out.name}")
