// Les fleurs du jeu sont des planches brodées. Chaque joueur reçoit une
// palette de trois espèces composée comme un fleuriste compose : une fleur
// dominante, une secondaire, une légère qui lie l'ensemble. L'espèce n'est
// pas décorative, elle dit la famille de la notion gagnée.

import { type Famille, familleDe } from "./notions";

export type Palette = "a" | "b";

/** dominante = apprendre, secondaire = décrire, liante = mesurer */
export const PALETTES: Record<Palette, Record<Famille, string>> = {
  a: { apprendre: "gerbera", decrire: "allium", mesurer: "gypsophile" },
  b: { apprendre: "souci", decrire: "agapanthe", mesurer: "ammi" },
};

export const NOM_ESPECE: Record<string, string> = {
  gerbera: "gerbera", allium: "allium", gypsophile: "gypsophile",
  souci: "souci", agapanthe: "agapanthe", ammi: "dentelle",
};

// Le siège 1 prend la palette A, le siège 2 la palette B.
export const paletteOf = (seat: 1 | 2): Palette => (seat === 1 ? "a" : "b");

const STADE: Record<number, string> = { 1: "bouton", 2: "mi", 3: "pleine" };

export const especeDe = (palette: Palette, lecon: number) =>
  PALETTES[palette][familleDe(lecon)];

/** L'image d'une fleur : la notion donne l'espèce, la vitesse le stade. */
export function fleurSrc(palette: Palette, lecon: number, quality: 1 | 2 | 3, grande = false) {
  return `/fleurs/${palette}-${especeDe(palette, lecon)}-${STADE[quality]}${grande ? "@2x" : ""}.webp`;
}

/** Les deux plans de fin de partie, un par palette. */
export const videoSrc = (palette: Palette, issue: "victoire" | "defaite") =>
  `/fleurs/${issue}-${palette}.mp4`;

/** Les images que la partie peut afficher, à précharger. */
export function assetsOf(palette: Palette) {
  const out: string[] = [];
  for (const espece of Object.values(PALETTES[palette]))
    for (const s of Object.values(STADE)) out.push(`/fleurs/${palette}-${espece}-${s}.webp`);
  return out;
}
