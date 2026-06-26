export type Categoria = 'cofre' | 'pergola' | 'vertical' | 'brazo' | 'stor';

export interface ProductoVisual {
  id: string;
  nombre: string;
  categoria: Categoria;
  categoriaLabel: string;
  imagen: string;
  icono: string;
  familia?: string;
  familiaLabel?: string;
  varianteLabel?: string;
}

const RAW: ProductoVisual[] = [
  { id: 'BOX5200', nombre: 'SAMA', categoria: 'cofre', categoriaLabel: 'Toldo cofre', imagen: '/box5200-sama-catalog.jpg', icono: '🏖️' },
  { id: 'BOX6000', nombre: 'IRIS', categoria: 'cofre', categoriaLabel: 'Toldo cofre', imagen: '/box6000-iris-catalog.jpg', icono: '🏖️' },
  { id: 'BOX6010_INDIE', nombre: 'INDIE', categoria: 'cofre', categoriaLabel: 'Toldo cofre', imagen: '/box6010-indie-catalog.jpg', icono: '🏖️' },
  { id: 'BOX6100', nombre: 'BOX6100', categoria: 'cofre', categoriaLabel: 'Toldo cofre', imagen: '/box6100-catalog.jpg', icono: '🏖️' },
  { id: 'BOX6100_ARES', nombre: 'ARES', categoria: 'cofre', categoriaLabel: 'Toldo cofre', imagen: '/box6100-ares-catalog.jpg', icono: '🏖️' },
  { id: 'BOX6110', nombre: 'CONCEPT', categoria: 'cofre', categoriaLabel: 'Toldo cofre', imagen: '/box6110-concept-catalog.jpg', icono: '🏖️' },
  { id: 'BOX6300', nombre: 'ALAND', categoria: 'cofre', categoriaLabel: 'Toldo cofre', imagen: '/box6300-aland-catalog.jpg', icono: '🏖️' },
  { id: 'BOX6400', nombre: 'LUSOL', categoria: 'cofre', categoriaLabel: 'Toldo cofre', imagen: '/box6400-lusol-catalog.jpg', icono: '🏖️' },
  { id: 'BOX6500', nombre: 'ARKO', categoria: 'cofre', categoriaLabel: 'Toldo cofre', imagen: '/box6500-arko-catalog.jpg', icono: '🏖️' },
  { id: 'BOX7000', nombre: 'GEMINI', categoria: 'cofre', categoriaLabel: 'Toldo cofre', imagen: '/box7000-gemini-catalog.jpg', icono: '🏖️' },
  { id: 'BOX8100', nombre: 'KYMA', categoria: 'cofre', categoriaLabel: 'Toldo cofre', imagen: '/box8100-kyma-catalog.jpg', icono: '🏖️' },
  { id: 'BOX8110', nombre: 'KYMA VERTIKO', categoria: 'cofre', categoriaLabel: 'Toldo cofre', imagen: '/box8110-kyma-vertiko-catalog.jpg', icono: '🏖️' },
  { id: 'BOX8200', nombre: 'KALI', categoria: 'cofre', categoriaLabel: 'Toldo cofre', imagen: '/box8200-kali-catalog.jpg', icono: '🏖️' },
  { id: 'BOX8300', nombre: 'MAXIMUS', categoria: 'cofre', categoriaLabel: 'Toldo cofre', imagen: '/box8300-maximus-catalog.jpg', icono: '🏖️' },

  { id: 'PL7000', nombre: 'Palillería 80×40', categoria: 'pergola', categoriaLabel: 'Pérgola', imagen: '/pl7000-catalog.jpg', icono: '⛱️', familia: 'palilleria', familiaLabel: 'Palillería', varianteLabel: '80×40' },
  { id: 'PL7010', nombre: 'Palillería 80×40 D', categoria: 'pergola', categoriaLabel: 'Pérgola', imagen: '/pl7010-catalog.jpg', icono: '⛱️', familia: 'palilleria', familiaLabel: 'Palillería', varianteLabel: '80×40 D' },
  { id: 'PL7020', nombre: 'Palillería 100×40', categoria: 'pergola', categoriaLabel: 'Pérgola', imagen: '/pl7020-catalog.jpg', icono: '⛱️', familia: 'palilleria', familiaLabel: 'Palillería', varianteLabel: '100×40' },
  { id: 'PL7030', nombre: 'Palillería 100×40 D', categoria: 'pergola', categoriaLabel: 'Pérgola', imagen: '/pl7030-catalog.jpg', icono: '⛱️', familia: 'palilleria', familiaLabel: 'Palillería', varianteLabel: '100×40 D' },
  { id: 'TX7900', nombre: 'TENXO', categoria: 'pergola', categoriaLabel: 'Pérgola motorizada', imagen: '/tenxo-catalog.jpg', icono: '⛱️' },

  { id: 'AV8400', nombre: 'NEXUS 80', categoria: 'vertical', categoriaLabel: 'Vertical', imagen: '/av8400-nexus80-catalog.jpg', icono: '🔲', familia: 'nexus', familiaLabel: 'NEXUS', varianteLabel: '80' },
  { id: 'AV8500', nombre: 'NEXUS 100', categoria: 'vertical', categoriaLabel: 'Vertical', imagen: '/av8500-nexus100-catalog.jpg', icono: '🔲', familia: 'nexus', familiaLabel: 'NEXUS', varianteLabel: '100' },
  { id: 'AV8600', nombre: 'NEXUS 130', categoria: 'vertical', categoriaLabel: 'Vertical', imagen: '/av8600-nexus130-catalog.jpg', icono: '🔲', familia: 'nexus', familiaLabel: 'NEXUS', varianteLabel: '130' },
  { id: 'AV8700', nombre: 'PARAVENTO', categoria: 'vertical', categoriaLabel: 'Vertical', imagen: '/av8700-paravento-catalog.jpg', icono: '🔲' },
  { id: 'AV8750', nombre: 'PARABOX', categoria: 'vertical', categoriaLabel: 'Vertical', imagen: '/av8750-parabox-catalog.jpg', icono: '🔲' },
  { id: 'AV8770', nombre: 'IGLOOO', categoria: 'vertical', categoriaLabel: 'Vertical', imagen: '/av8770-iglooo-catalog.jpg', icono: '🔲' },
  { id: 'AV8870-1', nombre: 'NIMBUS', categoria: 'vertical', categoriaLabel: 'Vertical', imagen: '/av8870-nimbus-catalog.jpg', icono: '🔲' },

  { id: 'ART4100', nombre: 'ART 4100', categoria: 'brazo', categoriaLabel: 'Brazo articulado', imagen: '/art4100-catalog.jpg', icono: '🌤️', familia: 'art', familiaLabel: 'ART', varianteLabel: '4100' },
  { id: 'ART4110', nombre: 'ART 4110', categoria: 'brazo', categoriaLabel: 'Brazo articulado', imagen: '/art4110-catalog.jpg', icono: '🌤️', familia: 'art', familiaLabel: 'ART', varianteLabel: '4110' },
];

const BY_ID: Record<string, ProductoVisual> = RAW.reduce(
  (acc, p) => {
    acc[p.id] = p;
    return acc;
  },
  {} as Record<string, ProductoVisual>,
);

const VARIANT_FALLBACK: Record<string, string> = {
  AV8410: 'AV8400', AV8430: 'AV8400',
  AV8510: 'AV8500', AV8530: 'AV8500',
  AV8610: 'AV8600', AV8630: 'AV8600',
  AV8710: 'AV8700', AV8730: 'AV8700',
  'AV8870-2': 'AV8870-1',
  'AV8890-1': 'AV8870-1', 'AV8890-2': 'AV8870-1',
  TX7910: 'TX7900', TX7930: 'TX7900', TX7950: 'TX7900', TX7970: 'TX7900',
};

export function getProductoVisual(id: string): ProductoVisual | null {
  if (BY_ID[id]) return BY_ID[id];
  const fallbackId = VARIANT_FALLBACK[id];
  if (fallbackId && BY_ID[fallbackId]) return BY_ID[fallbackId];
  return null;
}

export function categorizarPorId(id: string): { categoria: string; icono: string; imagen?: string } {
  const v = getProductoVisual(id);
  if (v) return { categoria: v.categoriaLabel, icono: v.icono, imagen: v.imagen };

  const up = id.toUpperCase();
  if (up.startsWith('STR')) return { categoria: 'Stor balcón', icono: '🪟' };
  if (up.startsWith('PR')) return { categoria: 'Pérgola perimetral', icono: '⛱️' };
  return { categoria: 'Toldo', icono: '☂️' };
}

export const PRODUCTOS_POR_CATEGORIA: Record<Categoria, ProductoVisual[]> = {
  cofre: RAW.filter((p) => p.categoria === 'cofre'),
  pergola: RAW.filter((p) => p.categoria === 'pergola'),
  vertical: RAW.filter((p) => p.categoria === 'vertical'),
  brazo: RAW.filter((p) => p.categoria === 'brazo'),
  stor: RAW.filter((p) => p.categoria === 'stor'),
};

export const PRODUCTOS_VISUALES: ProductoVisual[] = RAW;

export interface FamiliaCard {
  primary: ProductoVisual;
  displayName: string;
  variantes: ProductoVisual[];
}

function agruparPorFamilia(productos: ProductoVisual[]): FamiliaCard[] {
  const cards: FamiliaCard[] = [];
  const seenFamily = new Set<string>();

  for (const p of productos) {
    if (!p.familia) {
      cards.push({ primary: p, displayName: p.nombre, variantes: [] });
      continue;
    }
    if (seenFamily.has(p.familia)) continue;
    seenFamily.add(p.familia);
    const variantes = productos.filter((v) => v.familia === p.familia);
    cards.push({
      primary: p,
      displayName: p.familiaLabel ?? p.nombre,
      variantes,
    });
  }

  return cards;
}

export const FAMILIAS_POR_CATEGORIA: Record<Categoria, FamiliaCard[]> = {
  cofre: agruparPorFamilia(PRODUCTOS_POR_CATEGORIA.cofre),
  pergola: agruparPorFamilia(PRODUCTOS_POR_CATEGORIA.pergola),
  vertical: agruparPorFamilia(PRODUCTOS_POR_CATEGORIA.vertical),
  brazo: agruparPorFamilia(PRODUCTOS_POR_CATEGORIA.brazo),
  stor: agruparPorFamilia(PRODUCTOS_POR_CATEGORIA.stor),
};

export function getVariantesDeFamilia(id: string): ProductoVisual[] {
  const p = BY_ID[id];
  if (!p?.familia) return [];
  return RAW.filter((v) => v.familia === p.familia);
}
