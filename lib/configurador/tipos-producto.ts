export const TIPOS_PRODUCTO = {
  "🌅 Toldo de terraza": {
    tipo: "toldo_cofre",
    subtipos: ["toldo_cofre"],
  },
  "🪟 Toldo de balcón / ventana": {
    tipo: "toldo_punto_recto",
    subtipos: ["toldo_punto_recto"],
  },
  "🏠 Toldo veranda (techo cristal)": {
    tipo: "toldo_punto_recto_cofre",
    subtipos: ["toldo_punto_recto_cofre"],
  },
  "🌞 Pérgola bioclimática (lamas)": {
    tipo: "pergola",
    subtipos: ["pergola"],
  },
  "🪢 Toldo de brazos": {
    tipo: "toldo_brazo",
    subtipos: ["toldo_brazo"],
  },
  "🌬️ Toldos verticales": {
    tipo: "vertical",
    subtipos: null,
  },
  "🎪 Palillería / Pérgola": {
    tipo: "palilleria",
    subtipos: ["palilleria"],
  },
};

export function getTiposProductoOptions() {
  return Object.entries(TIPOS_PRODUCTO).map(([label, config]) => ({
    label,
    ...config,
  }));
}
