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
