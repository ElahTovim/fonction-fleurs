import Link from "next/link";
import { notFound } from "next/navigation";
import { LECONS, lecon, type Bloc } from "@/lib/lecons";
import { eclairage } from "@/lib/ia";
import { Riche } from "@/components/Riche";
import { Nav } from "@/components/Nav";

export function generateStaticParams() {
  return LECONS.map((l) => ({ n: String(l.n) }));
}

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }) {
  const l = lecon(Number((await params).n));
  return { title: l ? `${l.titre} · Fonction fleurs` : "Fonction fleurs" };
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

export default async function Lecon({ params, searchParams }: {
  params: Promise<{ n: string }>;
  searchParams: Promise<{ p?: string }>;
}) {
  const n = Number((await params).n);
  // `p` porte le code de la partie en cours : on y revient au lieu de la perdre.
  const partie = (await searchParams).p;
  const l = lecon(n);
  if (!l) notFound();
  const suivante = lecon(n + 1);
  const ia = eclairage(n);

  return (
    <main className="sheet">
      <Nav
        retour={partie ? `/p/${partie}` : "/bases"}
        libelle={partie ? "Reprendre la partie" : "Les bases"}
        droite={`leçon ${l.n}`}
      />

      <h1 className="display lecon__nom">{l.titre}</h1>
      <p className="lede">{l.sous}</p>

      <article className="lecon">
        {l.blocs.map((b, i) => <Morceau key={i} b={b} />)}
      </article>

      {ia && (
        <section className="seminaire">
          <h2 className="seminaire__etiquette">En quoi c&apos;est de l&apos;IA</h2>
          <p className="lecon__para">{ia.role}</p>

          <h2 className="seminaire__etiquette">Cas concret</h2>
          <p className="seminaire__cas">{ia.cas.titre}</p>
          {ia.cas.texte.map((t, i) => <p key={i} className="lecon__para">{t}</p>)}
        </section>
      )}

      <nav className="lecon__pied">
        {suivante && (
          <Link className="btn btn--quiet" href={`/bases/${suivante.n}${partie ? `?p=${partie}` : ""}`}>
            Notion suivante
          </Link>
        )}
        <Link className="btn" href={partie ? `/p/${partie}` : "/"}>
          {partie ? "Reprendre la partie" : "Jouer"}
        </Link>
      </nav>
    </main>
  );
}
