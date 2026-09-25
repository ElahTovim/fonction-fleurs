"use client";
import { useEffect, useRef, useState } from "react";

const VU = "fleurs.intro";

/** Le plan d'ouverture : les fleurs se rassemblent, puis la page apparaît.
 *  Une seule fois par session, escamotable d'une touche, et jamais bloquant :
 *  si la lecture automatique est refusée, on passe directement. */
export function Intro() {
  const [etat, setEtat] = useState<"attente" | "joue" | "sort" | "fini">("attente");
  const video = useRef<HTMLVideoElement>(null);
  const decide = useRef(false);

  useEffect(() => {
    // React monte les effets deux fois en développement : sans cette garde,
    // le second passage relirait le drapeau que le premier vient d'écrire.
    if (decide.current) return;
    decide.current = true;
    let deja = true;
    try { deja = sessionStorage.getItem(VU) === "1"; } catch {}
    if (deja) { setEtat("fini"); return; }
    try { sessionStorage.setItem(VU, "1"); } catch {}
    setEtat("joue");
  }, []);

  useEffect(() => {
    if (etat !== "joue") return;
    const v = video.current;
    // La lecture automatique muette passe sur téléphone. Si elle est refusée,
    // on laisse tout de même voir la première image un instant, puis on sort.
    v?.play().catch(() => setTimeout(sortir, 900));
    const secours = setTimeout(sortir, 6500); // le plan ne retient jamais plus longtemps
    return () => clearTimeout(secours);
  }, [etat]);

  function sortir() {
    setEtat((e) => (e === "joue" ? "sort" : e));
    setTimeout(() => setEtat("fini"), 520);
  }

  if (etat === "fini" || etat === "attente") return null;

  return (
    <div
      className={`intro ${etat === "sort" ? "intro--sort" : ""}`}
      onClick={sortir}
      role="presentation"
      aria-hidden="true"
    >
      <video
        ref={video}
        className="intro__video"
        src="/fleurs/intro.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={sortir}
      />
    </div>
  );
}
