// La couche séminaire : pour chaque notion, ce qu'elle devient dans un
// système d'IA, puis un cas concret. Ce fichier est écrit à la main et ne
// vient PAS de cours.html : relancer outils/lecons.py ne l'efface pas.

export type Eclairage = {
  n: number;
  role: string;                                   // en quoi c'est de l'IA
  cas: { titre: string; texte: string[] };        // un cas concret
};

export const ECLAIRAGES: Eclairage[] = [
  {
    n: 1,
    role: "Un modèle d'IA n'est rien d'autre qu'une fonction. Elle prend un argument, du texte, une image, une ligne de tableau, et elle rend une sortie. Ce qu'on appelle « le modèle », ce sont les coefficients de cette fonction, réglés sur des données au lieu d'être posés à la main. Tout le vocabulaire qui suit ne fait que décrire cette fonction et la façon de la régler.",
    cas: {
      titre: "Le filtre à courrier indésirable",
      texte: [
        "Un filtre anti-spam est une fonction f qui prend le texte d'un message et rend un nombre entre 0 et 1, la probabilité que ce soit du spam. Au dessus d'un seuil, disons 0,9, le message part dans le dossier indésirables.",
        "La forme est exactement celle de ton f(x) de Terminale. Deux choses seulement changent. L'argument n'est pas un nombre mais un texte. Et f ne tient pas sur une ligne : elle a des milliers de coefficients, qui n'ont pas été choisis mais appris sur des millions de messages déjà triés.",
      ],
    },
  },
  {
    n: 2,
    role: "Pour qu'une machine calcule sur des mots, des images ou des personnes, il faut d'abord les transformer en points d'un espace où l'addition a un sens. C'est ce qu'on appelle un plongement, ou embedding en anglais. Une fois le plongement fait, tout l'outillage de l'algèbre devient disponible sur des objets qui n'étaient pas des nombres.",
    cas: {
      titre: "Chercher par le sens, pas par les mots",
      texte: [
        "Tu interroges une base de documents. L'ancienne méthode cherchait tes mots exacts, si bien que « résiliation » ne trouvait pas un document qui dit « mettre fin au contrat ». La méthode actuelle transforme chaque document en vecteur, transforme ta question en vecteur, et rend les documents dont le vecteur est le plus proche.",
        "C'est le mécanisme derrière tout ce qu'on appelle RAG, quand on fait répondre un modèle à partir de documents maison. La démonstration historique de cette idée, menée sur des mots, est restée célèbre : le vecteur de « roi », moins celui de « homme », plus celui de « femme », tombe tout près de celui de « reine ».",
      ],
    },
  },
  {
    n: 3,
    role: "La dimension, c'est le nombre de descripteurs que le modèle reçoit. Ce qui n'est pas dans le vecteur n'existe pas pour lui. Choisir les coordonnées, c'est donc décider ce que la machine a le droit de voir, et c'est la décision la plus lourde de conséquences de tout le projet.",
    cas: {
      titre: "Ce qu'un modèle voit d'un élève",
      texte: [
        "Prends un modèle qui estime un risque de décrochage. On lui donne un vecteur par élève : moyenne par matière, assiduité, temps de trajet, ancienneté dans l'établissement. Douze nombres, donc un vecteur de dimension 12.",
        "Si la qualité du sommeil n'est pas dans le vecteur, le modèle ne pourra jamais l'invoquer, même si c'est la vraie cause. Et si l'on y met le code postal, il apprendra sans le dire une géographie sociale. Pour situer les ordres de grandeur ailleurs : un plongement de texte courant fait 1 536 nombres, une image de 224 sur 224 en couleur en fait 150 528.",
      ],
    },
  },
  {
    n: 4,
    role: "En IA on ne demande presque jamais « est-ce le même ? », on demande « à quelle distance ? ». Reconnaître un visage, recommander un produit, repérer un doublon, retrouver un document : tout se ramène à mesurer un écart entre deux vecteurs et à le comparer à un seuil.",
    cas: {
      titre: "Le déverrouillage par le visage",
      texte: [
        "Ton téléphone ne conserve pas une photo de ton visage, il conserve un vecteur. Quand tu le regardes, il fabrique un nouveau vecteur et calcule la distance avec celui qui est enregistré. Sous un certain seuil, il ouvre.",
        "Tout le réglage tient dans ce seuil. Trop serré, l'appareil te refuse le matin, mal réveillée. Trop lâche, il s'ouvre pour quelqu'un qui te ressemble. Ce n'est pas une question mathématique mais un arbitrage entre deux gênes, et c'est un humain qui le tranche.",
      ],
    },
  },
  {
    n: 5,
    role: "La norme sert deux fois. D'abord pour comparer honnêtement : on ramène chaque vecteur à une longueur de 1, ce qui revient à comparer des directions plutôt que des tailles. Ensuite comme garde-fou pendant l'apprentissage, où l'on pénalise les coefficients devenus trop grands pour empêcher le modèle d'apprendre ses exemples par cœur.",
    cas: {
      titre: "Le long document qui gagne toujours",
      texte: [
        "Tu compares un article de trois pages et un paragraphe de cinq lignes, sur le même sujet. Sans précaution, l'article ressort systématiquement comme le plus proche de la requête. Non parce qu'il répond mieux, mais parce que son vecteur est plus long.",
        "La correction tient en une division : chaque vecteur est ramené à une longueur de 1. On ne compare plus des quantités de texte mais des orientations. C'est ce qu'on appelle la similarité cosinus, qui n'est rien d'autre que l'angle entre deux directions.",
      ],
    },
  },
  {
    n: 6,
    role: "L'erreur d'un modèle est une fonction de tous ses paramètres à la fois. Ce n'est plus une courbe mais un relief, et le nombre de directions dans lesquelles on peut s'y déplacer est le nombre de paramètres. C'est ce relief que l'entraînement parcourt.",
    cas: {
      titre: "Un relief à soixante-dix milliards de directions",
      texte: [
        "Llama 3, dans sa version à soixante-dix milliards de paramètres, définit une erreur qui est donc une fonction de soixante-dix milliards de variables. Aucune intuition visuelle ne tient à cette échelle.",
        "C'est exactement pour cela que les mathématiques servent ici. Les règles valables pour un relief à deux variables, celui que tu peux dessiner, valent identiquement à soixante-dix milliards. Le gradient de la leçon suivante est le même objet dans les deux cas, et se calcule de la même façon.",
      ],
    },
  },
  {
    n: 7,
    role: "Le cours vient de te donner le mécanisme. Ce qu'il faut en retenir pour le séminaire, c'est sa conséquence économique. Un modèle ne progresse qu'en repassant ce calcul sur la totalité de ses paramètres, des centaines de milliers de fois. L'entraînement coûte donc très cher, tandis qu'une fois le modèle figé, une réponse ne coûte presque rien. Ce déséquilibre explique à peu près toute l'organisation du secteur : qui entraîne, qui se contente d'appeler une interface, et pourquoi.",
    cas: {
      titre: "Ce qui se passe pendant qu'un modèle s'entraîne",
      texte: [
        "Le modèle reçoit un lot d'exemples, disons trente-deux phrases. Il prédit, il compare à la vérité, il obtient un nombre : son erreur sur ce lot. Puis il calcule, pour chacun de ses paramètres, de combien cette erreur bougerait si ce paramètre bougeait d'un cheveu. C'est le gradient.",
        "Il corrige alors tous ses paramètres d'un petit pas en sens inverse, prend le lot suivant, et recommence. Des centaines de milliers de fois. Quand on lit qu'un entraînement a coûté des semaines de calcul, c'est cette boucle qui a tourné.",
      ],
    },
  },
  {
    n: 8,
    role: "Le relief de l'erreur n'a pas un creux mais une multitude. La descente s'arrête dans le premier où elle tombe, qui n'est pas forcément le plus profond. Tout ce qui ressemble à du hasard dans un entraînement, l'ordre des exemples, le tirage initial des paramètres, sert en partie à ne pas s'y laisser piéger.",
    cas: {
      titre: "Deux entraînements, deux modèles",
      texte: [
        "Lance deux fois le même entraînement, sur les mêmes données, avec le même code. Tu obtiens deux modèles différents, qui ne se trompent pas sur les mêmes exemples. Ils ne sont pas tombés dans le même creux.",
        "C'est pour cela qu'on entraîne plusieurs fois et qu'on garde le meilleur. Et c'est pour cela que la phrase « le modèle a été entraîné » ne désigne pas un résultat unique : il faut dire lequel, et le figer.",
      ],
    },
  },
  {
    n: 9,
    role: "Apprendre, dans toute cette affaire, veut dire une seule chose : rendre aussi petite que possible la distance entre ce que le modèle prédit et ce qui est vrai. Cette distance porte un nom, la fonction de perte. La choisir, c'est décider ce que le modèle apprendra.",
    cas: {
      titre: "Mille copies pour apprendre à noter",
      texte: [
        "On donne à un modèle mille copies déjà notées par des professeurs. Pour chacune il propose une note, mesure l'écart avec la note réelle, et corrige ses coefficients pour réduire l'écart moyen sur l'ensemble.",
        "Le choix de la mesure d'écart change le correcteur obtenu. Avec l'écart au carré, une erreur de quatre points pèse seize fois une erreur d'un point, et le modèle devient obsédé par ses grosses fautes. Avec l'écart simple, il les traite proportionnellement. Les mêmes copies donnent alors deux correcteurs différents.",
      ],
    },
  },
  {
    n: 10,
    role: "Jusqu'ici quelqu'un fournissait les bonnes réponses. Ici personne n'en fournit, et la machine se contente de regrouper ce qui est proche : c'est l'apprentissage non supervisé. Elle produit des groupes, elle ne les nomme pas. Les nommer reste un travail humain, et c'est là que se joue l'essentiel.",
    cas: {
      titre: "Chercher ce qui ne ressemble à rien",
      texte: [
        "La détection de fraude bancaire ne cherche pas « une fraude », car la prochaine ne ressemblera pas aux précédentes. Elle décrit chaque opération par un vecteur, montant, heure, lieu, habitudes du compte, et signale celles qui tombent loin de tous les groupes. On cherche l'outlier, pas le motif connu.",
        "Le même procédé sert à segmenter une clientèle sans savoir d'avance quels segments existent. L'algorithme rend trois groupes ; il ne dit pas que le premier réunit les familles qui s'en vont après un trimestre. Ce nom là, personne ne peut le trouver à ta place.",
      ],
    },
  },
];

export const eclairage = (n: number) => ECLAIRAGES.find((e) => e.n === n);

/** Le fil rouge du cours : une phrase qui contient les dix notions. */
export const FIL_ROUGE =
  "Un modèle d'IA est une **fonction** qui prend en argument un **vecteur de dimension n** (les données, plongées dans un **espace vectoriel**) et renvoie une prédiction. L'entraîner, c'est régler ses paramètres pour **minimiser la distance** entre ses prédictions et la réalité. Cette erreur est une **fonction à n variables** ; on descend vers son **minimum** en suivant le **gradient**. Et quand personne ne nous a donné les bonnes réponses, on regroupe les données proches : c'est une **partition**, avec ses **outliers**.";
