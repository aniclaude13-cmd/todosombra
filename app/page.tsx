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
            Tu toldo a medida, en 3D, en minutos.
          </h1>
          <p className="mt-4 text-lg text-stone-600 max-w-2xl mx-auto">
            Configura tu toldo o pérgola exactamente como lo quieres. Te lo fabricamos y te lo enviamos directamente a casa
            en 4 semanas.
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
              Toldo cofre con brazos articulados Premium. Para terrazas y balcones de hasta 6 m de ancho.
            </p>
            <div className="mt-6 text-stone-900 font-medium group-hover:underline">Configurar →</div>
          </Link>
          <div className="block bg-stone-50 rounded-xl border border-dashed border-stone-300 p-8">
            <div className="text-sm text-stone-400 uppercase tracking-wider">Pérgola</div>
            <h2 className="text-2xl font-semibold text-stone-400 mt-2">Palillería 80×40</h2>
            <p className="text-stone-400 mt-3 text-sm">Próximamente.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
