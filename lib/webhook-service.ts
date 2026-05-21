// Servicio para integración con n8n webhooks
// Permite enviar eventos a n8n para procesamiento de WhatsApp, email, etc.

interface WebhookPayload {
  type: 'quote_generated' | 'quote_sent' | 'customer_notification';
  data: object;
  timestamp: string;
}

// URL del webhook en n8n (ajustar según la configuración local)
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/todosombra-quotes';

export async function enviarAlWebhookN8n(payload: WebhookPayload): Promise<boolean> {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Error en webhook n8n: ${response.status} ${response.statusText}`);
      return false;
    }

    console.log(`Evento enviado a n8n: ${payload.type}`);
    return true;
  } catch (error) {
    console.error('Error conectando con n8n:', error);
    return false;
  }
}

export interface QuoteNotificationPayload {
  quoteId: string;
  producto: string;
  linea: number;
  salida: number;
  precioTotal: number;
  clienteNombre?: string;
  clienteEmail?: string;
  clienteWhatsapp?: string;
  emailAlOwner: boolean;
}

export async function notificarQuoteGenerada(payload: QuoteNotificationPayload): Promise<void> {
  const webhookPayload: WebhookPayload = {
    type: 'quote_generated',
    data: payload,
    timestamp: new Date().toISOString(),
  };

  await enviarAlWebhookN8n(webhookPayload);
}

export async function enviarMensajeWhatsApp(
  numeroWhatsApp: string,
  quoteId: string,
  producto: string,
  precioTotal: number,
  linkDescarga?: string
): Promise<boolean> {
  try {
    const mensaje = `
¡Hola! 👋

Tu presupuesto para *${producto}* está listo.

*Precio total:* €${precioTotal.toFixed(2)}

ID: ${quoteId}

Para más detalles, contacta con nosotros o accede a tu presupuesto en:
${linkDescarga || 'https://todosombra.es'}

¡TodoSombra! ☀️
    `.trim();

    const webhookPayload: WebhookPayload = {
      type: 'customer_notification',
      data: {
        canal: 'whatsapp',
        numero: numeroWhatsApp,
        mensaje,
        quoteId,
      },
      timestamp: new Date().toISOString(),
    };

    return await enviarAlWebhookN8n(webhookPayload);
  } catch (error) {
    console.error('Error preparando mensaje WhatsApp:', error);
    return false;
  }
}
