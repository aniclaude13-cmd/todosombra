import { NextRequest, NextResponse } from 'next/server';

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
      fuente: 'web',
      ...body,
    };

    console.log('Nuevo lead web:', JSON.stringify(lead, null, 2));

    return NextResponse.json({ ok: true, leadId, timestamp });
  } catch (error) {
    console.error('Error en POST /api/lead:', error);
    return NextResponse.json(
      { ok: false, error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
