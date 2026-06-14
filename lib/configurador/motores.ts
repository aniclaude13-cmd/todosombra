export const MOTORES_SOMFY = {
  RTS: [
    { id: 'rts_30Nm', nombre: 'Motor Somfy RTS 30 Nm', precio: 200 },
    { id: 'rts_40Nm', nombre: 'Motor Somfy RTS 40 Nm (recomendado)', precio: 240 },
    { id: 'rts_50Nm', nombre: 'Motor Somfy RTS 50 Nm', precio: 280 },
  ],
  iO: [
    { id: 'io_30Nm', nombre: 'Motor Somfy iO 30 Nm', precio: 320 },
    { id: 'io_40Nm', nombre: 'Motor Somfy iO 40 Nm', precio: 360 },
    { id: 'io_50Nm', nombre: 'Motor Somfy iO 50 Nm', precio: 400 },
  ],
};

export const MANDOS_SOMFY = {
  Situo_1: { nombre: 'Mando Situo 1 io', precio: 68.50 },
  Situo_3: { nombre: 'Mando Situo 3 io', precio: 128.00 },
  Tahoma: { nombre: 'Tahoma box', precio: 149.00 },
};

export function getMotoresPorMarca(marca: 'somfy'): Array<{ id: string; nombre: string }> {
  if (marca === 'somfy') {
    return [
      ...MOTORES_SOMFY.RTS.map((m) => ({ id: m.id, nombre: m.nombre })),
      ...MOTORES_SOMFY.iO.map((m) => ({ id: m.id, nombre: m.nombre })),
    ];
  }
  return [];
}

export function getManualOption() {
  return {
    id: 'manual',
    nombre: 'Manual con máquina (sin motor)',
    precio: 0,
  };
}
