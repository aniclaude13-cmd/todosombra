import Link from 'next/link';
import Image from 'next/image';
import AnimateIn from './AnimateIn';
import { PRODUCTOS_POR_CATEGORIA, type Categoria } from '@/lib/configurador/productImages';

interface CategoriaSeccion {
  key: Categoria;
  titulo: string;
  desc: string;
}

const CATEGORIAS: CategoriaSeccion[] = [
  {
    key: 'cofre',
    titulo: 'Toldos cofre',
    desc: 'El cofre protege el tejido cuando está recogido. Robustos, elegantes y de larga duración.',
  },
  {
    key: 'pergola',
    titulo: 'Pérgolas',
    desc: 'Estructuras fijas o motorizadas. Lamas orientables, palillería o tejido tensado.',
  },
  {
    key: 'vertical',
    titulo: 'Verticales',
    desc: 'Cortavientos y cierres laterales. Cristal, screen o transparente para terrazas y porches.',
  },
  {
    key: 'brazo',
    titulo: 'Brazos articulados',
    desc: 'Toldos clásicos retráctiles. Máxima salida con instalación sencilla.',
  },
];

export default function ProductsShowcase() {
  return (
    <div className="space-y-20">
      {CATEGORIAS.map((cat) => {
        const productos = PRODUCTOS_POR_CATEGORIA[cat.key];
        if (productos.length === 0) return null;
        return (
          <div key={cat.key}>
            <AnimateIn>
              <div className="flex items-end justify-between mb-8 gap-6">
                <div>
                  <div className="text-[11px] text-[#d4a034] uppercase tracking-widest font-semibold mb-2">
                    {productos.length} {productos.length === 1 ? 'modelo' : 'modelos'}
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-[#1a1917]">
                    {cat.titulo}
                  </h3>
                  <p className="text-[#7a756f] text-sm mt-2 max-w-lg">{cat.desc}</p>
                </div>
                <Link
                  href="/configurador"
                  className="hidden sm:inline-flex items-center gap-1 text-sm text-[#d4a034] font-semibold hover:gap-2 transition-all shrink-0"
                >
                  Configurar <span>→</span>
                </Link>
              </div>
            </AnimateIn>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {productos.map((prod, i) => (
                <AnimateIn key={prod.id} delay={Math.min(i * 50, 350)}>
                  <Link
                    href="/configurador"
                    className="group block bg-white rounded-xl border border-[#e5e1d8] overflow-hidden hover:border-[#d4a034] hover:shadow-lg hover:shadow-[#d4a034]/10 transition-all duration-300 h-full"
                  >
                    <div className="relative aspect-[4/3] bg-[#f0ede6] overflow-hidden">
                      <Image
                        src={prod.imagen}
                        alt={prod.nombre}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0c0b]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
                    </div>
                    <div className="p-3 sm:p-4">
                      <div className="text-[9px] text-[#a09a94] uppercase tracking-wider font-medium mb-1">
                        {prod.categoriaLabel}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-[#1a1917] truncate">
                          {prod.nombre}
                        </h4>
                        <span className="text-[#d4a034] text-sm opacity-0 group-hover:opacity-100 transition shrink-0">
                          →
                        </span>
                      </div>
                    </div>
                  </Link>
                </AnimateIn>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
