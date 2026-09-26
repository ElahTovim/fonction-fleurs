import Link from "next/link";
import { notFound } from "next/navigation";
import { LECONS, lecon, type Bloc } from "@/lib/lecons";

export function generateStaticParams() {
  return LECONS.map((l) => ({ n: String(l.n) }));
}

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }) {
  const l = lecon(Number((await params).n));
  return { title: l ? `${l.titre} · Fonction fleurs` : "Fonction fleurs" };
}

/** Le gras du cours est noté **ainsi** : on le rend sans dépendance. */
function Riche({ texte }: { texte: string }) {
  return (
    <>
      {texte.split("**").map((part, i) =>
        i % 2 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
      )}
    </>
  );
}

function Morceau({ b }: { b: Bloc }) {
  if (b.t === "titre") return <h2 className="lecon__titre">{b.c}</h2>;
  if (b.t === "formule") return <pre className="lecon__formule">{b.c}</pre>;
  if (b.t === "liste")
    return (
      <ul className="lecon__liste">
        {b.items.map((it, i) => <li key={i}><Riche texte={it} /></li>)}
      </ul>
    );
  return <p className="lecon__para"><Riche texte={b.c} /></p>;
}

export default async function Lecon({ params }: { params: Promise<{ n: string }> }) {
  const n = Number((await params).n);
  const l = lecon(n);
  if (!l) notFound();
  const suivante = lecon(n + 1);

  return (
    <main className="sheet">
      <header className="masthead">
        <Link className="wordmark lien" href="/bases">Les bases</Link>
        <span className="meta">leçon {l.n}</span>
      </header>

      <h1 className="display lecon__nom">{l.titre}</h1>
      <p className="lede">{l.sous}</p>

      <article className="lecon">
        {l.blocs.map((b, i) => <Morceau key={i} b={b} />)}
      </article>

      <nav className="lecon__pied">
        {suivante && <Link className="btn btn--quiet" href={`/bases/${suivante.n}`}>Notion suivante</Link>}
        <Link className="btn" href="/">Jouer</Link>
      </nav>
    </main>
  );
}
