import Link from "next/link";

/** L'en-tête de toutes les pages. À gauche on revient, à droite on se situe.
 *  Sans `retour`, le nom de l'application ramène à l'accueil : c'est la
 *  convention, et cela suffit pour sortir d'une partie. */
export function Nav({ retour, libelle, droite }: { retour?: string; libelle?: string; droite?: string }) {
  return (
    <header className="masthead">
      {retour ? (
        <Link className="retour" href={retour}>
          <span aria-hidden="true">←</span> {libelle ?? "Retour"}
        </Link>
      ) : (
        <Link className="wordmark lien" href="/">Fonction fleurs</Link>
      )}
      {droite && <span className="meta">{droite}</span>}
    </header>
  );
}
