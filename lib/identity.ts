"use client";
// Identité sans compte : un jeton tiré au sort, rangé dans le navigateur du téléphone.
// On sait quel APPAREIL agit, pas quelle personne. Le jeu est conçu pour que ça suffise.
const T = "fleurs.token", N = "fleurs.name";

export function getToken(): string {
  try {
    let t = localStorage.getItem(T);
    if (!t) { t = crypto.randomUUID(); localStorage.setItem(T, t); }
    return t;
  } catch { return "anon-" + Math.random().toString(36).slice(2); }
}
export function getName(): string { try { return localStorage.getItem(N) ?? ""; } catch { return ""; } }
export function setName(n: string) { try { localStorage.setItem(N, n); } catch {} }

// La dernière partie ouverte sur cet appareil. Sans elle, le lien « accueil »
// serait un piège : on sort du jeu et on ne sait plus par où y revenir.
const P = "fleurs.partie";
export function setLastGame(code: string | null) {
  try { code ? localStorage.setItem(P, code) : localStorage.removeItem(P); } catch {}
}
export function getLastGame(): string { try { return localStorage.getItem(P) ?? ""; } catch { return ""; } }
