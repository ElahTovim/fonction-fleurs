import Link from "next/link";
import { LECONS } from "@/lib/lecons";
import { FIL_ROUGE } from "@/lib/ia";
import { Riche } from "@/components/Riche";

export const metadata = { title: "Les bases · Fonction fleurs" };

export default function Bases() {
  return (
    <main className="sheet">
      <header className="masthead">
        <Link className="wordmark lien" href="/">Retour</Link>
        <span className="meta">les bases</span>
      </header>

      {/* Le fil rouge du cours : une phrase qui contient les dix notions. */}
      <p className="fil"><Riche texte={FIL_ROUGE} /></p>
      <p className="source">
        Chaque mot en gras est une leçon. Chacune dit aussi à quoi elle sert dans un système
        d&apos;IA, avec un cas concret.
      </p>

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

      <Link className="lien-bas" href="/">Jouer</Link>
    </main>
  );
}
