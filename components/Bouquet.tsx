"use client";
import { useEffect, useRef, useState } from "react";
import { Flower } from "./Flower";
import { beauty } from "@/lib/game";
import type { Palette } from "@/lib/fleurs";

type Props = { name: string; flowers: number[]; size: number; active: boolean; mine: boolean; palette: Palette };

export function Bouquet({ name, flowers, size, active, mine, palette }: Props) {
  // La dernière fleur gagnée se pose, les autres sont déjà là.
  const [entrante, setEntrante] = useState(-1);
  const vues = useRef(flowers.length);
  useEffect(() => {
    if (flowers.length > vues.current) {
      setEntrante(flowers.length - 1);
      const t = setTimeout(() => setEntrante(-1), 700);
      vues.current = flowers.length;
      return () => clearTimeout(t);
    }
    vues.current = flowers.length;
  }, [flowers.length]);

  return (
    <section className={`joueur ${active ? "joueur--actif" : ""}`} aria-label={`Bouquet de ${name}`}>
      <div className="joueur__ligne">
        <h2 className="joueur__nom">
          {name}
          {mine && <em>vous</em>}
        </h2>
        <p className="joueur__compte">
          {flowers.length} sur {size}
          {flowers.length > 0 && <span className="joueur__beaute">beauté {beauty(flowers)}</span>}
        </p>
      </div>
      <ul className="rangee">
        {Array.from({ length: size }, (_, i) => (
          <li key={i}>
            <Flower palette={palette} index={i} quality={(flowers[i] ?? 0) as 0 | 1 | 2 | 3} size={58} entrante={i === entrante} />
          </li>
        ))}
      </ul>
    </section>
  );
}
