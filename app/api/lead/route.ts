import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { pingTelegramOwner } from '@/lib/telegram-service';
import { calcularInstalacionProducto } from '@/lib/configurador/catalog';

export interface LeadRequest {
  cliente: {
    nombre: string;
    telefono: string;
    localidad: string;
  };
  productoId: string | null;
  linea: number | null;
  salida: number | null;
  variantePL: string | null;
  colorAluminio: string | null;
  motor: string | null;
  colorTela: string | null;
  complementos: Array<{ nombre: string; precio?: number }>;
  precioTotal: number;
  incluirInstalacion?: boolean;
}

const eur = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n);

async function enviarLeadInstalacion(lead: LeadRequest & { id: string; timestamp: string }, instalacionPrecio: number) {
  const dest = process.env.LEAD_INSTALACION_TO || 'aniclaude13@gmail.com';
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER || 'aniclaude13@gmail.com',
      pass: process.env.GMAIL_APP_PASSWORD || '',
    },
  });

  const html = `
    <h2>Nuevo lead con instalación: ${lead.id}</h2>
    <p><strong>Cliente:</strong> ${lead.cliente.nombre}<br>
       <strong>Teléfono:</strong> ${lead.cliente.telefono}<br>
       <strong>Localidad:</strong> ${lead.cliente.localidad}</p>

    <p><strong>Modelo:</strong> ${lead.productoId} · ${lead.linea}×${lead.salida} cm</p>
    <p><strong>RAL:</strong> ${lead.colorAluminio || '—'} · <strong>Tejido:</strong> ${lead.colorTela || '—'} · <strong>Motor:</strong> ${lead.motor || 'manual'}</p>

    <table style="border-collapse: collapse; margin: 12px 0;">
      <tr><td style="padding: 6px 12px;">Toldo (sin IVA)</td><td align="right" style="padding: 6px 12px;">${eur(lead.precioTotal)}</td></tr>
      <tr><td style="padding: 6px 12px;">Instalación orientativa</td><td align="right" style="padding: 6px 12px;">${eur(instalacionPrecio)}</td></tr>
    </table>

    <p style="font-size: 12px; color: #666;">
      Lead generado desde el cotizador web. Confirmar visita técnica con el cliente.<br>
      Timestamp: ${lead.timestamp}
    </p>
  `;

  await transporter.sendMail({
    from: process.env.GMAIL_USER || 'aniclaude13@gmail.com',
    to: dest,
    subject: `[TodoSombra · INSTALACIÓN] ${lead.cliente.nombre} · ${lead.cliente.localidad} · ${eur(lead.precioTotal + instalacionPrecio)}`,
    html,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: LeadRequest = await request.json();

    if (!body.cliente?.nombre || !body.cliente?.telefono || !body.cliente?.localidad) {
      return NextResponse.json(
        { ok: false, error: 'Faltan datos del cliente' },
        { status: 400 }
      );
    }

    const leadId = `LEAD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    const lead = {
      id: leadId,
      timestamp,
      fuente: 'web' as const,
      ...body,
    };

    console.log('Nuevo lead web:', JSON.stringify(lead, null, 2));

    if (body.incluirInstalacion && body.productoId) {
      const instal = await calcularInstalacionProducto(body.productoId, body.motor);
      const precioInstal = instal?.precioTotal ?? 0;

      enviarLeadInstalacion(lead, precioInstal).catch((err) =>
        console.error('Error enviando lead instalación:', err)
      );

      const totalConIva = (body.precioTotal + precioInstal) * 1.21;
      const msg =
        `🔧 *Nuevo lead con instalación*\n\n` +
        `*${body.cliente.nombre}* · ${body.cliente.localidad}\n` +
        `📞 ${body.cliente.telefono}\n\n` +
        `🪟 ${body.productoId} · ${body.linea}×${body.salida} cm\n` +
        `💰 Toldo: ${eur(body.precioTotal)} · Instalación: ${eur(precioInstal)}\n` +
        `🧾 Total c/IVA: *${eur(+totalConIva.toFixed(2))}*\n\n` +
        `_${lead.id}_`;
      pingTelegramOwner(msg).catch((err) => console.error('Error ping Telegram:', err));
    }

    return NextResponse.json({ ok: true, leadId, timestamp });
  } catch (error) {
    console.error('Error en POST /api/lead:', error);
    return NextResponse.json(
      { ok: false, error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
