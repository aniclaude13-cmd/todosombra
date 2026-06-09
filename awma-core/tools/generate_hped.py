#!/usr/bin/env python3
"""Generador de hoja de pedido AWMA (HPED) a partir de cotización del motor.

Produce un PDF rellenable que AWMA puede procesar directamente.
Campos: cliente, nº oferta, fecha, dimensiones, configuración, motorización, accesorios.
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Optional

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

AWMA_CORE = Path(__file__).resolve().parent.parent


@dataclass
class ConfiguracionHPED:
    """Configuración del toldo para la hoja de pedido."""
    cliente: str = ""
    nro_oferta: str = ""
    fecha: str = ""
    producto_id: str = ""
    producto_nombre: str = ""
    linea_cm: int = 0
    salida_cm: int = 0

    # Configuración
    palillo: str = "SIMPLE"  # SIMPLE | DOBLE
    tipo_onda: str = "NORMAL"  # NORMAL | TENDASA | PLUSS ONDA
    color_ral: str = "9016"  # código RAL

    # Motorización
    motorizado: bool = False
    tipo_motor: str = ""  # CABLE | CORREA | REENVÍO DE CUERDA
    mando_posicion: str = ""  # IZQUIERDA | DERECHA

    # Faldilla y ribetes
    caida_agua: str = ""  # "" | DERECHA | IZQUIERDA
    faldilla_delantera: str = "estándar Nº51 (25cm)"
    faldilla_trasera: str = "estándar Nº51 (25cm)"
    altura_faldilla: str = "estándar 15cm"
    ribete: str = "estándar a tono"

    # Accesorios (lista de tuplas (ref, desc, cant))
    accesorios: list = None

    # Observaciones
    observaciones: str = ""

    # PVP (orientativo)
    pvp_unitario: float = 0.0
    cantidad: int = 1

    def __post_init__(self):
        if self.accesorios is None:
            self.accesorios = []


def generar_hped_pdf(config: ConfiguracionHPED, output_path: Path) -> Path:
    """Genera PDF de hoja de pedido AWMA."""

    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        rightMargin=10*mm,
        leftMargin=10*mm,
        topMargin=15*mm,
        bottomMargin=15*mm,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        fontSize=16,
        textColor=colors.HexColor('#1F4788'),
        spaceAfter=6,
        alignment=TA_CENTER,
    )

    heading_style = ParagraphStyle(
        'Heading',
        parent=styles['Heading2'],
        fontSize=11,
        textColor=colors.HexColor('#1F4788'),
        spaceAfter=4,
        spaceBefore=6,
        bold=True,
    )

    normal_style = ParagraphStyle(
        'Normal',
        parent=styles['Normal'],
        fontSize=9,
        spaceAfter=2,
    )

    story = []

    # Encabezado
    story.append(Paragraph("HOJA DE PEDIDO AWMA — PALILLERÍA 80×40", title_style))
    story.append(Spacer(1, 4*mm))

    # Datos cliente / oferta
    header_data = [
        [Paragraph("<b>CLIENTE:</b>", normal_style), Paragraph(config.cliente or "___________________", normal_style)],
        [Paragraph("<b>Nº OFERTA:</b>", normal_style), Paragraph(config.nro_oferta or "___________________", normal_style)],
        [Paragraph("<b>FECHA:</b>", normal_style), Paragraph(config.fecha or datetime.now().strftime("%d/%m/%Y"), normal_style)],
    ]
    header_table = Table(header_data, colWidths=[4*cm, 6*cm])
    header_table.setStyle(TableStyle([
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 2),
        ('RIGHTPADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 4*mm))

    # Producto
    story.append(Paragraph("<b>PRODUCTO:</b>", heading_style))
    prod_data = [
        [Paragraph("SKU", normal_style), Paragraph(config.producto_id, normal_style)],
        [Paragraph("Descripción", normal_style), Paragraph(config.producto_nombre, normal_style)],
    ]
    prod_table = Table(prod_data, colWidths=[3*cm, 7*cm])
    prod_table.setStyle(TableStyle([
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E8F0F8')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 3),
        ('RIGHTPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    story.append(prod_table)
    story.append(Spacer(1, 4*mm))

    # Dimensiones
    story.append(Paragraph("<b>DIMENSIONES (cm):</b>", heading_style))
    dim_data = [
        [
            Paragraph("LÍNEA (ancho)", normal_style),
            Paragraph(f"{config.linea_cm}", normal_style),
            Paragraph("SALIDA (proyección)", normal_style),
            Paragraph(f"{config.salida_cm}", normal_style),
        ]
    ]
    dim_table = Table(dim_data, colWidths=[3*cm, 2*cm, 3*cm, 2*cm])
    dim_table.setStyle(TableStyle([
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E8F0F8')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('LEFTPADDING', (0, 0), (-1, -1), 3),
        ('RIGHTPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(dim_table)
    story.append(Spacer(1, 4*mm))

    # Configuración
    story.append(Paragraph("<b>CONFIGURACIÓN:</b>", heading_style))
    config_data = [
        [
            Paragraph("Palillo", normal_style),
            Paragraph(config.palillo, normal_style),
            Paragraph("Tipo Onda", normal_style),
            Paragraph(config.tipo_onda, normal_style),
        ],
        [
            Paragraph("Color RAL", normal_style),
            Paragraph(config.color_ral, normal_style),
            Paragraph("Caída Agua", normal_style),
            Paragraph(config.caida_agua or "—", normal_style),
        ],
    ]
    config_table = Table(config_data, colWidths=[2.5*cm, 2.5*cm, 2.5*cm, 2.5*cm])
    config_table.setStyle(TableStyle([
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E8F0F8')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('LEFTPADDING', (0, 0), (-1, -1), 2),
        ('RIGHTPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(config_table)
    story.append(Spacer(1, 4*mm))

    # Motorización
    if config.motorizado:
        story.append(Paragraph("<b>MOTORIZACIÓN:</b>", heading_style))
        motor_data = [
            [
                Paragraph("Tipo Motor", normal_style),
                Paragraph(config.tipo_motor or "—", normal_style),
                Paragraph("Mando", normal_style),
                Paragraph(config.mando_posicion or "—", normal_style),
            ]
        ]
        motor_table = Table(motor_data, colWidths=[2.5*cm, 2.5*cm, 2.5*cm, 2.5*cm])
        motor_table.setStyle(TableStyle([
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E8F0F8')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('LEFTPADDING', (0, 0), (-1, -1), 2),
            ('RIGHTPADDING', (0, 0), (-1, -1), 2),
        ]))
        story.append(motor_table)
        story.append(Spacer(1, 4*mm))

    # Faldillas y ribetes
    story.append(Paragraph("<b>ACABADOS:</b>", heading_style))
    acabados_data = [
        [
            Paragraph("Faldilla Delantera", normal_style),
            Paragraph(config.faldilla_delantera, normal_style),
        ],
        [
            Paragraph("Faldilla Trasera", normal_style),
            Paragraph(config.faldilla_trasera, normal_style),
        ],
        [
            Paragraph("Altura Faldilla", normal_style),
            Paragraph(config.altura_faldilla, normal_style),
        ],
        [
            Paragraph("Ribete", normal_style),
            Paragraph(config.ribete, normal_style),
        ],
    ]
    acabados_table = Table(acabados_data, colWidths=[3*cm, 7*cm])
    acabados_table.setStyle(TableStyle([
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E8F0F8')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('LEFTPADDING', (0, 0), (-1, -1), 2),
        ('RIGHTPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
    ]))
    story.append(acabados_table)
    story.append(Spacer(1, 4*mm))

    # Accesorios
    if config.accesorios:
        story.append(Paragraph("<b>ACCESORIOS:</b>", heading_style))
        acc_data = [["REF", "DESCRIPCIÓN", "CANT"]]
        for ref, desc, cant in config.accesorios:
            acc_data.append([
                Paragraph(str(ref), normal_style),
                Paragraph(desc, normal_style),
                Paragraph(str(cant), normal_style),
            ])
        acc_table = Table(acc_data, colWidths=[2*cm, 6*cm, 1.5*cm])
        acc_table.setStyle(TableStyle([
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4788')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (2, 0), (2, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('LEFTPADDING', (0, 0), (-1, -1), 2),
            ('RIGHTPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
        ]))
        story.append(acc_table)
        story.append(Spacer(1, 4*mm))

    # PVP (orientativo)
    if config.pvp_unitario > 0:
        story.append(Paragraph("<b>PRESUPUESTO (orientativo):</b>", heading_style))
        pvp_data = [
            [
                Paragraph("PVP Unitario (€)", normal_style),
                Paragraph(f"{config.pvp_unitario:.2f}", normal_style),
                Paragraph("Cantidad", normal_style),
                Paragraph(str(config.cantidad), normal_style),
            ],
            [
                Paragraph("<b>TOTAL (€)</b>", normal_style),
                Paragraph(f"<b>{config.pvp_unitario * config.cantidad:.2f}</b>", normal_style),
                Paragraph("", normal_style),
                Paragraph("", normal_style),
            ],
        ]
        pvp_table = Table(pvp_data, colWidths=[3*cm, 2.5*cm, 2.5*cm, 2*cm])
        pvp_table.setStyle(TableStyle([
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E8F0F8')),
            ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#D0DFE8')),
            ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (2, 0), (2, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('LEFTPADDING', (0, 0), (-1, -1), 3),
            ('RIGHTPADDING', (0, 0), (-1, -1), 3),
        ]))
        story.append(pvp_table)
        story.append(Spacer(1, 4*mm))

    # Observaciones
    if config.observaciones:
        story.append(Paragraph("<b>OBSERVACIONES:</b>", heading_style))
        story.append(Paragraph(config.observaciones, normal_style))
        story.append(Spacer(1, 4*mm))

    # Footer
    story.append(Spacer(1, 8*mm))
    footer = Paragraph(
        "<i>Documento generado automáticamente por AWMA Core Engine. "
        "PVP orientativo — sujeto a confirmación por AWMA.</i>",
        ParagraphStyle('Footer', parent=styles['Normal'], fontSize=7, textColor=colors.grey)
    )
    story.append(footer)

    doc.build(story)
    return output_path


def desde_resultado_engine(resultado, cliente: str = "", nro_oferta: str = "",
                          motorizado: bool = False, tipo_motor: str = "",
                          mando_posicion: str = "", caida_agua: str = "",
                          palillo: str = "SIMPLE", color_ral: str = "9016",
                          observaciones: str = "") -> ConfiguracionHPED:
    """Construye ConfiguracionHPED desde un Resultado del motor."""
    return ConfiguracionHPED(
        cliente=cliente,
        nro_oferta=nro_oferta,
        fecha=datetime.now().strftime("%d/%m/%Y"),
        producto_id=resultado.producto_nombre.split()[0],  # SKU del nombre
        producto_nombre=resultado.producto_nombre,
        linea_cm=resultado.linea,
        salida_cm=resultado.salida,
        palillo=palillo,
        motorizado=motorizado,
        tipo_motor=tipo_motor,
        mando_posicion=mando_posicion,
        caida_agua=caida_agua,
        color_ral=color_ral,
        pvp_unitario=resultado.pvp_unitario,
        cantidad=1,
        observaciones=observaciones,
    )


if __name__ == "__main__":
    # Ejemplo: generar HPED para una cotización PL7000 400×400
    import sys
    sys.path.insert(0, str(AWMA_CORE / "py"))
    from engine import calcular

    r = calcular("PL7000", linea=400, salida=400, variante="PL7000_D")

    config = desde_resultado_engine(
        r,
        cliente="Cliente Ejemplo",
        nro_oferta="2026-0123",
        motorizado=False,
        palillo="DOBLE",
        color_ral="9016",
        observaciones="Entrega en 4 semanas. Incluye montaje.",
    )

    out = AWMA_CORE / "catalog" / "HPED_PL7000_400x400_D.pdf"
    generar_hped_pdf(config, out)
    print(f"✅ HPED generado: {out}")
