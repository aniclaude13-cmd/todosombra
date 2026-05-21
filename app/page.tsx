import Link from 'next/link';
import AnimateIn from '@/components/AnimateIn';
import StatsBar from '@/components/StatsBar';

const WHATSAPP = 'https://wa.me/34XXXXXXXXX'; // TODO: sustituir por número real

const features = [
  {
    icon: '⚡',
    title: 'Precio al instante',
    desc: 'Sin "te llamamos". El precio exacto aparece mientras configuras, sin formularios ni esperas.',
  },
  {
    icon: '🏭',
    title: 'Fabricante directo',
    desc: 'Producto AWMA, el mismo que instalan los profesionales. Sin intermediarios ni sobrecostes.',
  },
  {
    icon: '📍',
    title: 'Instalador local',
    desc: 'Equipo propio en el Mar Menor y la costa de Murcia. Somos de aquí.',
  },
  {
    icon: '🛡️',
    title: 'Garantía de 10 años',
    desc: 'Materiales de primera, instalación profesional, respaldo real detrás de cada toldo.',
  },
];

const municipios = [
  'Mar Menor', 'Los Alcázares', 'San Pedro del Pinatar', 'San Javier',
  'La Manga', 'Cartagena', 'Mazarrón', 'Águilas',
];

export default function Home() {
  return (
    <main className="bg-[#faf9f6] text-[#1a1917]">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen bg-[#0d0c0b] overflow-hidden flex flex-col">

        {/* Gradient blobs */}
        <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
          <div
            className="hero-blob absolute rounded-full"
            style={{
              width: 700, height: 700,
              background: 'radial-gradient(circle, rgba(212,160,52,0.16) 0%, transparent 70%)',
              top: '-10%', left: '-15%',
            }}
          />
          <div
            className="hero-blob-2 absolute rounded-full"
            style={{
              width: 500, height: 500,
              background: 'radial-gradient(circle, rgba(160,70,20,0.12) 0%, transparent 70%)',
              bottom: '5%', right: '-10%',
            }}
          />
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6">
          <span className="font-bold text-xl tracking-tight text-white select-none">
            <span className="text-[#d4a034]">Todo</span>Sombra
          </span>
          <div className="flex items-center gap-6 lg:gap-8">
            <Link
              href="/configurador/ares"
              className="text-sm text-white/50 hover:text-white transition hidden md:block"
            >
              Configurador
            </Link>
            <a
              href="#contacto"
              className="text-sm text-white/50 hover:text-white transition hidden md:block"
            >
              Contacto
            </a>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm bg-[#d4a034] text-[#0d0c0b] font-semibold px-5 py-2 rounded-full hover:bg-[#e8b442] transition-all hover:scale-105 active:scale-95"
            >
              WhatsApp
            </a>
          </div>
        </nav>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pb-10">
          <div className="hero-badge inline-flex items-center gap-2 text-xs text-[#d4a034]/70 uppercase tracking-widest mb-8 border border-[#d4a034]/20 rounded-full px-5 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4a034] animate-pulse" />
            Mar Menor · Costa de Murcia
          </div>

          <h1 className="hero-title text-4xl sm:text-5xl lg:text-[4.5rem] font-bold text-white leading-[1.08] tracking-tight max-w-4xl">
            Tu espacio exterior,<br />
            <span className="text-[#d4a034]">a la sombra perfecta.</span>
          </h1>

          <p className="hero-sub mt-6 text-base lg:text-lg text-white/45 max-w-xl leading-relaxed">
            Configura tu toldo o pérgola en 3D, ve el precio al instante y recíbelo
            directo de fábrica. Instalación profesional incluida.
          </p>

          <div className="hero-cta mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/configurador/ares"
              className="bg-[#d4a034] text-[#0d0c0b] font-semibold px-9 py-4 rounded-full hover:bg-[#e8b442] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#d4a034]/20"
            >
              Configurar mi toldo →
            </Link>
            <a
              href="#productos"
              className="border border-white/15 text-white/65 font-medium px-9 py-4 rounded-full hover:border-white/35 hover:text-white transition"
            >
              Ver productos
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 flex justify-center pb-8" aria-hidden>
          <div className="scroll-line w-px h-10 bg-gradient-to-b from-transparent to-white/25" />
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <StatsBar />

      {/* ── PRODUCTOS ────────────────────────────────────────── */}
      <section id="productos" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <AnimateIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-[#1a1917]">
                Configura el tuyo
              </h2>
              <p className="mt-3 text-[#7a756f] max-w-lg mx-auto text-base">
                Elige tu producto, ajusta medidas y ve el precio exacto en tiempo real.
              </p>
            </div>
          </AnimateIn>

          <div className="grid md:grid-cols-2 gap-5">
            <AnimateIn delay={0}>
              <Link
                href="/configurador/ares"
                className="group block bg-white rounded-2xl border border-[#e5e1d8] p-8 hover:border-[#d4a034] hover:shadow-2xl hover:shadow-[#d4a034]/8 transition-all duration-300 h-full"
              >
                <div className="text-xs text-[#a09a94] uppercase tracking-wider font-medium">
                  Toldo cofre
                </div>
                <h3 className="text-2xl font-bold text-[#1a1917] mt-2">ARES</h3>
                <p className="text-[#7a756f] mt-3 text-sm leading-relaxed">
                  El cofre más vendido en terrazas. Hasta 6 m de ancho, manual o motorizado
                  con Somfy. Tejidos Sauleda incluidos.
                </p>
                <div className="mt-8 flex items-center justify-between">
                  <span className="text-xs text-[#b0aaa4]">Precio a medida</span>
                  <span className="text-[#d4a034] font-semibold group-hover:translate-x-1.5 transition-transform inline-block">
                    Configurar →
                  </span>
                </div>
              </Link>
            </AnimateIn>

            <AnimateIn delay={140}>
              <Link
                href="/configurador/palilleria"
                className="group block bg-white rounded-2xl border border-[#e5e1d8] p-8 hover:border-[#d4a034] hover:shadow-2xl hover:shadow-[#d4a034]/8 transition-all duration-300 h-full"
              >
                <div className="text-xs text-[#a09a94] uppercase tracking-wider font-medium">
                  Pérgola
                </div>
                <h3 className="text-2xl font-bold text-[#1a1917] mt-2">Palillería 80×40</h3>
                <p className="text-[#7a756f] mt-3 text-sm leading-relaxed">
                  La pérgola de jardín. Cuatro configuraciones para fijación en pared,
                  portería o autoportante.
                </p>
                <div className="mt-8 flex items-center justify-between">
                  <span className="text-xs text-[#b0aaa4]">Precio a medida</span>
                  <span className="text-[#d4a034] font-semibold group-hover:translate-x-1.5 transition-transform inline-block">
                    Configurar →
                  </span>
                </div>
              </Link>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* ── POR QUÉ TODOSOMBRA ──────────────────────────────── */}
      <section className="bg-[#f0ede6] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <AnimateIn>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1a1917] text-center mb-16">
              Por qué elegir TodoSombra
            </h2>
          </AnimateIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <AnimateIn key={f.title} delay={i * 90}>
                <div className="bg-white rounded-2xl p-6 border border-[#e5e1d8] h-full">
                  <div className="text-2xl mb-3">{f.icon}</div>
                  <div className="font-semibold text-[#1a1917] mb-2">{f.title}</div>
                  <p className="text-sm text-[#7a756f] leading-relaxed">{f.desc}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── ZONA ─────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <AnimateIn>
            <div className="bg-[#1a1917] rounded-3xl p-12 lg:p-16 text-center">
              <div className="text-xs text-[#d4a034]/70 uppercase tracking-widest mb-4">
                Zona de instalación
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Cubrimos toda la costa
              </h2>
              <p className="text-white/40 mb-10 max-w-md mx-auto text-sm leading-relaxed">
                Instalación profesional con equipo propio en el Mar Menor y la costa sur de Murcia.
              </p>
              <div className="flex flex-wrap justify-center gap-2.5">
                {municipios.map((loc) => (
                  <span
                    key={loc}
                    className="bg-white/8 text-white/60 text-sm px-4 py-1.5 rounded-full border border-white/10 hover:bg-white/12 hover:text-white/80 transition"
                  >
                    {loc}
                  </span>
                ))}
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────── */}
      <section id="contacto" className="bg-[#d4a034] py-24 px-6 text-center">
        <AnimateIn>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0d0c0b] mb-4">
            ¿Listo para tu presupuesto?
          </h2>
          <p className="text-[#0d0c0b]/55 mb-10 max-w-md mx-auto">
            Configúralo en 3D y recibe el precio al momento. Sin compromisos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/configurador/ares"
              className="bg-[#0d0c0b] text-white font-semibold px-9 py-4 rounded-full hover:bg-[#1a1917] transition-all hover:scale-105 active:scale-95"
            >
              Empezar ahora →
            </Link>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-[#0d0c0b]/20 text-[#0d0c0b] font-medium px-9 py-4 rounded-full hover:border-[#0d0c0b]/40 transition"
            >
              Hablar por WhatsApp
            </a>
          </div>
        </AnimateIn>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="bg-[#0d0c0b] text-white/35 text-sm py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="font-bold text-base select-none">
            <span className="text-[#d4a034]">Todo</span>
            <span className="text-white/55">Sombra</span>
          </span>
          <span>© 2026 TodoSombra · Murcia · España</span>
          <div className="flex gap-6">
            <Link href="/configurador/ares" className="hover:text-white/70 transition">
              Configurador
            </Link>
            <a href="#contacto" className="hover:text-white/70 transition">
              Contacto
            </a>
          </div>
        </div>
      </footer>

    </main>
  );
}
