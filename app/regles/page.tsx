import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Flower } from "@/components/Flower";
import { BOUQUET_SIZE, SPEED_TIERS_MS, TURN_LIMIT_MS } from "@/lib/game";
import { FAMILLES } from "@/lib/notions";

export const metadata = { title: "Règles · Fonction fleurs" };

const s = (ms: number) => Math.round(ms / 1000);

export default function Regles() {
  return (
    <main className="sheet">
      <Nav retour="/" libelle="Jouer" droite="règles" />

      <ol className="regles">
        <li>
          <h2>Chacun son tour</h2>
          <p>Une question par tour, une réponse, définitive. Personne ne répond à la place de l&apos;autre et personne ne revient sur ce qu&apos;il a validé.</p>
        </li>
        <li>
          <h2>Juste, une fleur</h2>
          <p>Faux, rien. Le premier bouquet de {BOUQUET_SIZE} fleurs arrête la partie. À nombre de fleurs égal, le plus beau bouquet l&apos;emporte.</p>
        </li>
        <li>
          <h2>La vitesse fait la fleur</h2>
          <div className="regles__stades">
            {[
              { q: 3 as const, mot: `moins de ${s(SPEED_TIERS_MS.epanouie)} s`, nom: "fleur épanouie" },
              { q: 2 as const, mot: `jusqu'à ${s(SPEED_TIERS_MS.fleur)} s`, nom: "fleur" },
              { q: 1 as const, mot: `au-delà`, nom: "bouton" },
            ].map((e) => (
              <figure key={e.q}>
                <Flower palette="a" lecon={7} quality={e.q} size={58} />
                <figcaption>
                  {e.nom}
                  <span>{e.mot}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <p>Passé {s(TURN_LIMIT_MS)} s le tour est perdu et la main passe. Sans coup joué pendant 24 heures, la partie se clôt.</p>
        </li>
        <li>
          <h2>L&apos;espèce dit la notion</h2>
          <p>
            Chaque fleur garde la notion qui l&apos;a fait pousser, et son espèce en donne la famille :{" "}
            {Object.values(FAMILLES).map((f) => f.nom.toLowerCase()).join(", ")}. Un bouquet se lit donc comme une carte de ce qu&apos;on tient.
          </p>
        </li>
        <li>
          <h2>Aucun compte</h2>
          <p>Le lien suffit. Une place par appareil, les deux premiers jouent, les suivants regardent.</p>
        </li>
      </ol>

      <Link className="btn btn--bases" href="/bases">Les bases</Link>
    </main>
  );
}
