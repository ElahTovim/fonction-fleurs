// Les dix notions se rangent en trois familles, et c'est la famille qui
// décide de l'espèce de la fleur gagnée. Un bouquet se lit donc d'un coup
// d'œil : beaucoup de grandes fleurs, vous tenez l'apprentissage ; pas une
// seule dentelle, vous n'avez jamais réussi une question de mesure.
//
// Trois familles, donc trois espèces par palette, ce qui est exactement la
// façon dont un fleuriste compose : une fleur dominante, une secondaire,
// une légère qui lie l'ensemble. La composition reste harmonieuse quelle
// que soit la partie, là où dix espèces auraient donné un nuancier.

export type Famille = "apprendre" | "decrire" | "mesurer";

export const FAMILLE_DE: Record<number, Famille> = {
  1: "decrire",   // fonction et argument
  2: "decrire",   // espace vectoriel
  3: "decrire",   // vecteur de dimension n
  4: "mesurer",   // distance
  5: "mesurer",   // norme
  6: "apprendre", // fonction à n variables
  7: "apprendre", // gradient
  8: "apprendre", // extremum
  9: "apprendre", // minimiser une distance
  10: "mesurer",  // partition, clusterisation, outliers
};

export const FAMILLES: Record<Famille, { nom: string; quoi: string }> = {
  apprendre: { nom: "Apprendre", quoi: "le relief de l'erreur et la descente" },
  decrire: { nom: "Décrire", quoi: "mettre les données en nombres" },
  mesurer: { nom: "Mesurer", quoi: "comparer, et regrouper ce qui se ressemble" },
};

export const familleDe = (lecon: number): Famille => FAMILLE_DE[lecon] ?? "apprendre";
