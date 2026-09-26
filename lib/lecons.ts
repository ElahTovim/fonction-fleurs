// Les dix notions du cours, extraites de perso/seminaire-ia-maths/cours.html
// par outils/lecons.py. Le jeu y renvoie depuis « Les bases » et depuis un
// verdict raté, pour qu'on puisse réviser la notion qu'on vient de manquer.

export type Bloc =
  | { t: "titre"; c: string }
  | { t: "para"; c: string }
  | { t: "formule"; c: string }
  | { t: "liste"; items: string[] };

export type Lecon = { n: number; titre: string; sous: string; blocs: Bloc[] };

export const LECONS: Lecon[] = [
  {
    "n": 1,
    "titre": "Fonction et argument",
    "sous": "une machine à transformer",
    "blocs": [
      {
        "t": "titre",
        "c": "Ce que tu sais déjà"
      },
      {
        "t": "para",
        "c": "En Terminale, une fonction c'était f(x) = 3x + 2 : tu mets un nombre, il en ressort un autre, et tu traces la courbe. Le nombre que tu mets entre parenthèses s'appelle **l'argument**. Le nombre qui sort s'appelle **l'image**. f(4) = 14 : 4 est l'argument, 14 est l'image."
      },
      {
        "t": "titre",
        "c": "L'idée neuve"
      },
      {
        "t": "para",
        "c": "Une fonction n'est pas obligée de prendre un nombre et de rendre un nombre. C'est n'importe quelle règle qui associe à chaque entrée une sortie, et une seule. L'entrée peut être :"
      },
      {
        "t": "liste",
        "items": [
          "un nombre : f(x) = x²",
          "deux nombres : f(x, y) = x² + y, ici il y a deux arguments",
          "une liste de 784 nombres (une image de 28 × 28 pixels), avec en sortie 10 nombres (la probabilité que ce soit un 0, un 1, … un 9)",
          "un texte, avec en sortie le mot suivant le plus probable"
        ]
      },
      {
        "t": "para",
        "c": "On note f : E → F pour dire « f prend ses arguments dans E et renvoie ses images dans F ». Pour la fonction du lycée, E et F sont l'ensemble des réels, noté ℝ."
      },
      {
        "t": "titre",
        "c": "Argument et paramètre : deux choses différentes"
      },
      {
        "t": "para",
        "c": "Prends f(x) = a·x + b. Le **x** est l'argument : c'est ce qui varie quand tu utilises la fonction. Les **a** et **b** sont des **paramètres** : des réglages, fixés avant usage. En IA, on inverse le point de vue. Les données x sont fixées (on les a), et ce sont les paramètres qu'on fait bouger pour que la fonction donne les bonnes réponses. Un « grand modèle de langage » a des centaines de milliards de paramètres a, b, c… et une seule règle de calcul."
      },
      {
        "t": "titre",
        "c": "Composer des fonctions"
      },
      {
        "t": "para",
        "c": "On peut enchaîner : d'abord f, puis g sur le résultat. On note g(f(x)). Un réseau de neurones, c'est exactement ça : une pile de fonctions simples appliquées les unes après les autres. Chaque « couche » est une fonction, le réseau est la composition de toutes les couches."
      },
      {
        "t": "para",
        "c": "Quand on dit « le modèle prédit », on dit « on évalue une fonction en un argument ». Quand on dit « on entraîne le modèle », on dit « on cherche les paramètres ». Tout le vocabulaire du séminaire se ramène à cette distinction argument / paramètre."
      },
      {
        "t": "para",
        "c": "« Argument » n'a rien à voir avec un raisonnement. C'est simplement l'entrée. Et une fonction rend une seule sortie par entrée : si le même x peut donner deux résultats, ce n'est pas une fonction."
      },
      {
        "t": "para",
        "c": "Soit f(x, y) = x² + y. Calcule f(2, 3). Puis, avec g(t) = 2t, calcule g(f(2, 3))."
      },
      {
        "t": "para",
        "c": "Réponse : f(2, 3) = 4 + 3 = 7. Puis g(7) = 14. Deux arguments pour f, un seul pour g, et la composition enchaîne les deux."
      }
    ]
  },
  {
    "n": 2,
    "titre": "Espace vectoriel",
    "sous": "un monde où l'on peut additionner",
    "blocs": [
      {
        "t": "titre",
        "c": "Ce que tu sais déjà"
      },
      {
        "t": "para",
        "c": "Presque rien, et c'est normal : les vecteurs étaient au programme de S, pas de ES. Tu connais en revanche les coordonnées d'un point dans un repère, (x ; y), et c'est le seul prérequis."
      },
      {
        "t": "titre",
        "c": "L'idée neuve, en deux temps"
      },
      {
        "t": "para",
        "c": "**Un vecteur**, pour l'instant, c'est une flèche dans le plan, décrite par ses coordonnées : u = (1, 2) veut dire « 1 vers la droite, 2 vers le haut ». Ce qui compte, ce n'est pas d'où part la flèche, c'est son déplacement."
      },
      {
        "t": "para",
        "c": "Sur ces flèches on sait faire exactement deux opérations :"
      },
      {
        "t": "liste",
        "items": [
          "**Additionner** deux vecteurs, coordonnée par coordonnée : (1, 2) + (3, −1) = (4, 1). Géométriquement, on met les flèches bout à bout.",
          "**Multiplier** un vecteur par un nombre (on dit un scalaire) : 2 × (1, 2) = (2, 4). La flèche est étirée, ou retournée si le nombre est négatif."
        ]
      },
      {
        "t": "para",
        "c": "**Un espace vectoriel**, c'est un ensemble d'objets sur lesquels ces deux opérations existent et ne font jamais sortir de l'ensemble. Le plan est un espace vectoriel. L'espace à trois dimensions aussi. Mais aussi, et c'est le point important : les listes de n nombres, les images (additionner deux images pixel par pixel donne une image), les sons, les fonctions."
      },
      {
        "t": "para",
        "c": "u = (1, 2)\n \n v = (3, −1)\n \n u + v = (4, 1)\n \n \n \n u\n 1,5 × u\n \n \n Les deux seules opérations d'un espace vectoriel : mettre bout à bout, et étirer."
      },
      {
        "t": "titre",
        "c": "Combinaison linéaire, base, dimension"
      },
      {
        "t": "para",
        "c": "Mélanger les deux opérations donne une **combinaison linéaire** : 2u + 3v. Dans le plan, avec seulement deux flèches bien choisies (par exemple (1, 0) et (0, 1)), on fabrique toutes les autres par combinaison linéaire. Ces deux flèches forment une **base**, et le nombre de vecteurs de la base est la **dimension** : 2 pour le plan, 3 pour l'espace, n en général."
      },
      {
        "t": "para",
        "c": "Un modèle ne sait manipuler que des vecteurs. La première chose qu'on fait avec un mot, une image ou un client, c'est le plonger dans un espace vectoriel (en anglais : embedding). Le célèbre « roi − homme + femme ≈ reine » n'a de sens que parce que les mots sont devenus des vecteurs qu'on peut additionner et soustraire."
      },
      {
        "t": "para",
        "c": "u = (1, 2), v = (3, −1). Calcule 2u + v."
      },
      {
        "t": "para",
        "c": "Réponse : 2u = (2, 4), puis (2, 4) + (3, −1) = (5, 3)."
      }
    ]
  },
  {
    "n": 3,
    "titre": "Vecteur de dimension n",
    "sous": "une liste de n nombres",
    "blocs": [
      {
        "t": "titre",
        "c": "Ce que tu sais déjà"
      },
      {
        "t": "para",
        "c": "Un point du plan a deux coordonnées. Un point de l'espace en a trois. Tu as aussi déjà rempli des tableaux à colonnes : un client par ligne, une caractéristique par colonne."
      },
      {
        "t": "titre",
        "c": "L'idée neuve"
      },
      {
        "t": "para",
        "c": "Un **vecteur de dimension n** est simplement une liste ordonnée de n nombres : x = (x₁, x₂, …, xₙ). Chaque case est une coordonnée, et en IA on dit plutôt une caractéristique (en anglais feature). La dimension, c'est le nombre de cases."
      },
      {
        "t": "para",
        "c": "Au-delà de 3, on ne peut plus dessiner. Ce n'est pas grave : **toutes les opérations se font case par case**, exactement comme en dimension 2. Le bon réflexe mental : « c'est comme dans le plan, mais avec plus de cases »."
      },
      {
        "t": "titre",
        "c": "Une opération de plus : le produit scalaire"
      },
      {
        "t": "para",
        "c": "On multiplie les cases deux à deux et on additionne le tout :"
      },
      {
        "t": "formule",
        "c": "u · v = u₁v₁ + u₂v₂ + … + uₙvₙ"
      },
      {
        "t": "para",
        "c": "Le résultat est un nombre, pas un vecteur. Il mesure l'accord entre u et v : grand et positif si les deux vecteurs « vont dans le même sens », nul s'ils sont perpendiculaires, négatif s'ils s'opposent. C'est l'outil de base pour comparer deux vecteurs, et c'est ce que fait un neurone : un produit scalaire entre l'entrée et ses poids."
      },
      {
        "t": "titre",
        "c": "Et les matrices ?"
      },
      {
        "t": "para",
        "c": "Une matrice est un tableau de nombres qui transforme un vecteur en un autre vecteur (éventuellement d'une autre dimension). Une couche de réseau de neurones = « multiplier par une matrice, puis appliquer une petite fonction case par case ». Tu n'as pas besoin de savoir calculer un produit de matrices pour le séminaire ; retiens que matrice = transformation linéaire."
      },
      {
        "t": "para",
        "c": "Toute donnée devient un vecteur de dimension n avant d'entrer dans un modèle. Le choix des cases (quelles caractéristiques ?) s'appelle la représentation, et c'est souvent là que se joue la qualité d'un projet, bien avant l'algorithme."
      },
      {
        "t": "para",
        "c": "En très grande dimension, l'intuition du plan trahit : presque tous les points sont « loin » de tous les autres, et le volume se concentre aux bords. C'est pour cela qu'on cherche souvent à réduire la dimension avant de calculer des distances."
      },
      {
        "t": "para",
        "c": "u = (1, 0, 2, 1) et v = (2, 1, 0, 3). Calcule u · v."
      },
      {
        "t": "para",
        "c": "Réponse : 1×2 + 0×1 + 2×0 + 1×3 = 5. Dimension 4, un seul nombre en sortie."
      }
    ]
  },
  {
    "n": 4,
    "titre": "Distance en dimension n",
    "sous": "Pythagore avec plus de cases",
    "blocs": [
      {
        "t": "titre",
        "c": "Ce que tu sais déjà"
      },
      {
        "t": "para",
        "c": "Sur une droite graduée, la distance entre 3 et 8 est |8 − 3| = 5. Dans le plan, la distance entre deux points se calcule avec Pythagore : √((x₂ − x₁)² + (y₂ − y₁)²). Tu l'as fait en Seconde."
      },
      {
        "t": "titre",
        "c": "L'idée neuve"
      },
      {
        "t": "para",
        "c": "En dimension n, on fait **la même chose avec n cases** : on prend l'écart sur chaque coordonnée, on l'élève au carré, on additionne, on prend la racine."
      },
      {
        "t": "formule",
        "c": "d(a, b) = √( (a₁ − b₁)² + (a₂ − b₂)² + … + (aₙ − bₙ)² )"
      },
      {
        "t": "para",
        "c": "C'est la **distance euclidienne**. Comment se la représenter quand n = 784 ? Pas comme une longueur dans un espace qu'on verrait, mais comme une **mesure de ressemblance** : deux clients dont les vecteurs sont à petite distance ont des profils proches sur toutes les caractéristiques à la fois. Distance petite = ressemblance forte. C'est tout ce qu'il faut voir."
      },
      {
        "t": "titre",
        "c": "Ce qui fait qu'une distance est une distance"
      },
      {
        "t": "para",
        "c": "N'importe quelle formule ne convient pas. Une distance doit vérifier quatre règles de bon sens : elle est positive ; elle vaut 0 uniquement entre un point et lui-même ; elle est symétrique (d(a, b) = d(b, a)) ; et le détour ne raccourcit jamais (inégalité triangulaire : d(a, c) ≤ d(a, b) + d(b, c))."
      },
      {
        "t": "titre",
        "c": "D'autres distances utiles"
      },
      {
        "t": "liste",
        "items": [
          "**Manhattan** : on additionne les écarts en valeur absolue, sans carré ni racine. Comme un taxi qui suit les rues d'une grille.",
          "**Cosinus** : on compare l'angle entre deux vecteurs, sans tenir compte de leur longueur. C'est la mesure standard pour les textes : deux documents qui parlent du même sujet ont la même direction, même si l'un est trois fois plus long."
        ]
      },
      {
        "t": "para",
        "c": "La recherche sémantique (celle qui fait tourner les assistants « branchés sur vos documents ») consiste à transformer la question en vecteur, puis à trouver les documents dont le vecteur est le plus proche. La méthode des k plus proches voisins classe un nouveau point d'après ses voisins les plus proches. Sans distance, pas de « proche »."
      },
      {
        "t": "para",
        "c": "Si une case est un âge (de 20 à 80) et une autre un revenu (de 20 000 à 200 000), le revenu écrase tout dans la formule. Avant de calculer une distance, on normalise chaque colonne pour qu'elles pèsent pareil. Oublier cette étape est l'erreur la plus fréquente."
      },
      {
        "t": "para",
        "c": "a = (1, 2, 3) et b = (4, 6, 3). Calcule d(a, b)."
      },
      {
        "t": "para",
        "c": "Réponse : écarts (3, 4, 0), carrés (9, 16, 0), somme 25, racine 5. Un triangle 3-4-5 caché dans la troisième dimension."
      }
    ]
  },
  {
    "n": 5,
    "titre": "Norme",
    "sous": "la longueur d'un vecteur",
    "blocs": [
      {
        "t": "titre",
        "c": "Ce que tu sais déjà"
      },
      {
        "t": "para",
        "c": "La valeur absolue |x| mesure « la taille » d'un nombre sans son signe : |−3| = 3. C'est la distance entre x et 0."
      },
      {
        "t": "titre",
        "c": "L'idée neuve"
      },
      {
        "t": "para",
        "c": "La **norme** d'un vecteur, notée ‖v‖, est sa longueur : sa distance à l'origine. C'est la valeur absolue généralisée aux vecteurs."
      },
      {
        "t": "formule",
        "c": "‖v‖ = √( v₁² + v₂² + … + vₙ² )"
      },
      {
        "t": "para",
        "c": "Distance et norme sont la même idée vue de deux côtés : **la distance entre a et b est la norme de leur différence**, d(a, b) = ‖a − b‖. Retenir l'une, c'est retenir l'autre."
      },
      {
        "t": "titre",
        "c": "Il y a plusieurs normes"
      },
      {
        "t": "titre",
        "c": "Le vecteur unitaire"
      },
      {
        "t": "para",
        "c": "Diviser un vecteur par sa norme donne un vecteur de longueur 1 qui pointe dans la même direction : v / ‖v‖. On garde la direction, on jette la longueur. C'est ce qu'on fait avant de comparer des textes avec la distance cosinus."
      },
      {
        "t": "para",
        "c": "Trois usages qui reviendront au séminaire. **Régularisation** : on ajoute ‖θ‖² à l'erreur qu'on minimise, pour empêcher les paramètres de devenir énormes et le modèle d'apprendre par cœur. **Normalisation** des vecteurs de mots ou d'images avant comparaison. **Écrêtage du gradient** : si la norme du gradient dépasse un seuil, on le rabote pour éviter que l'entraînement explose."
      },
      {
        "t": "para",
        "c": "Calcule ‖(3, 4)‖ puis ‖(1, 1, 1, 1)‖. Donne le vecteur unitaire de (3, 4)."
      },
      {
        "t": "para",
        "c": "Réponse : √(9 + 16) = 5 ; √4 = 2 ; (3, 4) / 5 = (0,6 ; 0,8), dont la norme vaut bien 1."
      }
    ]
  },
  {
    "n": 6,
    "titre": "Fonction à n variables",
    "sous": "un relief plutôt qu'une courbe",
    "blocs": [
      {
        "t": "titre",
        "c": "Ce que tu sais déjà"
      },
      {
        "t": "para",
        "c": "Une fonction d'une variable se dessine comme une courbe : en abscisse l'argument x, en ordonnée l'image f(x)."
      },
      {
        "t": "titre",
        "c": "L'idée neuve, à deux variables d'abord"
      },
      {
        "t": "para",
        "c": "Avec f(x, y), l'argument est un point du plan, et l'image est une hauteur. Le dessin devient une **surface** au-dessus du plan : un relief, une montagne. Deux exemples à garder en tête :"
      },
      {
        "t": "liste",
        "items": [
          "f(x, y) = x² + y² : un **bol**. Le fond est en (0, 0), ça monte dans toutes les directions.",
          "f(x, y) = x² − y² : une **selle de cheval**. Ça monte le long de x, ça descend le long de y."
        ]
      },
      {
        "t": "para",
        "c": "Deuxième façon de dessiner, celle des cartes IGN : les **courbes de niveau**. On trace dans le plan tous les points où f vaut la même valeur. Pour le bol, ce sont des cercles concentriques ; serrés là où ça grimpe fort, espacés là où c'est plat."
      },
      {
        "t": "para",
        "c": "La selle x² − y² : le centre n'est ni un creux ni un sommet\n \n Deux reliefs vus du dessus. Le point vert est un minimum, le point brun un point selle."
      },
      {
        "t": "titre",
        "c": "Puis à n variables"
      },
      {
        "t": "para",
        "c": "Pour f(x₁, …, xₙ), plus de dessin possible. Mais l'image mentale reste la même : **un paysage**, avec des creux, des bosses et des cols, dans un espace à n dimensions. Un outil utile : faire une coupe. On fixe toutes les variables sauf une, et on regarde f comme une fonction d'une seule variable. On retombe sur une courbe qu'on sait lire. C'est exactement ce que fera la dérivée partielle à la leçon suivante."
      },
      {
        "t": "para",
        "c": "La **fonction de coût** (en anglais loss) est une fonction à n variables : elle prend les n paramètres du modèle et renvoie un score d'erreur. Entraîner le modèle, c'est chercher le point le plus bas de ce paysage. Pour un grand modèle, n se compte en milliards : on ne verra jamais le paysage, on ne peut que le tâter localement."
      },
      {
        "t": "para",
        "c": "Pour f(x, y) = x² + y², décris les courbes de niveau f = 1 et f = 4. Puis fais la coupe y = 1 : quelle fonction d'une variable obtiens-tu ?"
      },
      {
        "t": "para",
        "c": "Réponse : deux cercles centrés en (0, 0), de rayons 1 et 2. La coupe donne g(x) = x² + 1, une parabole dont le minimum est en x = 0."
      }
    ]
  },
  {
    "n": 7,
    "titre": "Gradient",
    "sous": "la boussole qui indique la pente",
    "blocs": [
      {
        "t": "titre",
        "c": "Ce que tu sais déjà"
      },
      {
        "t": "para",
        "c": "La dérivée f'(x) est la pente de la tangente. Elle répond à la question : « si je bouge x d'un tout petit pas, de combien f bouge-t-elle ? » Dérivée positive : ça monte. Négative : ça descend. Nulle : c'est plat. Tu connais les formules de base : la dérivée de x² est 2x, celle de 3x est 3, celle d'une constante est 0."
      },
      {
        "t": "titre",
        "c": "L'idée neuve 1 : la dérivée partielle"
      },
      {
        "t": "para",
        "c": "Avec deux variables, on peut bouger x ou bouger y. On dérive donc deux fois, une par direction. La **dérivée partielle par rapport à x**, notée ∂f/∂x, se calcule avec les règles du lycée **en traitant y comme une constante**. Et réciproquement."
      },
      {
        "t": "formule",
        "c": "f(x, y) = x² + 3xy\n∂f/∂x = 2x + 3y (y est un nombre fixe, donc 3xy dérive comme 3y·x)\n∂f/∂y = 3x (x² ne dépend pas de y, sa dérivée est 0)"
      },
      {
        "t": "titre",
        "c": "L'idée neuve 2 : le gradient"
      },
      {
        "t": "para",
        "c": "Le **gradient** de f, noté ∇f (« nabla f »), est le vecteur qui range toutes les dérivées partielles :"
      },
      {
        "t": "formule",
        "c": "∇f = ( ∂f/∂x₁ , ∂f/∂x₂ , … , ∂f/∂xₙ )"
      },
      {
        "t": "para",
        "c": "Pour l'exemple ci-dessus, ∇f = (2x + 3y, 3x). Au point (1, 1), ∇f = (5, 3)."
      },
      {
        "t": "titre",
        "c": "Ce que le gradient nous apprend"
      },
      {
        "t": "liste",
        "items": [
          "**Sa direction** est celle de la plus forte montée. Son opposé, −∇f, est donc la direction de la plus forte descente. Sur une carte de courbes de niveau, il est perpendiculaire aux courbes.",
          "**Sa norme** mesure la raideur : grande norme, pente forte ; petite norme, terrain presque plat.",
          "**Gradient nul** (toutes les dérivées partielles à zéro) : on est sur un point plat, donc un candidat minimum, maximum ou col. C'est l'équivalent de f'(x) = 0 en Terminale."
        ]
      },
      {
        "t": "para",
        "c": "départ\n minimum\n \n \n Descente de gradient sur une vallée allongée : chaque pas suit −∇f, et les pas raccourcissent quand la pente s'adoucit."
      },
      {
        "t": "titre",
        "c": "La descente de gradient"
      },
      {
        "t": "para",
        "c": "Pour trouver un minimum, on part d'un point au hasard, on calcule le gradient, on fait un petit pas dans la direction opposée, et on recommence :"
      },
      {
        "t": "formule",
        "c": "θ_nouveau = θ − η · ∇L(θ)"
      },
      {
        "t": "para",
        "c": "Le nombre η (« êta ») est le **pas d'apprentissage** (learning rate). Trop grand, on saute par-dessus le creux et on oscille. Trop petit, on met des heures. Le régler est un des premiers gestes du praticien."
      },
      {
        "t": "para",
        "c": "C'est **le** moteur de l'apprentissage. Quand on entend « rétropropagation » (backpropagation), il s'agit d'une méthode de calcul rapide du gradient de la fonction de coût par rapport à chaque paramètre du réseau. Tout l'entraînement d'un réseau de neurones, c'est : calculer le gradient, faire un pas, recommencer des millions de fois."
      },
      {
        "t": "para",
        "c": "f(x, y) = x² + y². Donne ∇f, puis sa valeur en (1, 2). Fais un pas de descente avec η = 0,1 depuis (1, 2)."
      },
      {
        "t": "para",
        "c": "Réponse : ∇f = (2x, 2y), donc ∇f(1, 2) = (2, 4). Nouveau point : (1, 2) − 0,1 × (2, 4) = (0,8 ; 1,6). On s'est bien rapproché du fond du bol en (0, 0)."
      }
    ]
  },
  {
    "n": 8,
    "titre": "Extremum local et global",
    "sous": "le creux et le plus creux",
    "blocs": [
      {
        "t": "titre",
        "c": "Ce que tu sais déjà"
      },
      {
        "t": "para",
        "c": "Avec le tableau de variation : là où f' s'annule en changeant de signe, la fonction a un maximum ou un minimum. Tu sais aussi qu'une parabole x² a un seul minimum, en 0."
      },
      {
        "t": "titre",
        "c": "L'idée neuve"
      },
      {
        "t": "para",
        "c": "Un **minimum global** est le point le plus bas de tout le paysage. Un **minimum local** est le point le plus bas de son voisinage seulement : si tu regardes autour de toi, ça monte dans toutes les directions, mais quelque part plus loin, il y a peut-être un creux plus profond. Une vallée alpine est un minimum local ; la fosse des Mariannes est le minimum global de l'altitude terrestre."
      },
      {
        "t": "para",
        "c": "minimum local\n minimum global\n maximum local\n \n \n \n Trois points où la pente est nulle. Le gradient ne sait pas les distinguer ; il faut regarder autour."
      },
      {
        "t": "titre",
        "c": "Le gradient nul ne suffit pas"
      },
      {
        "t": "para",
        "c": "Gradient nul est une condition **nécessaire** pour un extremum, pas suffisante. Trois cas se cachent derrière un gradient nul : un minimum, un maximum, ou un **point selle** (creux dans une direction, bosse dans une autre, comme le centre de la selle de cheval de la leçon 06). En grande dimension, les points selles sont beaucoup plus nombreux que les vrais minima."
      },
      {
        "t": "titre",
        "c": "Le cas où tout est simple : les fonctions convexes"
      },
      {
        "t": "para",
        "c": "Une fonction **convexe** a la forme d'un bol : un seul creux, et local = global. La descente de gradient y arrive toujours, quel que soit le point de départ. La régression linéaire (la droite d'ajustement de ta calculatrice) minimise une fonction convexe : pas de mauvaise surprise possible."
      },
      {
        "t": "para",
        "c": "La fonction de coût d'un réseau de neurones, elle, **n'est pas convexe** : le paysage est accidenté, avec des milliers de creux et de cols. On accepte de ne pas trouver le minimum global. En pratique, en très grande dimension, les minima locaux atteints sont souvent « assez bons », et on s'aide d'astuces : plusieurs départs aléatoires, de l'élan (momentum) pour franchir les petits creux, et le bruit apporté par le fait de ne regarder qu'un paquet de données à la fois (mini-batch)."
      },
      {
        "t": "para",
        "c": "Deux réflexes pour le séminaire. Quand quelqu'un dit « le modèle a convergé », demande : vers un minimum local ou global, et comment on le sait ? Quand quelqu'un dit « c'est convexe », comprends : le problème est facile et la solution est unique."
      },
      {
        "t": "para",
        "c": "f(x) = x⁴ − 2x². Trouve les points où f' s'annule et dis lesquels sont des minima."
      },
      {
        "t": "para",
        "c": "Réponse : f'(x) = 4x³ − 4x = 4x(x − 1)(x + 1), nulle en −1, 0 et 1. f(−1) = f(1) = −1 : deux minima globaux à égalité. f(0) = 0 : un maximum local coincé entre les deux creux. Le gradient nul en 0 est un piège classique."
      }
    ]
  },
  {
    "n": 9,
    "titre": "Minimiser une distance",
    "sous": "ce que veut dire « apprendre »",
    "blocs": [
      {
        "t": "titre",
        "c": "Ce que tu sais déjà"
      },
      {
        "t": "para",
        "c": "En ES, tu as tracé un nuage de points et demandé à la calculatrice la **droite d'ajustement** (régression linéaire). Tu n'as probablement pas vu comment elle la choisit. Le voici : elle minimise une distance."
      },
      {
        "t": "titre",
        "c": "L'idée neuve"
      },
      {
        "t": "para",
        "c": "On a n points (xᵢ, yᵢ) et on cherche la droite y = ax + b qui « colle le mieux ». Pour chaque point, la droite propose la prédiction a·xᵢ + b, et la vraie valeur est yᵢ. L'erreur totale, dite des **moindres carrés**, est :"
      },
      {
        "t": "formule",
        "c": "E(a, b) = Σ ( yᵢ − (a·xᵢ + b) )²"
      },
      {
        "t": "para",
        "c": "Regarde bien cette formule : c'est le **carré de la distance euclidienne** entre le vecteur des vraies valeurs (y₁, …, yₙ) et le vecteur des prédictions. La droite d'ajustement est celle qui met ces deux vecteurs le plus près possible l'un de l'autre. Et E est une fonction à deux variables, a et b, convexe (un bol). On trouve son minimum en annulant le gradient, ou par descente de gradient."
      },
      {
        "t": "titre",
        "c": "Pourquoi le carré ?"
      },
      {
        "t": "liste",
        "items": [
          "Il rend les erreurs positives et **pénalise fort les grosses erreurs** (une erreur de 10 compte 100, une erreur de 1 compte 1).",
          "Il est **dérivable** partout, donc le gradient existe.",
          "Il donne une fonction **convexe**, donc un seul minimum."
        ]
      },
      {
        "t": "para",
        "c": "Mais ce n'est pas la seule mesure possible. La **valeur absolue** (distance Manhattan) est moins sensible aux points aberrants. Pour des probabilités, on utilise l'**entropie croisée**, qui mesure l'écart entre deux distributions plutôt qu'entre deux nombres. Choisir la « distance » qu'on minimise, c'est choisir ce qu'on entend par « se tromper »."
      },
      {
        "t": "titre",
        "c": "La même idée, partout"
      },
      {
        "t": "liste",
        "items": [
          "**Apprentissage supervisé** : minimiser la distance entre prédictions et vraies réponses. Tout modèle, de la droite au grand modèle de langage, suit ce schéma ; seuls la fonction et le nombre de paramètres changent.",
          "**Compression et réduction de dimension** : trouver la représentation réduite qui perd le moins, c'est minimiser la distance entre la donnée d'origine et sa reconstruction.",
          "**Recherche** : trouver le plus proche voisin, c'est minimiser une distance sur un ensemble de candidats."
        ]
      },
      {
        "t": "para",
        "c": "La phrase à retenir : **entraîner un modèle = minimiser une distance choisie, sur des paramètres, par descente de gradient**. Les leçons 04 à 08 sont les briques de cette phrase. La fonction de coût est une distance ; l'entraînement est une minimisation."
      },
      {
        "t": "para",
        "c": "Points (0, 1), (1, 3), (2, 5). Propose une droite y = ax + b et calcule son erreur des moindres carrés."
      },
      {
        "t": "para",
        "c": "Réponse : y = 2x + 1 passe exactement par les trois points : prédictions (1, 3, 5), erreur 0. C'est le minimum possible, donc c'est la droite d'ajustement. Avec y = 2x, les prédictions sont (0, 2, 4), l'erreur vaut 1 + 1 + 1 = 3."
      }
    ]
  },
  {
    "n": 10,
    "titre": "Partition, clusterisation, outliers",
    "sous": "ranger sans étiquettes",
    "blocs": [
      {
        "t": "titre",
        "c": "Ce que tu sais déjà"
      },
      {
        "t": "para",
        "c": "Les tranches d'âge et les classes de fréquences en statistiques : des groupes qui couvrent tout, sans se recouper."
      },
      {
        "t": "titre",
        "c": "L'idée neuve 1 : la partition"
      },
      {
        "t": "para",
        "c": "Une **partition** d'un ensemble est un découpage en groupes qui vérifie trois choses : les groupes **recouvrent tout** (totalisants : aucun élément oublié), ils sont **disjoints** (aucun élément dans deux groupes), et aucun n'est vide. Autrement dit, chaque élément est dans un groupe et un seul."
      },
      {
        "t": "titre",
        "c": "L'idée neuve 2 : la clusterisation"
      },
      {
        "t": "para",
        "c": "La **clusterisation** (clustering) fabrique automatiquement une partition à partir des distances : on met ensemble ce qui est proche. L'algorithme le plus connu est **k-means** :"
      },
      {
        "t": "liste",
        "items": [
          "Choisir k, le nombre de groupes voulus, et placer k centres au hasard.",
          "Affecter chaque point au centre le plus proche (distance euclidienne).",
          "Déplacer chaque centre à la moyenne des points qui lui sont affectés.",
          "Répéter 2 et 3 jusqu'à ce que plus rien ne bouge."
        ]
      },
      {
        "t": "para",
        "c": "C'est encore une **minimisation de distances** : k-means cherche la partition qui rend minimale la somme des distances² de chaque point à son centre. Le choix de k n'est pas donné par l'algorithme : on essaie plusieurs valeurs (méthode du coude) et on regarde si les groupes ont un sens métier."
      },
      {
        "t": "titre",
        "c": "L'idée neuve 3 : les outliers"
      },
      {
        "t": "para",
        "c": "Un **outlier** (point aberrant) est un point loin de tout le monde. Une partition exige qu'il soit quelque part. Trois options, à annoncer explicitement :"
      },
      {
        "t": "para",
        "c": "Segmentation de clientèle, regroupement de documents, détection de fraude : c'est l'apprentissage non supervisé, sans étiquettes. Et même en supervisé, un classifieur est une partition de l'espace des entrées en zones (« ici c'est un chat, là c'est un chien »). Les outliers sont la question que pose tout praticien sérieux avant de croire un résultat."
      },
      {
        "t": "para",
        "c": "Sur une droite, les points 1, 2, 3, 10, 11, 12 et 50. Clusterise en k = 2 groupes. Que fait le 50 ?"
      },
      {
        "t": "para",
        "c": "Réponse : {1, 2, 3} et {10, 11, 12, 50}. Le centre du second groupe est la moyenne 20,75, alors que ses « vrais » membres sont autour de 11. Si on retire le 50 comme outlier, les centres deviennent 2 et 11, et la partition décrit enfin les données. Le 50 seul dans un groupe « bruit » serait l'autre bonne réponse."
      }
    ]
  }
];

export const lecon = (n: number) => LECONS.find((l) => l.n === n);
