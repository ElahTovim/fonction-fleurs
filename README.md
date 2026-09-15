# Jeu des fleurs

Exercice 1 du cours : un outil de coordination sans compte.

Deux personnes jouent depuis leur téléphone, par un simple lien. Chacune, à son tour,
résout une question tirée au sort sur les dix notions de maths du cours. Réponse juste :
une fleur. Plus la réponse est rapide, plus la fleur est belle. Le premier bouquet de
cinq fleurs gagne. On peut aussi jouer seul contre un robot.

## La stack, trois briques

| Brique | Rôle | Pourquoi elle |
|---|---|---|
| GitHub | le stock : le code et son historique | Vercel s'y branche et redéploie à chaque push |
| Vercel | l'hébergement public et l'arbitre (les routes `app/api/*`) | fabricant de Next.js, zéro serveur à gérer |
| Supabase | la mémoire partagée qui survit à la fermeture du navigateur | on voit les tables comme un tableur, temps réel intégré |

Next.js est la forme du code : un fichier dans `app/` devient une adresse, un fichier
dans `app/api/` devient une route serveur.

## Ce que le cadre exigeait, et où c'est fait

- **Hébergement public avec une adresse** : Vercel.
- **Stockage commun et durable** : table `games` dans Supabase. Jamais dans le téléphone.
- **Savoir qui a fait quoi sans compte** : `lib/identity.ts`. Un jeton tiré au sort à la
  première visite, rangé dans le navigateur du téléphone, renvoyé à chaque action.
  On sait quel appareil a agi, pas quelle personne. Le jeu est conçu pour que la
  différence ne compte pas.
- **Mise à jour de l'écran quand l'autre agit** : `components/Game.tsx`. La page s'abonne
  à la ligne de la partie via Supabase Realtime, plus un sondage toutes les 5 s en secours.
- **Interface téléphone** : une colonne de 480 px maximum, boutons pleine largeur.

## Les trois décisions, réglées par une seule règle : le tour de rôle

- **Modifier après coup, par qui ?** Personne. Un tour est un acte unique et définitif.
  Il n'y a donc personne à autoriser.
- **Deux personnes en même temps ?** Impossible par construction : une seule action est
  autorisée à chaque instant, celle du joueur dont c'est le tour, sur la question ouverte.
  L'arbitre refuse tout le reste, y compris un double appui (`answer/route.ts`, écriture
  conditionnelle sur `answered_at is null`).
- **Un lien qui circule ?** Deux sièges. Une fois pris, un nouvel arrivant regarde.

Limite assumée : un inconnu qui reçoit le lien avant le deuxième joueur peut prendre sa place.

## Le chrono est côté serveur

L'heure de révélation de la question et l'heure de la réponse sont notées par l'arbitre.
Le téléphone n'affiche qu'un compteur indicatif. Un téléphone à l'heure fausse, ou un
joueur malin, ne change rien. C'est aussi pour cela que la question ne s'affiche qu'après
« Prêt » : le délai de réseau ne mange pas le temps du joueur.

Seuils : 20 s pour la fleur épanouie, 45 s pour la fleur, bouton au-delà (`lib/game.ts`).

## Installer

1. Créer un projet Supabase, coller `supabase/schema.sql` dans SQL Editor, Run.
2. Copier `.env.example` en `.env.local`, y mettre l'URL et les deux clés du projet.
3. `npm install` puis `npm run dev`, ouvrir http://localhost:3000.
4. Sur Vercel : importer le dépôt, coller les trois mêmes variables, déployer.

## Dossiers

```
app/            pages (/, /p/[code]) et routes serveur (/api/games/…)
components/     Game (l'écran de jeu), Bouquet, Flower (SVG, 3 qualités)
lib/            questions (générateur), game (règles), arbitre (écritures), identity (jeton)
supabase/       schema.sql
```
