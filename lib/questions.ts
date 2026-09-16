// Générateur de questions sur les dix notions du cours.
// Chaque question est tirée au sort avec des nombres aléatoires :
// deux joueurs ne voient jamais le même énoncé.

export type Question = {
  notion: string;
  lesson: number;
  text: string;
  data?: string; // valeurs chiffrées, affichées à part de la phrase
  kind: "number" | "choice";
  choices?: string[];
  answer: string; // nombre (en texte) ou index du choix
  explain: string;
};

export type PublicQuestion = Omit<Question, "answer" | "explain">;

const ri = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];
const sign = () => (Math.random() < 0.5 ? -1 : 1);
const nz = (a: number, b: number) => { let v = 0; while (v === 0) v = ri(a, b); return v; };
const vec = (xs: number[]) => `(${xs.map(fmt).join(", ")})`;
const fmt = (n: number) => (n < 0 ? "−" + Math.abs(n) : String(n)).replace(".", ",");
const shuffle = <T,>(xs: T[]) => xs.map(x => [Math.random(), x] as const).sort((a, b) => a[0] - b[0]).map(p => p[1]);

// Polynôme lisible : a·x + b, avec les signes propres.
function lin(a: number, b: number, v = "x") {
  const ax = a === 1 ? v : a === -1 ? "−" + v : `${fmt(a)}${v}`;
  if (b === 0) return ax;
  return `${ax} ${b < 0 ? "−" : "+"} ${Math.abs(b)}`;
}

// Choix multiples : la bonne réponse + des leurres distincts, mélangés.
function mcq(base: Omit<Question, "kind" | "choices" | "answer">, correct: string, lures: string[]): Question {
  const set = Array.from(new Set([correct, ...lures])).slice(0, 4);
  const choices = shuffle(set);
  return { ...base, kind: "choice", choices, answer: String(choices.indexOf(correct)) };
}

// Triplets pythagoriciens : la distance tombe juste.
const TRIPLES_2D = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]];
const TRIPLES_3D = [[1, 2, 2, 3], [2, 3, 6, 7], [4, 4, 7, 9], [1, 4, 8, 9], [2, 6, 9, 11]];

const generators: Array<() => Question> = [
  // Leçon 1 : fonction et argument
  () => {
    const a = nz(-5, 9), b = ri(-9, 9), x = ri(-5, 8);
    return {
      notion: "Fonction et argument", lesson: 1, kind: "number",
      text: `f(x) = ${lin(a, b)}. Que vaut f(${fmt(x)}) ?`,
      answer: String(a * x + b),
      explain: `On remplace x par ${fmt(x)} : ${fmt(a)} × ${fmt(x)} ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${fmt(a * x + b)}.`,
    };
  },
  // Leçon 2 : espace vectoriel, addition
  () => {
    const u = [nz(-6, 6), nz(-6, 6)], v = [nz(-6, 6), nz(-6, 6)];
    const s = [u[0] + v[0], u[1] + v[1]];
    return mcq(
      { notion: "Espace vectoriel", lesson: 2, text: `u = ${vec(u)} et v = ${vec(v)}. Que vaut u + v ?`, explain: `On additionne composante par composante : ${vec(s)}.` },
      vec(s), [vec([u[0] + v[0], u[1] - v[1]]), vec([u[0] * v[0], u[1] * v[1]]), vec([u[0] - v[0], u[1] - v[1]])]
    );
  },
  // Leçon 3 : vecteur de dimension n, multiplication par un nombre
  () => {
    const k = pick([2, 3, -1, -2]), u = [nz(-5, 5), nz(-5, 5), nz(-5, 5)];
    const r = u.map(x => k * x);
    return mcq(
      { notion: "Vecteur de dimension n", lesson: 3, text: `u = ${vec(u)}. Que vaut ${fmt(k)}·u ?`, explain: `Chaque composante est multipliée par ${fmt(k)} : ${vec(r)}.` },
      vec(r), [vec(u.map(x => x + k)), vec([k * u[0], u[1], u[2]]), vec(u.map(x => -k * x))]
    );
  },
  // Leçon 3 bis : la dimension, c'est le nombre de coordonnées
  () => {
    const dims = [
      ["âge, note de maths, note de français, heures de sommeil", 4],
      ["taille, poids", 2],
      ["prix, surface, étage, année, nombre de pièces", 5],
      ["latitude, longitude, altitude", 3],
      ["chaque pixel d'une image de 3 × 3", 9],
    ] as const;
    const d = pick([...dims]);
    return {
      notion: "Vecteur de dimension n", lesson: 3, kind: "number",
      text: `Un objet est décrit par : ${d[0]}. Quelle est la dimension du vecteur ?`,
      answer: String(d[1]),
      explain: `La dimension est le nombre de coordonnées : ${d[1]}.`,
    };
  },
  // Leçon 4 : distance
  () => {
    const in3d = Math.random() < 0.5;
    const t = in3d ? pick(TRIPLES_3D) : pick(TRIPLES_2D);
    const diffs = shuffle(t.slice(0, -1)).map(x => x * sign());
    const A = diffs.map(() => ri(-4, 6));
    const B = A.map((a, i) => a + diffs[i]);
    const d = t[t.length - 1];
    return {
      notion: "Distance", lesson: 4, kind: "number",
      text: `A = ${vec(A)} et B = ${vec(B)}. Quelle est la distance entre A et B ?`,
      answer: String(d),
      explain: `√(${diffs.map(x => `${Math.abs(x)}²`).join(" + ")}) = √${d * d} = ${d}.`,
    };
  },
  // Leçon 5 : norme
  () => {
    const t = Math.random() < 0.5 ? pick(TRIPLES_3D) : pick(TRIPLES_2D);
    const u = shuffle(t.slice(0, -1)).map(x => x * sign());
    const n = t[t.length - 1];
    return {
      notion: "Norme", lesson: 5, kind: "number",
      text: `u = ${vec(u)}. Quelle est la norme de u ?`,
      answer: String(n),
      explain: `‖u‖ = √(${u.map(x => `${Math.abs(x)}²`).join(" + ")}) = √${n * n} = ${n}.`,
    };
  },
  // Leçon 6 : fonction à n variables
  () => {
    const a = nz(-3, 3), b = nz(-5, 5), x = ri(-3, 4), y = ri(-4, 5);
    const val = a * x * x + b * y;
    return {
      notion: "Fonction à n variables", lesson: 6, kind: "number",
      text: `f(x, y) = ${a === 1 ? "" : a === -1 ? "−" : fmt(a)}x² ${b < 0 ? "−" : "+"} ${Math.abs(b)}y. Que vaut f(${fmt(x)}, ${fmt(y)}) ?`,
      answer: String(val),
      explain: `${fmt(a)} × ${x * x} ${b * y < 0 ? "−" : "+"} ${Math.abs(b * y)} = ${fmt(val)}.`,
    };
  },
  // Leçon 7 : dérivée partielle
  () => {
    const a = nz(-3, 3), b = nz(-3, 3), x = ri(-3, 3), y = ri(-3, 3);
    const dfdx = 2 * a * x + b * y;
    return {
      notion: "Gradient", lesson: 7, kind: "number",
      text: `f(x, y) = ${a === 1 ? "" : a === -1 ? "−" : fmt(a)}x² ${b < 0 ? "−" : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}xy. Que vaut ∂f/∂x au point (${fmt(x)}, ${fmt(y)}) ?`,
      answer: String(dfdx),
      explain: `∂f/∂x = ${fmt(2 * a)}x ${b < 0 ? "−" : "+"} ${Math.abs(b)}y, donc ${fmt(2 * a)} × ${fmt(x)} ${b * y < 0 ? "−" : "+"} ${Math.abs(b * y)} = ${fmt(dfdx)}.`,
    };
  },
  // Leçon 7 bis : le gradient, vecteur des dérivées partielles
  () => {
    const a = nz(-2, 2), c = nz(-2, 2), x = nz(-3, 3), y = nz(-3, 3);
    const g = [2 * a * x, 2 * c * y];
    return mcq(
      {
        notion: "Gradient", lesson: 7,
        text: `f(x, y) = ${a === 1 ? "" : a === -1 ? "−" : fmt(a)}x² ${c < 0 ? "−" : "+"} ${Math.abs(c) === 1 ? "" : Math.abs(c)}y². Quel est le gradient de f au point (${fmt(x)}, ${fmt(y)}) ?`,
        explain: `∇f = (${fmt(2 * a)}x, ${fmt(2 * c)}y), évalué au point : ${vec(g)}.`,
      },
      vec(g), [vec([g[1], g[0]]), vec([a * x, c * y]), vec([2 * a * x * x, 2 * c * y * y])]
    );
  },
  // Leçon 8 : extremum
  () => {
    const a = ri(-6, 6), b = ri(-5, 9), askX = Math.random() < 0.5;
    const body = `f(x) = (x ${a < 0 ? "+" : "−"} ${Math.abs(a)})² ${b < 0 ? "−" : "+"} ${Math.abs(b)}`;
    return {
      notion: "Extremum", lesson: 8, kind: "number",
      text: askX ? `${body}. En quel x le minimum est-il atteint ?` : `${body}. Quelle est la valeur minimale de f ?`,
      answer: String(askX ? a : b),
      explain: `Un carré est nul au plus bas, quand x = ${fmt(a)}. La valeur y est ${fmt(b)}.`,
    };
  },
  // Leçon 9 : une étape de descente de gradient
  () => {
    const x0 = pick([4, 6, 8, 10, 12]), eta = pick([0.25, 0.5, 0.1]);
    const x1 = Math.round((x0 - eta * 2 * x0) * 1000) / 1000;
    return {
      notion: "Minimisation", lesson: 9, kind: "number",
      text: `On minimise f(x) = x² par descente de gradient, pas η = ${fmt(eta)}, départ x = ${x0}. Après une étape, x vaut ?`,
      answer: String(x1),
      explain: `x ← x − η·f′(x) = ${x0} − ${fmt(eta)} × ${2 * x0} = ${fmt(x1)}.`,
    };
  },
  // Leçon 9 bis : minimiser une distance = trouver le plus proche
  () => {
    const P = [ri(0, 10), ri(0, 10)];
    const cands = [0, 1, 2].map(() => [ri(0, 10), ri(0, 10)]);
    const d2 = cands.map(c => (c[0] - P[0]) ** 2 + (c[1] - P[1]) ** 2);
    const min = Math.min(...d2);
    if (d2.filter(d => d === min).length > 1) return generators[11]();
    const best = d2.indexOf(min);
    return mcq(
      { notion: "Minimisation", lesson: 9, text: `Lequel de ces points est le plus proche de P = ${vec(P)} ?`, data: cands.map((c, i) => `${"ABC"[i]} = ${vec(c)}`).join("    "), explain: `Distances au carré : ${d2.join(", ")}. Le plus petit est ${"ABC"[best]}.` },
      "ABC"[best], ["A", "B", "C"].filter(l => l !== "ABC"[best])
    );
  },
  // Leçon 10 : l'outlier
  () => {
    const center = ri(8, 15);
    const xs = [0, 1, 2, 3].map(() => center + ri(-2, 2));
    const out = center + pick([-9, -8, 9, 10, 12]) ;
    const all = shuffle([...xs, out]);
    return mcq(
      { notion: "Partition, clusters, outliers", lesson: 10, text: "Laquelle de ces notes est l'outlier ?", data: all.join("   "), explain: `Toutes les notes se tiennent autour de ${center}, sauf ${out}, loin du groupe.` },
      String(out), Array.from(new Set(xs)).map(String)
    );
  },
  // Leçon 10 bis : compter les groupes naturels
  () => {
    const k = pick([2, 3]);
    const centers = k === 2 ? [ri(1, 5), ri(20, 30)] : [ri(1, 5), ri(20, 30), ri(50, 60)];
    const pts = centers.flatMap(c => [c, c + 1, c + 2]);
    return {
      notion: "Partition, clusters, outliers", lesson: 10, kind: "number",
      text: "Combien de groupes naturels (clusters) voyez-vous ?",
      data: shuffle(pts).join("   "),
      answer: String(k),
      explain: `Les valeurs se regroupent autour de ${centers.join(", ")} : ${k} clusters.`,
    };
  },
];

export function randomQuestion(): Question {
  return pick(generators)();
}

export function toPublic(q: Question): PublicQuestion {
  const { answer: _a, explain: _e, ...rest } = q;
  return rest;
}

// Vérification : nombre avec virgule ou point acceptés, ou index du choix.
export function isCorrect(q: Question, given: string): boolean {
  if (q.kind === "choice") return given === q.answer;
  const norm = (s: string) => s.replace(/\s/g, "").replace(",", ".").replace("−", "-");
  const g = Number(norm(given));
  if (Number.isNaN(g)) return false;
  return Math.abs(g - Number(q.answer)) < 1e-6;
}
