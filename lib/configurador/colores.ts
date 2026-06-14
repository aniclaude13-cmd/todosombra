// Catálogo Sauleda PLAINS (lisos) por categorías. Sin incremento de precio.
// Ported from bot.py CATEGORIAS_SAULEDA.

export const CATEGORIAS_SAULEDA: { label: string; emoji: string; colores: string[] }[] = [
  {
    label: "Blancos y neutros",
    emoji: "⬜",
    colores: [
      "Optik", "Blanco", "Natural", "Vainilla", "Crema", "Champagne",
      "Alabastro", "Shell", "Salt", "Zurich",
    ],
  },
  {
    label: "Beiges y arenas",
    emoji: "🟤",
    colores: [
      "Caramel", "Trigo", "Arena", "Sand", "Beige", "Avena", "Toast",
      "Alamo", "Tenneré", "Gobi", "Siroco", "Integral", "Pergamino",
      "Almond", "Toffee", "Visón", "Tweed Avena", "Coco", "Maquillaje",
    ],
  },
  {
    label: "Marrones y tierras",
    emoji: "🟫",
    colores: [
      "Trufa", "Bronce", "Ocre", "Cobre", "Teja", "Terracota", "Marrón",
      "Chocolat", "Café", "Miel", "Seda", "Mármol", "Lugano", "Berna",
      "Hormigón", "Rain",
    ],
  },
  {
    label: "Amarillos y naranjas",
    emoji: "🟡",
    colores: [
      "Oro", "Mostaza", "Maiz", "Cereal", "Limón", "Lima", "Amarillo",
      "Dallas", "Melocotón", "Mandarina", "Naranja", "Salmón",
    ],
  },
  {
    label: "Rojos y granates",
    emoji: "🔴",
    colores: [
      "Azafrán", "Tomate", "Rojo", "Logo Red", "Generation Red", "Cherry",
      "Splendore", "Rioja", "Brasserie", "Granite", "Tweed Rojo", "Sandia", "Lava",
    ],
  },
  {
    label: "Rosas y lilas",
    emoji: "🌸",
    colores: ["Berry", "Pink", "Grape", "Maiva", "Lila", "Lavanda", "Malva"],
  },
  {
    label: "Azules",
    emoji: "🔵",
    colores: [
      "Turkis", "Celeste", "Blue Mist", "Glacier", "Denim", "Bombay",
      "Indigo", "Regata", "Brisa", "Trópic", "Ocean", "Azul Real", "Azul",
      "Marino", "Admiral", "Commodore", "Jade", "Aquamarina", "Lagoon",
    ],
  },
  {
    label: "Verdes",
    emoji: "🟢",
    colores: [
      "Oliva", "Bambú", "Eucaliptus", "Cactus", "Fresh", "Musgo", "Tirol",
      "Verde Cl.", "Anis", "Confetti", "Tweed Verde", "Verde", "Botella",
      "Deep Blue", "Racing",
    ],
  },
  {
    label: "Grises y negros",
    emoji: "⚫",
    colores: [
      "Quartz", "Niebla", "Silver", "Perla", "Piedra", "Tweed Gris Cl.",
      "Tweed Perla", "Gris", "Mineral", "Basalto", "Grafito", "Antracita",
      "Carbón", "Tweed Negro", "Coal", "Negro",
    ],
  },
];

export const COLORES_SAULEDA_PLAINS = new Set(
  CATEGORIAS_SAULEDA.flatMap((c) => c.colores.map((x) => x.toLowerCase())),
);

// Colores de aluminio rápidos (teclado del bot).
export const COLORES_ALUMINIO: { label: string; valor: string; emoji: string; ral?: string; hex: string }[] = [
  { emoji: "⬜", label: "Blanco", valor: "Blanco", ral: "9016", hex: "#f1f0ec" },
  { emoji: "🔘", label: "Gris / Plata", valor: "Gris", ral: "9006", hex: "#a8a9ad" },
  { emoji: "⚫", label: "Antracita", valor: "Antracita", ral: "7016", hex: "#383e42" },
  { emoji: "⬛", label: "Negro", valor: "Negro", ral: "9005", hex: "#0a0a0a" },
  { emoji: "🟤", label: "Bronce / Marrón", valor: "Marrón", ral: "8019", hex: "#3b2a23" },
];

// Mapa de color de tejido (aproximado, para preview UI).
export const TEJIDO_HEX: Record<string, string> = {
  optik: "#f5f0e6", blanco: "#f8f6ee", natural: "#ece2cf", vainilla: "#f0e3c4",
  crema: "#efe2c2", champagne: "#dfceac", alabastro: "#ebe5d3", shell: "#e5dac8",
  salt: "#eee6d4", zurich: "#d8cebc",
  caramel: "#c8a06a", trigo: "#dec79b", arena: "#d5b988", sand: "#d2b988",
  beige: "#d9c79e", avena: "#d6c5a3", toast: "#b58b5a", almond: "#cda87a",
  visón: "#a98c70", coco: "#9c7d5a", maquillaje: "#d9b893",
  trufa: "#634c3c", bronce: "#7b5a3b", ocre: "#a87c4a", cobre: "#a35a36",
  teja: "#b3552f", terracota: "#aa4a32", marrón: "#5e3d2a", chocolat: "#4b2f1f",
  café: "#4a2f1d", miel: "#b07a3c", seda: "#a17b5a", lugano: "#6b432e",
  hormigón: "#7a7268",
  oro: "#c79a36", mostaza: "#c79a2b", limón: "#e6d44a", amarillo: "#e8c742",
  naranja: "#d97a2b", salmón: "#d88a6a",
  rojo: "#a92e2e", azafrán: "#c97632", tomate: "#c33b32", granate: "#5e1e22",
  lava: "#7a2a2a",
  rosa: "#c9698e", lila: "#9a76aa", lavanda: "#a194c4", malva: "#a06e93",
  azul: "#2f5d8a", marino: "#1c3b62", celeste: "#7baad1", indigo: "#384a78",
  jade: "#357a72", aquamarina: "#5fb2a6", lagoon: "#3a8d8d",
  verde: "#3d6b3a", oliva: "#6a7142", cactus: "#7b8e54", musgo: "#54683a",
  botella: "#23432e", racing: "#1f4a2e",
  gris: "#8e8b86", quartz: "#a09e9a", silver: "#b9b6b2", perla: "#cfcdc8",
  antracita: "#3a3f44", grafito: "#444a4e", basalto: "#3b3f43",
  negro: "#0e0e0e", coal: "#1a1a1a",
};

export function colorTejidoHex(nombre: string): string {
  const k = nombre.toLowerCase();
  for (const key of Object.keys(TEJIDO_HEX)) {
    if (k.includes(key)) return TEJIDO_HEX[key];
  }
  return "#d6c8a8"; // default crema
}
