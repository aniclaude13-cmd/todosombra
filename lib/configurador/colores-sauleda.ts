export const CATEGORIAS_SAULEDA = {
  "⬜ Blancos y neutros": [
    "Optik", "Blanco", "Natural", "Vainilla", "Crema", "Champagne",
    "Alabastro", "Shell", "Salt", "Zurich",
  ],
  "🟤 Beiges y arenas": [
    "Caramel", "Trigo", "Arena", "Sand", "Beige", "Avena", "Toast",
    "Alamo", "Tenneré", "Gobi", "Siroco", "Integral", "Pergamino",
    "Almond", "Toffee", "Visón", "Tweed Avena", "Coco", "Maquillaje",
  ],
  "🟫 Marrones y tierras": [
    "Trufa", "Bronce", "Ocre", "Cobre", "Teja", "Terracota", "Marrón",
    "Chocolat", "Café", "Miel", "Seda", "Mármol", "Lugano", "Berna",
    "Hormigón", "Rain",
  ],
  "🟡 Amarillos y naranjas": [
    "Oro", "Mostaza", "Maiz", "Cereal", "Limón", "Lima", "Amarillo",
    "Dallas", "Melocotón", "Mandarina", "Naranja", "Salmón",
  ],
  "🔴 Rojos y granates": [
    "Azafrán", "Tomate", "Rojo", "Logo Red", "Generation Red", "Cherry",
    "Splendore", "Rioja", "Brasserie", "Granite", "Tweed Rojo", "Sandia", "Lava",
  ],
  "🌸 Rosas y lilas": [
    "Berry", "Pink", "Grape", "Maiva", "Lila", "Lavanda", "Malva",
  ],
  "🔵 Azules": [
    "Turkis", "Celeste", "Blue Mist", "Glacier", "Denim", "Bombay",
    "Indigo", "Regata", "Brisa", "Trópic", "Ocean", "Azul Real", "Azul",
    "Marino", "Admiral", "Commodore", "Jade", "Aquamarina", "Lagoon",
  ],
  "🟢 Verdes": [
    "Oliva", "Bambú", "Eucaliptus", "Cactus", "Fresh", "Musgo", "Tirol",
    "Verde Cl.", "Anis", "Confetti", "Tweed Verde", "Verde", "Botella",
    "Deep Blue", "Racing",
  ],
  "⚫ Grises y negros": [
    "Quartz", "Niebla", "Silver", "Perla", "Piedra", "Tweed Gris Cl.",
    "Tweed Perla", "Gris", "Mineral", "Basalto", "Grafito", "Antracita",
    "Carbón", "Tweed Negro", "Coal", "Negro",
  ],
};

export const COLORES_SAULEDA_SET = new Set(
  Object.values(CATEGORIAS_SAULEDA).flatMap((colores) =>
    colores.map((c) => c.toLowerCase())
  )
);

export function getCategoriaForColor(color: string): string | null {
  const colorLower = color.toLowerCase();
  for (const [categoria, colores] of Object.entries(CATEGORIAS_SAULEDA)) {
    if (colores.some((c) => c.toLowerCase() === colorLower)) {
      return categoria;
    }
  }
  return null;
}
