// Règles du jeu, partagées par l'arbitre (serveur) et l'affichage (téléphone).

export const BOUQUET_SIZE = 5;

// Trois qualités de fleur selon la vitesse (chrono serveur).
export const SPEED_TIERS_MS = { epanouie: 20_000, fleur: 45_000 } as const;
export function qualityFor(elapsedMs: number): 1 | 2 | 3 {
  if (elapsedMs <= SPEED_TIERS_MS.epanouie) return 3;
  if (elapsedMs <= SPEED_TIERS_MS.fleur) return 2;
  return 1;
}
export const QUALITY_LABEL: Record<number, string> = { 3: "fleur épanouie", 2: "fleur", 1: "bouton" };
// Le bouton est masculin, les fleurs féminines : la forme avec article évite « une bouton ».
export const QUALITY_ARTICLED: Record<number, string> = { 3: "une fleur épanouie", 2: "une fleur", 1: "un bouton" };

// Robot. Le temps de réflexion affiché reste court : personne n'a envie de
// regarder un écran vide. Le niveau se joue donc sur deux autres leviers,
// la justesse et la qualité de la fleur obtenue, tirée dans `quality`.
export const BOT = {
  1: { name: "Robot Tortue", think: [2200, 4500], accuracy: 0.55, quality: [1, 1, 1, 2, 2, 3] },
  2: { name: "Robot Lièvre", think: [1800, 3800], accuracy: 0.78, quality: [1, 2, 2, 2, 3, 3] },
  3: { name: "Robot Fusée", think: [1200, 2800], accuracy: 0.93, quality: [2, 3, 3, 3, 3] },
} as const;
export type BotLevel = keyof typeof BOT;

export function botDraw(level: BotLevel) {
  const b = BOT[level];
  const think = b.think[0] + Math.floor(Math.random() * (b.think[1] - b.think[0]));
  const correct = Math.random() < b.accuracy;
  const quality = b.quality[Math.floor(Math.random() * b.quality.length)] as 1 | 2 | 3;
  return { think, correct, quality };
}

export type Game = {
  code: string;
  status: "lobby" | "playing" | "finished";
  mode: "duo" | "solo";
  bot_level: BotLevel | null;
  bouquet_size: number;
  p1_name: string | null;
  p2_name: string | null;
  p1_flowers: number[];
  p2_flowers: number[];
  turn_seat: 1 | 2;
  round: number;
  question_public: { notion: string; lesson: number; text: string; data?: string; kind: "number" | "choice"; choices?: string[] } | null;
  bot_due_at: string | null;
  bot_delay_ms: number | null;
  last_event: string | null;
  winner_seat: number | null;
  updated_at: string;
};

export const beauty = (flowers: number[]) => flowers.reduce((s, q) => s + q, 0);

// Fin de manche : appelée seulement après le tour du siège 2,
// pour que les deux joueurs aient eu le même nombre d'essais.
export function settleRound(g: Pick<Game, "p1_flowers" | "p2_flowers" | "bouquet_size">): { finished: boolean; winner: 0 | 1 | 2 } {
  const n1 = g.p1_flowers.length, n2 = g.p2_flowers.length;
  if (n1 < g.bouquet_size && n2 < g.bouquet_size) return { finished: false, winner: 0 };
  if (n1 !== n2) return { finished: true, winner: n1 > n2 ? 1 : 2 };
  const b1 = beauty(g.p1_flowers), b2 = beauty(g.p2_flowers);
  return { finished: true, winner: b1 === b2 ? 0 : b1 > b2 ? 1 : 2 };
}

export function makeCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 5 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}
