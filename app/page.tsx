import Link from 'next/link';
import Image from 'next/image';
import AnimateIn from '@/components/AnimateIn';
import StatsBar from '@/components/StatsBar';
import Gallery from '@/components/Gallery';
import StickyCTA from '@/components/StickyCTA';
import ProductsShowcase from '@/components/ProductsShowcase';
import HowItWorks from '@/components/HowItWorks';

const WHATSAPP = 'https://wa.me/34644592007?text=Hola%2C%20me%20interesa%20un%20toldo%20o%20p%C3%A9rgola';
const WHATSAPP_INSTALADOR = `https://wa.me/34644592007?text=${encodeURIComponent('Hola, soy toldero profesional y quiero unirme a la red de instaladores TodoSombra.')}`;

const ventajasInstalador = [
  {
    icon: '🎯',
    title: 'Leads cualificados',
    desc: 'Recibe clientes que ya han configurado su toldo y conocen el precio. Solo cierras la visita técnica.',
  },
  {
    icon: '🏭',
    title: 'Producto AWMA directo',
    desc: 'Acceso a tarifa de instalador autorizado, con envío directo de fábrica y soporte técnico AWMA.',
  },
  {
    icon: '💳',
    title: 'Cobro asegurado',
    desc: 'TodoSombra gestiona pagos y financiación. Tú cobras tu parte sin perseguir al cliente.',
  },
  {
    icon: '🚀',
    title: 'Sin coste de alta',
    desc: 'Únete gratis, sin permanencia. Solo pagas por el material que pides a fábrica.',
  },
];

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
    icon: '🌐',
    title: 'Red de instaladores',
    desc: 'Equipos certificados en Murcia, Alicante, Valencia, Tarragona y Madrid.',
  },
  {
    icon: '🛡️',
    title: '3 años de garantía',
    desc: 'Garantía TodoSombra en instalación, más la garantía de fábrica AWMA en estructura.',
  },
];

const provincias = [
  'Murcia', 'Alicante', 'Valencia', 'Tarragona', 'Madrid',
];

export default function Home() {
  return (
    <main className="bg-[#faf9f6] text-[#1a1917]">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen overflow-hidden flex flex-col">

        {/* Background image with ken-burns */}
        <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
          <Image
            src="/hero-toldo.jpg"
            alt="Toldo en terraza"
            fill
            className="object-cover object-right hero-kenburns"
            priority
            quality={90}
          />
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0c0b] via-[#0d0c0b]/80 to-[#0d0c0b]/30 pointer-events-none" style={{ zIndex: 1 }} />
        {/* Bottom fade for depth */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0d0c0b]/70 to-transparent pointer-events-none" style={{ zIndex: 1 }} />

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
              href="#instaladores"
              className="text-sm text-white/50 hover:text-white transition hidden md:block"
            >
              Instaladores
            </a>
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
            Murcia · Alicante · Valencia · Tarragona · Madrid
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

          {/* Trust strip */}
          <div className="hero-trust mt-8 flex items-center justify-center gap-3 text-xs text-white/45">
            <div className="flex items-center gap-0.5 text-[#d4a034]">
              {[0, 1, 2, 3, 4].map((i) => (
                <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M10 1.5l2.6 5.4 5.9.6-4.4 4 1.3 5.8L10 14.4l-5.4 2.9 1.3-5.8-4.4-4 5.9-.6L10 1.5z" />
                </svg>
              ))}
            </div>
            <span>4.9/5 · Instaladores certificados AWMA</span>
          </div>
        </div>

        {/* Floating live-price card (desktop) */}
        <div
          className="hero-card hidden lg:flex absolute bottom-12 right-8 xl:right-16 w-[260px] bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl shadow-black/40 p-4 flex-col gap-3 border border-white/20 float-bob"
          style={{ zIndex: 10 }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-[#a09a94] font-semibold">
              Configurando
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              en vivo
            </span>
          </div>
          <div>
            <div className="text-[11px] text-[#a09a94]">Toldo cofre ARES</div>
            <div className="font-bold text-[#1a1917] text-sm">4,00 × 3,00 m · RAL 9006</div>
          </div>
          <div className="space-y-1 text-[11px] text-[#7a756f] border-t border-[#e5e1d8] pt-2">
            <div className="flex justify-between">
              <span>Máquina + tejido</span>
              <span className="text-[#1a1917]">1.245 €</span>
            </div>
            <div className="flex justify-between">
              <span>Motor Somfy</span>
              <span className="text-[#1a1917]">335 €</span>
            </div>
            <div className="flex justify-between">
              <span>IVA + instalación</span>
              <span className="text-[#1a1917]">incluido</span>
            </div>
          </div>
          <div className="flex items-end justify-between border-t border-[#e5e1d8] pt-2">
            <span className="text-[10px] text-[#a09a94] uppercase tracking-wide">Total</span>
            <span className="text-xl font-bold text-[#d4a034]">1.580 €</span>
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
      <HowItWorks />

      {/* ── PRODUCTOS ────────────────────────────────────────── */}
      <section id="productos" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <AnimateIn>
            <div className="text-center mb-16">
              <div className="text-[11px] text-[#d4a034] uppercase tracking-widest font-semibold mb-3">
                Catálogo AWMA · +50 modelos
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-[#1a1917]">
                Toda la gama, configurable a medida
              </h2>
              <p className="mt-3 text-[#7a756f] max-w-xl mx-auto text-base">
                Toldos cofre, pérgolas, verticales y brazos articulados. Elige el tuyo y
                obtén el precio exacto en segundos.
              </p>
            </div>
          </AnimateIn>

          <ProductsShowcase />
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
                Instalamos en 5 provincias
              </h2>
              <p className="text-white/40 mb-10 max-w-md mx-auto text-sm leading-relaxed">
                Red de instaladores certificados AWMA en Murcia, Comunidad Valenciana, Cataluña y Madrid.
              </p>
              <div className="flex flex-wrap justify-center gap-2.5">
                {provincias.map((loc) => (
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

      {/* ── ÚNETE A LA RED ───────────────────────────────────── */}
      <section id="instaladores" className="bg-[#f0ede6] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <AnimateIn>
            <div className="text-center mb-12">
              <div className="text-[11px] text-[#d4a034] uppercase tracking-widest font-semibold mb-3">
                Para profesionales
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-[#1a1917] mb-4">
                ¿Eres toldero profesional?
              </h2>
              <p className="text-[#7a756f] max-w-xl mx-auto text-base leading-relaxed">
                Únete a la red TodoSombra y monta en toda España. Te traemos los clientes;
                tú haces lo que mejor sabes hacer: instalar.
              </p>
            </div>
          </AnimateIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {ventajasInstalador.map((v, i) => (
              <AnimateIn key={v.title} delay={i * 90}>
                <div className="bg-white rounded-2xl p-6 border border-[#e5e1d8] h-full">
                  <div className="text-2xl mb-3">{v.icon}</div>
                  <div className="font-semibold text-[#1a1917] mb-2">{v.title}</div>
                  <p className="text-sm text-[#7a756f] leading-relaxed">{v.desc}</p>
                </div>
              </AnimateIn>
            ))}
          </div>

          <AnimateIn>
            <div className="bg-[#1a1917] rounded-3xl p-8 lg:p-12 text-center">
              <div className="text-xs text-[#d4a034]/70 uppercase tracking-widest mb-3">
                Buscamos instaladores en toda España
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3">
                Asturias, Galicia, País Vasco, Andalucía…
              </h3>
              <p className="text-white/50 mb-8 max-w-lg mx-auto text-sm leading-relaxed">
                Si tienes empresa de toldos y quieres recibir leads de tu zona, escríbenos por
                WhatsApp y te mandamos las condiciones del acuerdo.
              </p>
              <a
                href={WHATSAPP_INSTALADOR}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#d4a034] text-[#0d0c0b] font-semibold px-8 py-4 rounded-full hover:bg-[#e8b442] transition-all hover:scale-105 active:scale-95"
              >
                Quiero unirme a la red →
              </a>
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
                Nuestros trabajos en terrazas, pérgolas y jardines del Levante y Madrid.
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
                Toldos y pérgolas a medida. Directos de fábrica, red de instaladores en Murcia, Levante, Cataluña y Madrid.
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
