import nodemailer from 'nodemailer';

// Configuración de Gmail via OAuth
// Nota: requiere que las credenciales de gog estén disponibles
// Para desarrollo local: usar variables de entorno

interface QuoteEmailData {
  quoteId: string;
  producto: string;
  linea: number;
  salida: number;
  precioMaquina: number;
  detalles: { desc: string; precio: number }[];
  precioTotal: number;
  clienteNombre?: string;
}

export async function enviarQuoteAlOwner(data: QuoteEmailData): Promise<boolean> {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'aniclaude13@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD || '',
      },
    });

    const detallesHTML = data.detalles
      .map((d) => `<tr><td>${d.desc}</td><td align="right">€${d.precio.toFixed(2)}</td></tr>`)
      .join('');

    const html = `
      <h2>Nuevo Presupuesto: ${data.quoteId}</h2>
      <p><strong>Producto:</strong> ${data.producto}</p>
      <p><strong>Dimensiones:</strong> ${data.linea}cm × ${data.salida}cm</p>
      <p><strong>Cliente:</strong> ${data.clienteNombre || 'Sin especificar'}</p>

      <table style="border-collapse: collapse; margin: 20px 0;">
        <tr style="border-bottom: 1px solid #ccc;">
          <td style="padding: 8px;"><strong>Concepto</strong></td>
          <td align="right" style="padding: 8px;"><strong>Precio</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px;">Máquina base</td>
          <td align="right" style="padding: 8px;">€${data.precioMaquina.toFixed(2)}</td>
        </tr>
        ${detallesHTML}
        <tr style="border-top: 2px solid #000;">
          <td style="padding: 8px;"><strong>TOTAL</strong></td>
          <td align="right" style="padding: 8px;"><strong>€${data.precioTotal.toFixed(2)}</strong></td>
        </tr>
      </table>

      <p style="color: #666; font-size: 12px;">
        Presupuesto generado automáticamente por TodoSombra Bot.
        Timestamp: ${new Date().toISOString()}
      </p>
    `;

    const mailOptions = {
      from: process.env.GMAIL_USER || 'aniclaude13@gmail.com',
      to: 'ruben.garcia@tecnitoldo.es',
      subject: `[TodoSombra] Presupuesto ${data.quoteId} - ${data.producto} ${data.linea}×${data.salida}cm`,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email enviado: ${data.quoteId} → ruben.garcia@tecnitoldo.es`);
    return true;
  } catch (error) {
    console.error('Error enviando email al owner:', error);
    return false;
  }
}

export async function enviarQuoteAlCliente(
  clienteEmail: string,
  data: QuoteEmailData
): Promise<boolean> {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'aniclaude13@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD || '',
      },
    });

    const detallesHTML = data.detalles
      .map((d) => `<tr><td>${d.desc}</td><td align="right">€${d.precio.toFixed(2)}</td></tr>`)
      .join('');

    const html = `
      <p>¡Hola ${data.clienteNombre || 'cliente'}!</p>

      <p>Aquí está tu presupuesto para <strong>${data.producto}</strong>:</p>

      <p><strong>Dimensiones:</strong> ${data.linea}cm de ancho × ${data.salida}cm de salida</p>

      <table style="border-collapse: collapse; margin: 20px 0; width: 100%; max-width: 500px;">
        <tr style="border-bottom: 1px solid #ccc;">
          <td style="padding: 8px;"><strong>Concepto</strong></td>
          <td align="right" style="padding: 8px;"><strong>Precio</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px;">Máquina base</td>
          <td align="right" style="padding: 8px;">€${data.precioMaquina.toFixed(2)}</td>
        </tr>
        ${detallesHTML}
        <tr style="border-top: 2px solid #333; font-weight: bold;">
          <td style="padding: 8px; font-size: 16px;">TOTAL</td>
          <td align="right" style="padding: 8px; font-size: 16px;">€${data.precioTotal.toFixed(2)}</td>
        </tr>
      </table>

      <p style="color: #666; font-size: 12px;">
        ⚠️ Presupuesto orientativo sin instalación. Consulta las condiciones completas en
        <a href="https://todosombra.es">todosombra.es</a>
      </p>
    `;

    const mailOptions = {
      from: 'Presupuestos TodoSombra <presupuestos@todosombra.es>',
      to: clienteEmail,
      subject: `Tu presupuesto: ${data.producto} - €${data.precioTotal.toFixed(2)}`,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email enviado: ${data.quoteId} → ${clienteEmail}`);
    return true;
  } catch (error) {
    console.error('Error enviando email al cliente:', error);
    return false;
  }
}
