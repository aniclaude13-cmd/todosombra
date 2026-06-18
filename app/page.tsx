import Link from 'next/link';
import Image from 'next/image';
import AnimateIn from '@/components/AnimateIn';
import StatsBar from '@/components/StatsBar';
import Gallery from '@/components/Gallery';
import StickyCTA from '@/components/StickyCTA';

const WHATSAPP = 'https://wa.me/34644592007?text=Hola%2C%20me%20interesa%20un%20toldo%20o%20p%C3%A9rgola';

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
      <section className="relative min-h-screen overflow-hidden flex flex-col">

        {/* Background image */}
        <Image
          src="/hero-toldo.png"
          alt="Toldo en terraza"
          fill
          className="object-cover object-right"
          style={{ zIndex: 0 }}
          priority
          quality={90}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0c0b] via-[#0d0c0b]/80 to-transparent pointer-events-none" style={{ zIndex: 1 }} />

        {/* Gradient blobs */}
        <div className="absolute inset-0 pointer-events-none select-none" style={{ zIndex: 2 }} aria-hidden>
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
        <nav className="relative flex items-center justify-between px-6 lg:px-12 py-6" style={{ zIndex: 10 }}>
          <span className="font-bold text-xl tracking-tight text-white select-none">
            <span className="text-[#d4a034]">Todo</span>Sombra
          </span>
          <div className="flex items-center gap-6 lg:gap-8">
            <Link
              href="/configurador"
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
        <div className="relative flex-1 flex flex-col items-center justify-center text-center px-6 pb-10" style={{ zIndex: 10 }}>
          <div className="hero-badge inline-flex items-center gap-2 text-xs text-[#d4a034]/70 uppercase tracking-widest mb-8 border border-[#d4a034]/20 rounded-full px-5 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4a034] animate-pulse" />
            Mar Menor · Costa de Murcia
          </div>

          <h1 className="hero-title text-4xl sm:text-5xl lg:text-[4.5rem] font-bold text-white leading-[1.08] tracking-tight max-w-4xl">
            Tu espacio exterior,<br />
            <span className="text-[#d4a034]">a la sombra perfecta.</span>
          </h1>

          <p className="hero-sub mt-6 text-base lg:text-lg text-white/45 max-w-xl leading-relaxed">
            Configura tu toldo o pérgola, ve el precio al instante y recíbelo
            directo de fábrica. Instalación profesional incluida.
          </p>

          <div className="hero-cta mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/configurador"
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
        <div className="relative flex justify-center pb-8" style={{ zIndex: 10 }} aria-hidden>
          <div className="scroll-line w-px h-10 bg-gradient-to-b from-transparent to-white/25" />
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <StatsBar />

      {/* ── CÓMO FUNCIONA ────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <AnimateIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-[#1a1917]">
                ¿Cómo funciona?
              </h2>
              <p className="mt-3 text-[#7a756f] max-w-lg mx-auto text-base">
                De la idea al toldo instalado en 4 semanas. Sin sorpresas.
              </p>
            </div>
          </AnimateIn>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { num: '1', icon: '⚙️', title: 'Configura', desc: 'Elige modelo, medidas, color y opciones. El precio se calcula al instante.' },
              { num: '2', icon: '💰', title: 'Presupuesto', desc: 'Ves el desglose exacto: máquina, motor, tejido, complementos e IVA.' },
              { num: '3', icon: '✓', title: 'Reserva', desc: 'Confirmas tus datos. Te llamamos para ultimar detalles y visita técnica.' },
              { num: '4', icon: '🔨', title: 'Instalamos', desc: 'Fabricamos a medida. Instalamos con equipo propio. 10 años de garantía.' },
            ].map((paso, i) => (
              <AnimateIn key={paso.num} delay={i * 90}>
                <div className="relative">
                  <div className="bg-white rounded-2xl p-6 border border-[#e5e1d8] h-full flex flex-col">
                    <div className="absolute -top-4 -left-4 w-10 h-10 bg-[#d4a034] rounded-full flex items-center justify-center font-bold text-white text-sm">
                      {paso.num}
                    </div>
                    <div className="text-3xl mb-3 mt-2">{paso.icon}</div>
                    <div className="font-semibold text-[#1a1917] mb-2">{paso.title}</div>
                    <p className="text-sm text-[#7a756f] leading-relaxed flex-1">{paso.desc}</p>
                  </div>
                  {i < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-[#e5e1d8]" />
                  )}
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

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

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { cat: 'Toldo cofre', nombre: 'ARES', desc: 'El más vendido. Hasta 6 m, manual o motorizado. Sauleda incluido.', img: '/ares/ares-catalog.png' },
              { cat: 'Toldo cofre', nombre: 'BOX', desc: 'Elegancia y robustez. Sistema modular adaptable a cualquier fachada.', img: '/ares/box-catalog.png' },
              { cat: 'Pérgola', nombre: 'Palillería 80×40', desc: 'Pérgola de jardín. Fijación pared, portería o autoportante.', img: '/pl7000-catalog.png' },
              { cat: 'Pérgola motorizada', nombre: 'TENXO', desc: 'Motorizada, moderna. Lamas orientables para control solar.', img: '/tenxo-catalog.png' },
              { cat: 'Brazo articulado', nombre: 'ART', desc: 'Brazos retráctiles articulados. Máxima flexibilidad de uso.', img: '/art-catalog.png' },
            ].map((prod, i) => (
              <AnimateIn key={prod.nombre} delay={i * 70}>
                <Link
                  href="/configurador"
                  className="group block bg-white rounded-2xl border border-[#e5e1d8] overflow-hidden hover:border-[#d4a034] hover:shadow-lg hover:shadow-[#d4a034]/8 transition-all duration-300 h-full flex flex-col"
                >
                  <div className="relative h-40 bg-[#f0ede6] overflow-hidden">
                    <Image src={prod.img} alt={prod.nombre} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="text-[10px] text-[#a09a94] uppercase tracking-wider font-medium">
                      {prod.cat}
                    </div>
                    <h3 className="text-lg font-bold text-[#1a1917] mt-2 flex-1">{prod.nombre}</h3>
                    <p className="text-[#7a756f] mt-2 text-xs leading-relaxed">
                      {prod.desc}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[9px] text-[#b0aaa4]">A medida</span>
                      <span className="text-[#d4a034] font-semibold group-hover:translate-x-1 transition-transform inline-block text-sm">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              </AnimateIn>
            ))}
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
            Configúralo a tu medida y recibe el precio al momento. Sin compromisos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/configurador"
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

      {/* ── GALERÍA ───────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#faf9f6]">
        <div className="max-w-5xl mx-auto">
          <AnimateIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-[#1a1917]">
                Instalaciones reales
              </h2>
              <p className="mt-3 text-[#7a756f] max-w-lg mx-auto text-base">
                Nuestros trabajos en terrazas, pérgolas y jardines de la costa de Murcia.
              </p>
            </div>
          </AnimateIn>

          <Gallery />
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="bg-[#0d0c0b] text-white/35 text-xs py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-white/10">
            <div>
              <span className="font-bold text-base text-white select-none block mb-4">
                <span className="text-[#d4a034]">Todo</span>
                <span className="text-white/55">Sombra</span>
              </span>
              <p className="text-white/40 text-[11px] leading-relaxed">
                Toldos y pérgolas a medida. Directos de fábrica, instalación profesional en Mar Menor y costa de Murcia.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white/70 mb-3">Producto</h4>
              <ul className="space-y-2">
                <li><Link href="/configurador" className="hover:text-white/70 transition">Configurador</Link></li>
                <li><a href="#productos" className="hover:text-white/70 transition">Catálogo</a></li>
                <li><a href="#contacto" className="hover:text-white/70 transition">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white/70 mb-3">Empresa</h4>
              <ul className="space-y-2">
                <li><a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition">WhatsApp</a></li>
                <li><a href="tel:644592007" className="hover:text-white/70 transition">+34 644 592 007</a></li>
                <li><span className="text-white/30">Mar Menor, Murcia</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white/70 mb-3">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white/70 transition">Aviso legal</a></li>
                <li><a href="#" className="hover:text-white/70 transition">Privacidad</a></li>
                <li><a href="#" className="hover:text-white/70 transition">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-white/25 text-[10px]">
            <span>© 2026 TodoSombra · Todos los derechos reservados</span>
            <span>Hecho con ☀️ en Murcia · España</span>
          </div>
        </div>
      </footer>

      <StickyCTA />
    </main>
  );
}
