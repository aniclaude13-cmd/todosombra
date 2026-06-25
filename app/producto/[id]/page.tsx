import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { obtenerProductoDetail } from '@/lib/product-details';
import { PRODUCTOS_POR_CATEGORIA } from '@/lib/configurador/productImages';

const eur = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

export const metadata = {
  title: 'Producto — TodoSombra',
  description: 'Detalles del producto',
};

export async function generateStaticParams() {
  const todosProdutos = Object.values(PRODUCTOS_POR_CATEGORIA).flat();
  return todosProdutos.map((p) => ({ id: p.id }));
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const detail = obtenerProductoDetail(id);

  if (!detail) {
    notFound();
  }

  return (
    <main className="bg-[#faf9f6] text-[#1a1917]">
      {/* Header */}
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
      <section className="max-w-6xl mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Imagen */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#f0ede6]">
            <Image
              src={detail.imagenHero}
              alt={detail.nombre}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <div className="text-[11px] text-[#d4a034] uppercase tracking-widest font-semibold mb-2">
                Producto premium
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-[#1a1917] mb-2">
                {detail.nombre}
              </h1>
              <p className="text-xl text-[#7a756f]">{detail.tagline}</p>
            </div>

            <p className="text-base text-[#1a1917] leading-relaxed">
              {detail.descripcion}
            </p>

            {/* Precio y garantía */}
            <div className="bg-[#faf9f6] rounded-xl p-4 space-y-2">
              {detail.bajoConsulta ? (
                <div className="flex items-center justify-between">
                  <span className="text-[#7a756f]">Precio</span>
                  <span className="text-2xl font-bold text-[#1a1917]">Bajo consulta</span>
                </div>
              ) : detail.precioDesde ? (
                <div className="flex items-center justify-between">
                  <span className="text-[#7a756f]">Precio desde</span>
                  <span className="text-2xl font-bold text-[#1a1917]">{eur(detail.precioDesde)}</span>
                </div>
              ) : null}
              <div className="flex items-center justify-between pt-2 border-t border-[#e5e1d8]">
                <span className="text-[#7a756f]">🛡️ Garantía</span>
                <span className="font-medium text-[#1a1917]">{detail.garantia}</span>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-3 pt-4">
              {detail.bajoConsulta ? (
                <a
                  href={`https://wa.me/34644592007?text=${encodeURIComponent(`Hola, quiero información del ${detail.nombre}.`)}`}
                  className="block w-full bg-[#d4a034] text-[#0d0c0b] rounded-lg py-4 font-semibold text-center hover:bg-[#e8b442] transition shadow-sm shadow-[#d4a034]/20"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Solicitar presupuesto →
                </a>
              ) : (
                <>
                  <Link
                    href={`/configurador?producto=${detail.id}`}
                    className="block w-full bg-[#d4a034] text-[#0d0c0b] rounded-lg py-4 font-semibold text-center hover:bg-[#e8b442] transition shadow-sm shadow-[#d4a034]/20"
                  >
                    Cotizar {detail.nombre} →
                  </Link>
                  <a
                    href={`https://wa.me/34644592007?text=${encodeURIComponent(`Hola, me interesa conocer más sobre el ${detail.nombre}.`)}`}
                    className="block w-full border border-[#e5e1d8] text-[#1a1917] rounded-lg py-3 font-medium text-center hover:border-[#d4a034] transition"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📞 Hablar con un técnico
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="max-w-6xl mx-auto px-4 lg:px-8 py-12 border-t border-[#e5e1d8]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-[#1a1917] mb-6">Características técnicas</h2>
            <ul className="space-y-3">
              {detail.caracteristicas.map((car, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#d4a034] text-lg font-bold leading-none">✓</span>
                  <span className="text-[#1a1917]">{car}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#1a1917] mb-6">Beneficios principales</h2>
            <ul className="space-y-3">
              {detail.beneficios.map((ben, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#d4a034] text-lg font-bold leading-none">⭐</span>
                  <span className="text-[#1a1917]">{ben}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Galería */}
      {detail.galeriaFotos.length > 1 && (
        <section className="max-w-6xl mx-auto px-4 lg:px-8 py-12 border-t border-[#e5e1d8]">
          <h2 className="text-2xl font-bold text-[#1a1917] mb-6">Galería</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {detail.galeriaFotos.map((foto, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-[#f0ede6]">
                <Image
                  src={foto}
                  alt={`${detail.nombre} - foto ${i + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <section className="bg-[#0d0c0b] text-white">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-12 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para actualizar tu terraza?</h2>
          <p className="text-[#b0ada8] mb-6 max-w-2xl mx-auto">
            {detail.bajoConsulta
              ? 'Modelo bajo consulta. Escríbenos por WhatsApp y te preparamos un presupuesto a medida.'
              : 'Obtén un presupuesto exacto en 2 minutos. Sin formularios, sin esperas.'}
          </p>
          {detail.bajoConsulta ? (
            <a
              href={`https://wa.me/34644592007?text=${encodeURIComponent(`Hola, quiero información del ${detail.nombre}.`)}`}
              className="inline-flex items-center gap-2 bg-[#d4a034] text-[#0d0c0b] rounded-lg px-6 py-3 font-semibold hover:bg-[#e8b442] transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              Solicitar presupuesto →
            </a>
          ) : (
            <Link
              href={`/configurador?producto=${detail.id}`}
              className="inline-flex items-center gap-2 bg-[#d4a034] text-[#0d0c0b] rounded-lg px-6 py-3 font-semibold hover:bg-[#e8b442] transition"
            >
              Cotizar ahora →
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
