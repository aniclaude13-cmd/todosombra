import AnimateIn from './AnimateIn';

interface Paso {
  num: string;
  title: string;
  desc: string;
  tag: string;
  icon: React.ReactNode;
}

const PASOS: Paso[] = [
  {
    num: '01',
    title: 'Configura',
    desc: 'Elige modelo, medidas, color y opciones. El precio se calcula al instante.',
    tag: '3 minutos',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7" strokeWidth="1.6" stroke="currentColor">
        <path d="M24 6v6M24 36v6M6 24h6M36 24h6M11.3 11.3l4.3 4.3M32.4 32.4l4.3 4.3M11.3 36.7l4.3-4.3M32.4 15.6l4.3-4.3" strokeLinecap="round" />
        <circle cx="24" cy="24" r="7" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Presupuesto',
    desc: 'Ves el desglose exacto: máquina, motor, tejido, complementos e IVA.',
    tag: 'Sin sorpresas',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7" strokeWidth="1.6" stroke="currentColor">
        <rect x="8" y="10" width="32" height="28" rx="3" />
        <path d="M14 18h20M14 24h14M14 30h10" strokeLinecap="round" />
        <circle cx="34" cy="30" r="4" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Reserva',
    desc: 'Confirmas tus datos. Te llamamos para ultimar detalles y visita técnica.',
    tag: 'Visita gratis',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7" strokeWidth="1.6" stroke="currentColor">
        <path d="M14 26l6 6 14-14" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="24" cy="24" r="18" />
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Instalamos',
    desc: 'Fabricamos a medida. Instalamos con equipo propio. 10 años de garantía.',
    tag: '4 semanas',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7" strokeWidth="1.6" stroke="currentColor">
        <path d="M8 38l8-8M14 32l10 10M30 14l4-4 8 8-4 4M30 14l-14 14 8 8 14-14M30 14l8 8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-28 px-6 overflow-hidden bg-gradient-to-b from-[#faf9f6] to-[#f5f2ed]">
      {/* Background blob */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-40 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,160,52,0.06) 0%, transparent 60%)' }}
        aria-hidden
      />

      <div className="relative max-w-6xl mx-auto">
        <AnimateIn>
          <div className="text-center mb-20">
            <div className="text-[11px] text-[#d4a034] uppercase tracking-widest font-semibold mb-3">
              Proceso
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-[#1a1917] tracking-tight">
              De la idea al toldo,
              <br />
              <span className="text-[#d4a034]">en 4 semanas.</span>
            </h2>
            <p className="mt-5 text-[#7a756f] max-w-md mx-auto text-base leading-relaxed">
              Sin formularios eternos, sin esperar presupuesto, sin sorpresas.
            </p>
          </div>
        </AnimateIn>

        {/* Connector line desktop */}
        <div className="relative">
          <div
            className="hidden lg:block absolute top-[88px] left-[12.5%] right-[12.5%] h-px"
            style={{
              backgroundImage: 'linear-gradient(to right, transparent, #d4a034 20%, #d4a034 80%, transparent)',
              opacity: 0.25,
            }}
            aria-hidden
          />

          <div className="grid lg:grid-cols-4 gap-6 lg:gap-4">
            {PASOS.map((paso, i) => (
              <AnimateIn key={paso.num} delay={i * 100}>
                <div className="group relative h-full">
                  {/* Number watermark */}
                  <div
                    className="absolute -top-6 -right-2 text-[110px] font-black leading-none select-none pointer-events-none transition-opacity duration-500"
                    style={{ color: '#d4a034', opacity: 0.06 }}
                    aria-hidden
                  >
                    {paso.num}
                  </div>

                  <div className="relative bg-white rounded-2xl p-7 border border-[#e5e1d8] h-full flex flex-col transition-all duration-300 group-hover:border-[#d4a034]/50 group-hover:shadow-xl group-hover:shadow-[#d4a034]/8 group-hover:-translate-y-1">
                    {/* Icon circle + dot on line */}
                    <div className="relative mb-6">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#d4a034] to-[#b8862a] text-white flex items-center justify-center shadow-lg shadow-[#d4a034]/25">
                        {paso.icon}
                      </div>
                      <div
                        className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-[#d4a034]/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        aria-hidden
                      />
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-[#d4a034] tracking-widest">
                        PASO {paso.num}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-[#d4a034]/30" aria-hidden />
                      <span className="text-[10px] text-[#a09a94] uppercase tracking-wider">
                        {paso.tag}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#1a1917] mb-2.5">
                      {paso.title}
                    </h3>
                    <p className="text-sm text-[#7a756f] leading-relaxed">
                      {paso.desc}
                    </p>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>

        {/* Trust footer */}
        <AnimateIn delay={500}>
          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-[#7a756f]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4a034]" aria-hidden />
              Visita técnica gratuita
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4a034]" aria-hidden />
              Fabricación a medida
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4a034]" aria-hidden />
              Equipo propio
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4a034]" aria-hidden />
              Garantía 10 años
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
