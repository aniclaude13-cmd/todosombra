interface Beneficio {
  icono: string;
  titulo: string;
  detalle: string;
}

const BENEFICIOS_PARTICULAR: Beneficio[] = [
  {
    icono: '⚡',
    titulo: 'Precio claro en 1 minuto',
    detalle: 'Sin formularios largos, sin esperar llamadas. Lo ves al momento.',
  },
  {
    icono: '🏭',
    titulo: 'Directo de fábrica AWMA',
    detalle: 'Sin intermediarios. Lo que pagas es producto, no comisiones.',
  },
  {
    icono: '🛡️',
    titulo: '3 años de garantía',
    detalle: 'Estructura, motor y tejido cubiertos por la fábrica.',
  },
  {
    icono: '📞',
    titulo: 'Asesoría con técnico real',
    detalle: 'Por WhatsApp o teléfono — no chatbots ni call centers.',
  },
  {
    icono: '📐',
    titulo: 'Visita técnica gratuita',
    detalle: 'Confirmamos medidas y viabilidad sin compromiso antes de fabricar.',
  },
];

const BENEFICIOS_PROFESIONAL: Beneficio[] = [
  {
    icono: '💼',
    titulo: 'Precios pro con descuento',
    detalle: 'Regístrate con tu NIF y desbloquea la tarifa profesional.',
  },
  {
    icono: '📊',
    titulo: 'Cotización ágil en obra',
    detalle: 'Saca presupuesto instantáneo para tus clientes desde el móvil.',
  },
  {
    icono: '🗂️',
    titulo: 'Catálogo completo',
    detalle: '+50 modelos AWMA disponibles desde el mismo configurador.',
  },
  {
    icono: '🤝',
    titulo: 'Soporte técnico directo',
    detalle: 'Acceso a un técnico de fábrica, no a centralita genérica.',
  },
  {
    icono: '🚚',
    titulo: 'Logística a medida',
    detalle: 'Condiciones de pago y entrega según volumen recurrente.',
  },
];

interface PanelProps {
  titulo: string;
  subtitulo: string;
  acento: string;
  beneficios: Beneficio[];
}

function Panel({ titulo, subtitulo, acento, beneficios }: PanelProps) {
  return (
    <aside className="w-72 shrink-0 hidden xl:block">
      <div className="sticky top-24 space-y-4">
        <div>
          <div
            className="text-[10px] uppercase tracking-widest font-semibold mb-1"
            style={{ color: acento }}
          >
            {subtitulo}
          </div>
          <h3 className="text-lg font-bold text-[#1a1917]">{titulo}</h3>
        </div>
        <ul className="space-y-3">
          {beneficios.map((b) => (
            <li
              key={b.titulo}
              className="bg-white rounded-xl border border-[#e5e1d8] p-3 hover:border-[#d4a034]/60 transition"
            >
              <div className="flex items-start gap-2.5">
                <span className="text-xl leading-none mt-0.5">{b.icono}</span>
                <div>
                  <div className="text-sm font-semibold text-[#1a1917]">{b.titulo}</div>
                  <div className="text-xs text-[#7a756f] mt-0.5 leading-relaxed">{b.detalle}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export function PanelParticular() {
  return (
    <Panel
      titulo="Pensado para ti"
      subtitulo="Si eres particular"
      acento="#d4a034"
      beneficios={BENEFICIOS_PARTICULAR}
    />
  );
}

export function PanelProfesional() {
  return (
    <Panel
      titulo="Si vives de esto"
      subtitulo="Si eres profesional"
      acento="#1a1917"
      beneficios={BENEFICIOS_PROFESIONAL}
    />
  );
}
