import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-100">
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <span className="text-stone-900 font-bold text-xl tracking-tight">TodoSombra</span>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-stone-900 tracking-tight">
            Diseña tu toldo o pérgola en 3D.<br className="hidden lg:block" /> Precio al instante.
          </h1>
          <p className="mt-4 text-lg text-stone-600 max-w-2xl mx-auto">
            Sin formularios, sin esperas. Configura tu medida exacta, ve el resultado en tiempo real y recibe el precio en el momento. Fabricación profesional y envío directo desde fábrica.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <Link
            href="/configurador/ares"
            className="group block bg-white rounded-xl border border-stone-200 p-8 hover:border-stone-900 hover:shadow-lg transition"
          >
            <div className="text-sm text-stone-500 uppercase tracking-wider">Toldo cofre</div>
            <h2 className="text-2xl font-semibold text-stone-900 mt-2">ARES</h2>
            <p className="text-stone-600 mt-3 text-sm">
              El cofre más vendido en terrazas. Hasta 6 m de ancho, manual o motorizado con Somfy.
            </p>
            <div className="mt-6 text-stone-900 font-medium group-hover:underline">Configurar →</div>
          </Link>
          <Link
            href="/configurador/palilleria"
            className="group block bg-white rounded-xl border border-stone-200 p-8 hover:border-stone-900 hover:shadow-lg transition"
          >
            <div className="text-sm text-stone-500 uppercase tracking-wider">Pérgola</div>
            <h2 className="text-2xl font-semibold text-stone-900 mt-2">Palillería 80×40</h2>
            <p className="text-stone-600 mt-3 text-sm">
              La pérgola de jardín. Cuatro configuraciones para fijación en pared, portería o autoportante.
            </p>
            <div className="mt-6 text-stone-900 font-medium group-hover:underline">Configurar →</div>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-10">
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <div className="text-stone-900 font-semibold mb-1">Precio real, ya</div>
            <p className="text-stone-500 text-sm">Nada de "te llamamos". El precio exacto aparece mientras configuras.</p>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <div className="text-stone-900 font-semibold mb-1">Fabricante detrás</div>
            <p className="text-stone-500 text-sm">Producto AWMA, el mismo fabricante que montan los profesionales.</p>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <div className="text-stone-900 font-semibold mb-1">Directo a tu puerta</div>
            <p className="text-stone-500 text-sm">Enviamos desde fábrica en 4 semanas. Sin tiendas intermedias.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
