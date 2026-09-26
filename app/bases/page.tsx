import Link from "next/link";
import { LECONS } from "@/lib/lecons";

export const metadata = { title: "Les bases · Fonction fleurs" };

export default function Bases() {
  return (
    <main className="sheet">
      <header className="masthead">
        <Link className="wordmark lien" href="/">Retour</Link>
        <span className="meta">les bases</span>
      </header>

      <p className="lede">
        Les dix notions dont le jeu tire ses questions. Chacune se lit en quelques minutes.
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
