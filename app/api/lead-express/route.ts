import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { pingTelegramOwner } from '@/lib/telegram-service';

export interface LeadExpressRequest {
  nombre: string;
  telefono: string;
  tipo: 'cofre' | 'pergola' | 'brazo' | 'vertical' | 'otro';
  medidaAprox: 'pequeno' | 'mediano' | 'grande' | 'no_se';
  provincia: string;
  email?: string;
  notas?: string;
}

const TIPO_LABEL: Record<LeadExpressRequest['tipo'], string> = {
  cofre: 'Toldo cofre',
  pergola: 'Pérgola',
  brazo: 'Brazo articulado',
  vertical: 'Vertical / Cortaviento',
  otro: 'Otro / No lo sé',
};

const MEDIDA_LABEL: Record<LeadExpressRequest['medidaAprox'], string> = {
  pequeno: 'Pequeño (hasta 3 m)',
  mediano: 'Mediano (3-4,5 m)',
  grande: 'Grande (más de 4,5 m)',
  no_se: 'No lo sé',
};

async function enviarLeadExpress(lead: LeadExpressRequest & { id: string; timestamp: string }) {
  const dest = process.env.LEAD_EXPRESS_TO || process.env.LEAD_INSTALACION_TO || 'aniclaude13@gmail.com';
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER || 'aniclaude13@gmail.com',
      pass: process.env.GMAIL_APP_PASSWORD || '',
    },
  });

  const html = `
    <h2>Vía rápida: ${lead.id}</h2>
    <p><strong>Cliente:</strong> ${lead.nombre}<br>
       <strong>Teléfono:</strong> ${lead.telefono}<br>
       ${lead.email ? `<strong>Email:</strong> ${lead.email}<br>` : ''}
       <strong>Provincia:</strong> ${lead.provincia}</p>

    <p><strong>Tipo:</strong> ${TIPO_LABEL[lead.tipo]}<br>
       <strong>Medida aprox:</strong> ${MEDIDA_LABEL[lead.medidaAprox]}</p>

    ${lead.notas ? `<p><strong>Notas:</strong><br>${lead.notas.replace(/\n/g, '<br>')}</p>` : ''}

    <p style="font-size: 12px; color: #666;">
      Lead vía rápida. Llamar al cliente en menos de 24h con propuesta.<br>
      Timestamp: ${lead.timestamp}
    </p>
  `;

  await transporter.sendMail({
    from: process.env.GMAIL_USER || 'aniclaude13@gmail.com',
    to: dest,
    subject: `[TodoSombra · VÍA RÁPIDA] ${lead.nombre} · ${lead.provincia} · ${TIPO_LABEL[lead.tipo]}`,
    html,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: LeadExpressRequest = await request.json();

    if (!body.nombre || !body.telefono || !body.tipo || !body.medidaAprox || !body.provincia) {
      return NextResponse.json(
        { ok: false, error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    const leadId = `EXPRESS-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const timestamp = new Date().toISOString();
    const lead = { id: leadId, timestamp, ...body };

    console.log('Nuevo lead vía rápida:', JSON.stringify(lead, null, 2));

    enviarLeadExpress(lead).catch((err) =>
      console.error('Error enviando lead express:', err)
    );

    const msg =
      `⚡ *Vía rápida*\n\n` +
      `*${body.nombre}* · ${body.provincia}\n` +
      `📞 ${body.telefono}\n` +
      `${body.email ? `✉️ ${body.email}\n` : ''}\n` +
      `🪟 ${TIPO_LABEL[body.tipo]} · ${MEDIDA_LABEL[body.medidaAprox]}\n` +
      `${body.notas ? `\n📝 ${body.notas}\n` : ''}` +
      `\n_${leadId}_`;
    pingTelegramOwner(msg).catch((err) => console.error('Error ping Telegram:', err));

    return NextResponse.json({ ok: true, leadId, timestamp });
  } catch (error) {
    console.error('Error en POST /api/lead-express:', error);
    return NextResponse.json(
      { ok: false, error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
