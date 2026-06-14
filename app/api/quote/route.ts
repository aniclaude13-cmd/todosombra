import { NextRequest, NextResponse } from 'next/server';
import { calcular, type Catalogo } from '@/awma-core/ts/engine';
import BOX6100_ARES_JSON from '@/awma-core/catalog/BOX6100_ARES.json';
import { enviarQuoteAlOwner, enviarQuoteAlCliente } from '@/lib/email-service';
import { notificarQuoteGenerada, enviarMensajeWhatsApp } from '@/lib/webhook-service';

// Registro de catálogos disponibles. Phase 1 sólo expone ARES (paridad bot↔web).
// Phase 2 ampliará a BOX/AV/PR cargando todos los catálogos auto-generados.
const CATALOGOS: Record<string, Catalogo> = {
  BOX6100_ARES: BOX6100_ARES_JSON as unknown as Catalogo,
};

export interface QuoteRequest {
  productoId: string;
  linea: number;
  salida: number;
  motor?: string;
  sobreprecios?: { ref: string; cantidad: number }[];
  cantidad?: number;
  clienteNombre?: string;
  clienteEmail?: string;
  clienteWhatsapp?: string;
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

    if (!body.productoId || body.linea == null || body.salida == null) {
      return NextResponse.json(
        { ok: false, error: 'Faltan parámetros requeridos: productoId, linea, salida' },
        { status: 400 }
      );
    }

    const catalogo = CATALOGOS[body.productoId];
    if (!catalogo) {
      return NextResponse.json(
        { ok: false, error: `Producto ${body.productoId} no encontrado en tarifa.` },
        { status: 400 }
      );
    }

    const resultado = calcular(catalogo, {
      productoId: body.productoId,
      linea: body.linea,
      salida: body.salida,
      motorId: body.motor && body.motor !== 'ninguno' ? body.motor : undefined,
      sobreprecios: body.sobreprecios,
      cantidad: body.cantidad,
    });

    if (!resultado.valido) {
      return NextResponse.json(
        { ok: false, error: resultado.motivoInvalido || 'No se pudo calcular el presupuesto.' },
        { status: 400 }
      );
    }

    // Separar la línea "máquina" (primera del desglose) del resto (= recargos).
    const [maquina, ...recargos] = resultado.desglose;
    const precioMaquina = maquina?.importe ?? resultado.pvpBase;
    const detalleRecargos = recargos.map((d) => ({ desc: d.concepto, precio: d.importe }));

    const quoteId = `QUOTE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const response: QuoteResponse = {
      ok: true,
      quote: {
        id: quoteId,
        timestamp: new Date().toISOString(),
        producto: resultado.productoNombre,
        linea: resultado.linea,
        salida: resultado.salida,
        precioMaquina,
        detalleRecargos,
        precioTotal: resultado.pvpTotal,
        cliente: body.clienteNombre,
      },
    };

    enviarQuoteAlOwner({
      quoteId,
      producto: resultado.productoNombre,
      linea: resultado.linea,
      salida: resultado.salida,
      precioMaquina,
      detalles: detalleRecargos,
      precioTotal: resultado.pvpTotal,
      clienteNombre: body.clienteNombre,
    }).catch((err) => console.error('Error enviando email al owner:', err));

    if (body.clienteEmail) {
      enviarQuoteAlCliente(body.clienteEmail, {
        quoteId,
        producto: resultado.productoNombre,
        linea: resultado.linea,
        salida: resultado.salida,
        precioMaquina,
        detalles: detalleRecargos,
        precioTotal: resultado.pvpTotal,
        clienteNombre: body.clienteNombre,
      }).catch((err) => console.error('Error enviando email al cliente:', err));
    }

    notificarQuoteGenerada({
      quoteId,
      producto: resultado.productoNombre,
      linea: resultado.linea,
      salida: resultado.salida,
      precioTotal: resultado.pvpTotal,
      clienteNombre: body.clienteNombre,
      clienteEmail: body.clienteEmail,
      clienteWhatsapp: body.clienteWhatsapp,
      emailAlOwner: true,
    }).catch((err) => console.error('Error notificando a n8n:', err));

    if (body.clienteWhatsapp) {
      enviarMensajeWhatsApp(
        body.clienteWhatsapp,
        quoteId,
        resultado.productoNombre,
        resultado.pvpTotal
      ).catch((err) => console.error('Error enviando WhatsApp:', err));
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error en POST /api/quote:', error);
    return NextResponse.json({ ok: false, error: 'Error al procesar la solicitud' }, { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  const productos = Object.values(CATALOGOS).map((c) => ({
    id: c.id,
    nombre: c.nombre,
    tipo: c.tipo,
    lineaMin: c.dimensiones.linea.min,
    lineaMax: c.dimensiones.linea.max,
    salidaMin: c.dimensiones.salida.min,
    salidaMax: c.dimensiones.salida.max,
  }));
  return NextResponse.json({ ok: true, productos });
}
