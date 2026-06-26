import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { pingTelegramOwner } from '@/lib/telegram-service';

export interface LeadProRequest {
  nombre: string;
  empresa: string;
  nif: string;
  email: string;
  telefono: string;
  contexto?: {
    productoId: string | null;
    linea: number | null;
    salida: number | null;
    precioPVP: number | null;
  };
}

const eur = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n);

async function enviarLeadPro(lead: LeadProRequest & { id: string; timestamp: string }) {
  const dest = process.env.LEAD_PRO_TO || 'aniclaude13@gmail.com';
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER || 'aniclaude13@gmail.com',
      pass: process.env.GMAIL_APP_PASSWORD || '',
    },
  });

  const ctx = lead.contexto;
  const ctxBlock = ctx?.productoId
    ? `<p><strong>Producto que estaba cotizando:</strong> ${ctx.productoId} · ${ctx.linea}×${ctx.salida} cm · PVP ${ctx.precioPVP ? eur(ctx.precioPVP) : '—'}</p>`
    : '';

  const html = `
    <h2>Nuevo registro PROFESIONAL: ${lead.id}</h2>
    <p><strong>${lead.empresa}</strong></p>
    <p>NIF: ${lead.nif}<br>
       Contacto: ${lead.nombre}<br>
       Email: ${lead.email}<br>
       Teléfono: ${lead.telefono}</p>
    ${ctxBlock}
    <p style="font-size: 12px; color: #666;">
      Hay que contactar para validar y activar precios pro.<br>
      Timestamp: ${lead.timestamp}
    </p>
  `;

  await transporter.sendMail({
    from: process.env.GMAIL_USER || 'aniclaude13@gmail.com',
    to: dest,
    subject: `[TodoSombra · PRO] ${lead.empresa} (${lead.nif})`,
    html,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: LeadProRequest = await request.json();

    if (!body.empresa || !body.nif || !body.telefono || !body.email) {
      return NextResponse.json(
        { ok: false, error: 'Faltan datos: empresa, NIF, email y teléfono son obligatorios' },
        { status: 400 }
      );
    }

    const leadId = `PRO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    const lead = { id: leadId, timestamp, ...body };
    console.log('Nuevo lead PRO:', JSON.stringify(lead, null, 2));

    enviarLeadPro(lead).catch((err) => console.error('Error enviando lead pro:', err));

    const ctx = body.contexto;
    const ctxLine = ctx?.productoId
      ? `\n🪟 Cotizaba: ${ctx.productoId} · ${ctx.linea}×${ctx.salida} cm`
      : '';
    const msg =
      `🏗️ *Nuevo profesional registrado*\n\n` +
      `*${body.empresa}*\n` +
      `NIF: ${body.nif}\n` +
      `📞 ${body.telefono} · ✉️ ${body.email}\n` +
      `👤 ${body.nombre}${ctxLine}\n\n` +
      `_${leadId}_`;
    pingTelegramOwner(msg).catch((err) => console.error('Error ping Telegram pro:', err));

    return NextResponse.json({ ok: true, leadId, timestamp });
  } catch (error) {
    console.error('Error en POST /api/lead-pro:', error);
    return NextResponse.json(
      { ok: false, error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
