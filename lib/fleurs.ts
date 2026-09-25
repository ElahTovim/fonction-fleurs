// Les fleurs du jeu ne sont plus dessinées, ce sont des planches brodées.
// Chaque joueur reçoit une palette de deux espèces qui se répondent, et son
// bouquet les alterne. Deux palettes suffisent donc à distinguer les joueurs.

export type Palette = "a" | "b";

export const PALETTES = {
  a: { especes: ["gerbera", "allium"], nom: "gerbera et allium" },
  b: { especes: ["souci", "agapanthe"], nom: "souci et agapanthe" },
} as const;

// Le siège 1 prend la palette A, le siège 2 la palette B.
export const paletteOf = (seat: 1 | 2): Palette => (seat === 1 ? "a" : "b");

const STADE: Record<number, string> = { 1: "bouton", 2: "mi", 3: "pleine" };

/** L'image d'une fleur : sa place dans le bouquet donne l'espèce,
 *  sa qualité donne le stade d'ouverture. */
export function fleurSrc(palette: Palette, index: number, quality: 1 | 2 | 3, grande = false) {
  const espece = PALETTES[palette].especes[index % 2];
  return `/fleurs/${palette}-${espece}-${STADE[quality]}${grande ? "@2x" : ""}.webp`;
}

export function especeOf(palette: Palette, index: number) {
  return PALETTES[palette].especes[index % 2];
}

/** Les deux plans de fin de partie, un par palette. */
export const videoSrc = (palette: Palette, issue: "victoire" | "defaite") =>
  `/fleurs/${issue}-${palette}.mp4`;

/** Les images que la partie va réellement afficher, à précharger. */
export function assetsOf(palette: Palette) {
  const out: string[] = [];
  for (let i = 0; i < 2; i++) for (const q of [1, 2, 3] as const) out.push(fleurSrc(palette, i, q));
  return out;
}
