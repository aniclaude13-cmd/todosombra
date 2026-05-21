import { NextRequest, NextResponse } from 'next/server';
import { calcularQuote, ConfiguracionQuote, obtenerProductos } from '@/lib/tarifa-universal';
import { enviarQuoteAlOwner, enviarQuoteAlCliente } from '@/lib/email-service';
import { notificarQuoteGenerada, enviarMensajeWhatsApp } from '@/lib/webhook-service';

export interface QuoteRequest {
  productoId: string;
  linea: number;
  salida: number;
  motor?: string;
  sobreprecios?: { ref: string; cantidad: number }[];
  cantidad?: number;
  // Información del cliente para enviar resultado
  clienteNombre?: string;
  clienteEmail?: string;
  clienteWhatsapp?: string;
  // Nota o referencia para rastreo
  referencia?: string;
}

export interface QuoteResponse {
  ok: boolean;
  quote?: {
    id: string;
    timestamp: string;
    producto: string;
    linea: number;
    salida: number;
    precioMaquina: number;
    detalleRecargos: { desc: string; precio: number }[];
    precioTotal: number;
    cliente?: string;
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<QuoteResponse>> {
  try {
    const body: QuoteRequest = await request.json();

    // Validación básica
    if (!body.productoId || body.linea == null || body.salida == null) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Faltan parámetros requeridos: productoId, linea, salida',
        },
        { status: 400 }
      );
    }

    // Calcular quote
    const config: ConfiguracionQuote = {
      productoId: body.productoId,
      linea: body.linea,
      salida: body.salida,
      motor: body.motor,
      sobreprecios: body.sobreprecios,
    };

    const resultado = calcularQuote(config);

    if (!resultado.valido) {
      return NextResponse.json(
        {
          ok: false,
          error: resultado.motivoInvalido || 'No se pudo calcular el presupuesto.',
        },
        { status: 400 }
      );
    }

    // Generar ID único para el presupuesto
    const quoteId = `QUOTE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const response: QuoteResponse = {
      ok: true,
      quote: {
        id: quoteId,
        timestamp: new Date().toISOString(),
        producto: resultado.productoNombre,
        linea: resultado.linea,
        salida: resultado.salida,
        precioMaquina: resultado.precioMaquina,
        detalleRecargos: resultado.recargosDetalle,
        precioTotal: resultado.precioFinal,
        cliente: body.clienteNombre,
      },
    };

    // Enviar email al owner de forma asíncrona (no esperamos respuesta)
    enviarQuoteAlOwner({
      quoteId,
      producto: resultado.productoNombre,
      linea: resultado.linea,
      salida: resultado.salida,
      precioMaquina: resultado.precioMaquina,
      detalles: resultado.recargosDetalle,
      precioTotal: resultado.precioFinal,
      clienteNombre: body.clienteNombre,
    }).catch((err) => console.error('Error enviando email al owner:', err));

    // Enviar email al cliente si proporcionó
    if (body.clienteEmail) {
      enviarQuoteAlCliente(body.clienteEmail, {
        quoteId,
        producto: resultado.productoNombre,
        linea: resultado.linea,
        salida: resultado.salida,
        precioMaquina: resultado.precioMaquina,
        detalles: resultado.recargosDetalle,
        precioTotal: resultado.precioFinal,
        clienteNombre: body.clienteNombre,
      }).catch((err) => console.error('Error enviando email al cliente:', err));
    }

    // Notificar a n8n para procesar WhatsApp y otras notificaciones
    notificarQuoteGenerada({
      quoteId,
      producto: resultado.productoNombre,
      linea: resultado.linea,
      salida: resultado.salida,
      precioTotal: resultado.precioFinal,
      clienteNombre: body.clienteNombre,
      clienteEmail: body.clienteEmail,
      clienteWhatsapp: body.clienteWhatsapp,
      emailAlOwner: true,
    }).catch((err) => console.error('Error notificando a n8n:', err));

    // Si tiene WhatsApp, mandar mensaje directo
    if (body.clienteWhatsapp) {
      enviarMensajeWhatsApp(
        body.clienteWhatsapp,
        quoteId,
        resultado.productoNombre,
        resultado.precioFinal
      ).catch((err) => console.error('Error enviando WhatsApp:', err));
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error en POST /api/quote:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Error al procesar la solicitud',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Endpoint para listar productos disponibles
  const productos = obtenerProductos();
  return NextResponse.json({
    ok: true,
    productos: productos.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      tipo: p.tipo,
      lineaMin: p.lineaMin,
      lineaMax: p.lineaMax,
      salidaMin: p.salidaMin,
      salidaMax: p.salidaMax,
    })),
  });
}
