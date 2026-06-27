import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Partner TodoSombra — Sello de instalador certificado',
  description: 'Sello "Partner TodoSombra" para instaladores profesionales de toldos y pérgolas AWMA. Calidad garantizada, leads cualificados y soporte directo de fábrica.',
};

const WHATSAPP_INSTALADOR = `https://wa.me/34644592007?text=${encodeURIComponent('Hola, soy toldero profesional y quiero unirme a la red de partners TodoSombra.')}`;

const compromisos = [
  {
    icon: '🏭',
    title: 'Producto AWMA original',
    desc: 'El partner trabaja exclusivamente con estructuras AWMA, con tarifa de instalador autorizado y soporte técnico de fábrica.',
  },
  {
    icon: '🎯',
    title: 'Visita técnica gratuita',
    desc: 'Antes de cobrar nada, el partner visita al cliente, mide y confirma el proyecto. Sin sorpresas en el presupuesto final.',
  },
  {
    icon: '🛡️',
    title: 'Garantía de servicio',
    desc: 'Mínimo 2 años en la instalación, ampliables. Si algo falla, el partner responde directamente al cliente.',
  },
  {
    icon: '💳',
    title: 'Pago seguro vía TodoSombra',
    desc: 'TodoSombra gestiona el cobro y la financiación Cetelem. El partner cobra su parte al entregar, sin riesgo de impago.',
  },
  {
    icon: '📋',
    title: 'Cumplimiento legal',
    desc: 'Empresa dada de alta, IVA en factura, seguro de responsabilidad civil y residuos gestionados según normativa.',
  },
  {
    icon: '⭐',
    title: 'Calidad evaluada',
    desc: 'Cada instalación se evalúa por el cliente. Un partner con menos de 4/5 estrellas pierde la acreditación.',
  },
];

export default function PartnersPage() {
  return (
    <main className="bg-[#faf9f6] text-[#1a1917]">
      {/* Nav */}
      <header className="bg-white border-b border-[#e5e1d8] sticky top-0 z-10">
        <nav className="max-w-6xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg">
            <span className="text-[#d4a034]">Todo</span><span>Sombra</span>
          </Link>
          <Link href="/" className="text-sm text-[#7a756f] hover:text-[#1a1917]">
            ← Volver
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="bg-[#0d0c0b] text-white py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs text-[#d4a034] uppercase tracking-widest mb-4 border border-[#d4a034]/30 rounded-full px-4 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4a034] animate-pulse" />
              Sello oficial
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Partner <span className="text-[#d4a034]">TodoSombra</span>
            </h1>
            <p className="text-lg text-white/60 leading-relaxed mb-8">
              Nuestro sello identifica a los instaladores que cumplen los estándares de calidad,
              servicio y transparencia que TodoSombra exige. Si lo ves, sabes que estás en buenas manos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={WHATSAPP_INSTALADOR}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#d4a034] text-[#0d0c0b] font-semibold px-8 py-4 rounded-full hover:bg-[#e8b442] transition text-center"
              >
                Quiero ser Partner →
              </a>
              <Link
                href="/via-rapida"
                className="border border-white/20 text-white/80 font-medium px-8 py-4 rounded-full hover:border-white/40 hover:text-white transition text-center"
              >
                Buscar un Partner cerca
              </Link>
            </div>
          </div>
          <div className="flex justify-center">
            <Image
              src="/partner-badge.svg"
              alt="Sello Partner TodoSombra"
              width={300}
              height={300}
              className="drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Compromisos */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-[11px] text-[#d4a034] uppercase tracking-widest font-semibold mb-3">
              Qué garantiza el sello
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              6 compromisos del Partner TodoSombra
            </h2>
            <p className="text-[#7a756f] max-w-xl mx-auto">
              Cada instalador con el sello firma estos compromisos con el cliente final y con TodoSombra.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {compromisos.map((c) => (
              <div key={c.title} className="bg-white border border-[#e5e1d8] rounded-2xl p-6">
                <div className="text-2xl mb-3">{c.icon}</div>
                <div className="font-semibold mb-2">{c.title}</div>
                <p className="text-sm text-[#7a756f] leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners actuales */}
      <section className="bg-[#f0ede6] py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-[11px] text-[#d4a034] uppercase tracking-widest font-semibold mb-3">
              Red actual
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Partners certificados
            </h2>
            <p className="text-[#7a756f] max-w-xl mx-auto">
              Estos profesionales ya forman parte de la red.
            </p>
          </div>

          <div className="bg-white border border-[#e5e1d8] rounded-2xl p-8 max-w-lg mx-auto">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-xl bg-[#0d0c0b] text-[#d4a034] flex items-center justify-center text-xs font-bold flex-shrink-0 text-center leading-tight">
                Tecni<br/>toldo
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold">Tecnitoldo</h3>
                  <Image src="/partner-badge.svg" alt="Partner" width={28} height={28} />
                </div>
                <p className="text-sm text-[#7a756f] mb-3">
                  Más de 30 años montando toldos en Levante. Primer partner certificado.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {['Alicante', 'Valencia', 'Tarragona', 'Madrid', 'Murcia'].map((p) => (
                    <span key={p} className="text-xs bg-[#faf9f6] text-[#1a1917] px-3 py-1 rounded-full border border-[#e5e1d8]">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-[#d4a034] py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-[#0d0c0b] mb-4">
            ¿Tu empresa puede llevar el sello?
          </h2>
          <p className="text-[#0d0c0b]/65 mb-8">
            Si firmas los compromisos, te damos el sello, los leads y la tarifa de instalador autorizado.
          </p>
          <a
            href={WHATSAPP_INSTALADOR}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#0d0c0b] text-white font-semibold px-9 py-4 rounded-full hover:bg-[#1a1917] transition"
          >
            Solicitar acreditación →
          </a>
        </div>
      </section>
    </main>
  );
}
