import Link from "next/link";
import { LECONS } from "@/lib/lecons";
import { FIL_ROUGE } from "@/lib/ia";
import { Riche } from "@/components/Riche";
import { Nav } from "@/components/Nav";

export const metadata = { title: "Les bases · Fonction fleurs" };

export default function Bases() {
  return (
    <main className="sheet">
      <Nav retour="/" libelle="Jouer" droite="les bases" />

      <p className="fil"><Riche texte={FIL_ROUGE} /></p>

      <ol className="notions">
        {LECONS.map((l) => (
          <li key={l.n}>
            <Link href={`/bases/${l.n}`}>
              <span className="notions__n">{l.n}</span>
              <span className="notions__titre">{l.titre}</span>
              <span className="notions__sous">{l.sous}</span>
            </Link>
          </li>
        ))}
      </ol>

      <Link className="btn btn--bases" href="/">Jouer</Link>
    </main>
  );
}
