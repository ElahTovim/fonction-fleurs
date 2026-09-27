// Les questions de sens : une par notion, à répondre de tête.
//
// Les questions chiffrées vérifient qu'on sait calculer. Elles ne vérifient
// jamais qu'on a compris ce que la notion devient dans un modèle, alors que
// c'est exactement ce que « Les bases » enseigne. Ces dix-là comblent ce trou.
//
// Chaque notion a un énoncé stable et un vivier : une bonne réponse tirée
// parmi plusieurs, trois leurres tirés parmi d'autres. L'énoncé revient,
// jamais la même grille de choix.

export type Sens = {
  lesson: number;
  notion: string;
  text: string;
  bonnes: string[];
  leurres: string[];
  explain: string;
};

export const SENS: Sens[] = [
  {
    lesson: 1,
    notion: "Fonction et argument",
    text: "Dans un modèle, lequel de ces éléments est l'argument ?",
    bonnes: [
      "la photo qu'on lui donne à classer",
      "la surface et l'étage de l'appartement",
      "le texte soumis au modèle",
    ],
    leurres: [
      "la probabilité que ce soit un chat",
      "le prix prédit",
      "l'erreur mesurée à la fin",
      "le mot suivant qu'il propose",
    ],
    explain: "L'argument est ce qui entre. Ce qui sort est l'image, c'est-à-dire la prédiction.",
  },
  {
    lesson: 2,
    notion: "Espace vectoriel",
    text: "Dans lequel de ces cas l'addition a-t-elle un sens ?",
    bonnes: [
      "deux images, dont on fait la moyenne pixel par pixel",
      "deux relevés de capteurs, additionnés case par case",
      "deux vecteurs de mots, dont on prend le milieu",
    ],
    leurres: [
      "deux codes postaux",
      "deux numéros de client",
      "deux identifiants de produit",
      "deux numéros de téléphone",
    ],
    explain: "Un espace vectoriel demande que l'addition veuille dire quelque chose. Un identifiant est une étiquette, pas une quantité : l'additionner ne produit rien.",
  },
  {
    lesson: 3,
    notion: "Vecteur de dimension n",
    text: "Laquelle de ces données est déjà un vecteur de dimension n ?",
    bonnes: [
      "les 784 niveaux de gris d'une image 28 × 28",
      "les trois valeurs rouge, vert, bleu d'un pixel",
      "les douze relevés mensuels d'un capteur",
    ],
    leurres: [
      "la phrase « le chat dort »",
      "le nom du client",
      "l'étiquette « chien »",
      "le fichier image tel quel",
    ],
    explain: "Un vecteur de dimension n est une liste ordonnée de n nombres. Tout le travail d'un modèle commence par mettre les données sous cette forme.",
  },
  {
    lesson: 4,
    notion: "Distance en dimension n",
    text: "À quoi sert une distance dans un modèle ?",
    bonnes: [
      "à savoir si deux visages se ressemblent",
      "à mesurer l'écart entre la prédiction et la réalité",
      "à trouver les articles les plus proches d'un autre",
    ],
    leurres: [
      "à compter le nombre de données",
      "à choisir le nombre de couches du réseau",
      "à trier les données par ordre alphabétique",
      "à accélérer le calcul",
    ],
    explain: "La distance est ce qui rend « se ressembler » calculable. Sans elle, ni recommandation, ni reconnaissance, ni mesure d'erreur.",
  },
  {
    lesson: 5,
    notion: "Norme",
    text: "Que fait-on avec la norme d'un vecteur ?",
    bonnes: [
      "on mesure son intensité, quelle que soit sa direction",
      "on ramène tous les vecteurs à la même échelle",
      "on pénalise des paramètres devenus trop grands",
    ],
    leurres: [
      "on compte ses dimensions",
      "on trie ses composantes",
      "on lit son signe",
      "on compte le nombre de données",
    ],
    explain: "La norme est une longueur : un seul nombre pour toute la liste. C'est ce qui permet de normaliser, et de dire qu'un paramètre est devenu trop gros.",
  },
  {
    lesson: 6,
    notion: "Fonction à n variables",
    text: "Pendant l'entraînement, qu'est-ce qui joue le rôle des variables ?",
    bonnes: [
      "les paramètres du modèle, qu'on règle un par un",
      "les poids du réseau",
      "les coefficients que l'on cherche",
    ],
    leurres: [
      "les images du jeu de données",
      "le nombre de passages sur les données",
      "les classes à prédire",
      "la puissance de la machine",
    ],
    explain: "L'erreur est une fonction des paramètres, pas des données : ce sont eux qu'on fait bouger. Les données, elles, restent fixes.",
  },
  {
    lesson: 7,
    notion: "Gradient",
    text: "Que donne le gradient de l'erreur ?",
    bonnes: [
      "la direction dans laquelle l'erreur monte le plus vite",
      "de combien l'erreur bouge si l'on bouge chaque paramètre",
      "la pente du relief, sous le point où l'on est",
    ],
    leurres: [
      "la valeur de l'erreur",
      "le nombre de paramètres du modèle",
      "la bonne réponse attendue",
      "le nombre de pas qu'il reste à faire",
    ],
    explain: "Le gradient est une direction, pas une valeur. On avance dans le sens inverse : c'est la descente de gradient.",
  },
  {
    lesson: 8,
    notion: "Extremum local et global",
    text: "Qu'est-ce qu'un minimum local pour un modèle ?",
    bonnes: [
      "un creux qu'aucun petit pas n'améliore, sans être le meilleur",
      "un réglage dont on ne sort pas, alors qu'il existe mieux ailleurs",
    ],
    leurres: [
      "le point où l'erreur est nulle",
      "le meilleur modèle possible",
      "le premier réglage tiré au hasard",
      "le point où la pente est la plus forte",
    ],
    explain: "La descente s'arrête dès que la pente est nulle, sans savoir si le fond du relief est ailleurs. D'où les relances et les pas aléatoires.",
  },
  {
    lesson: 9,
    notion: "Minimiser une distance",
    text: "Qu'est-ce qu'« apprendre », pour un modèle ?",
    bonnes: [
      "régler ses paramètres pour rapprocher ses prédictions du réel",
      "faire descendre la distance entre ce qu'il prédit et ce qui est vrai",
    ],
    leurres: [
      "mémoriser toutes les données d'entraînement",
      "augmenter son nombre de paramètres",
      "classer les données par ordre d'arrivée",
      "choisir la bonne architecture",
    ],
    explain: "Apprendre n'a rien de mystérieux : c'est minimiser une distance. Tout le reste, architecture comprise, ne fait que servir cette descente.",
  },
  {
    lesson: 10,
    notion: "Partition, clusterisation, outliers",
    text: "Laquelle de ces situations est une clusterisation ?",
    bonnes: [
      "regrouper des clients qui se ressemblent, sans étiquette donnée",
      "trouver des familles d'articles que personne n'a nommées",
      "découvrir des groupes dans des données non étiquetées",
    ],
    leurres: [
      "reconnaître un chat à partir de photos étiquetées",
      "prédire un prix à partir d'exemples de prix",
      "trier les données par date",
      "compléter la phrase suivante",
    ],
    explain: "Clusteriser, c'est faire une partition sans étiquettes : les groupes ne sont pas donnés, ils sont trouvés. Avec des étiquettes, on est dans la classification.",
  },
];
