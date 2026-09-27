"use client";
import { useEffect, useRef, useState } from "react";
import { Flower } from "./Flower";
import { beauty, fleur, type Fleur } from "@/lib/game";
import type { Palette } from "@/lib/fleurs";

type Props = {
  name: string;
  flowers: (Fleur | number)[];
  size: number;
  active: boolean;
  mine: boolean;
  palette: Palette;
};

export function Bouquet({ name, flowers, size, active, mine, palette }: Props) {
  const gagnees = flowers.map(fleur);

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

  // Celui qui n'a pas la main occupe moins de place, il ne s'efface pas :
  // son score reste un texte pleinement lisible.
  const corolle = active ? 58 : 44;

  return (
    <section className={`joueur ${active ? "joueur--actif" : ""}`} aria-label={`Bouquet de ${name}`}>
      <div className="joueur__ligne">
        <h2 className="joueur__nom">
          <span className="joueur__marque" aria-hidden="true" />
          {name}
          {mine && <em>vous</em>}
        </h2>
        <p className="joueur__compte">
          {gagnees.length} sur {size}
          {gagnees.length > 0 && <span className="joueur__beaute">beauté {beauty(flowers)}</span>}
        </p>
      </div>
      <ul className="rangee">
        {Array.from({ length: size }, (_, i) => {
          const f = gagnees[i];
          return (
            <li key={i}>
              <Flower
                palette={palette}
                lecon={f?.l ?? 0}
                quality={(f?.q ?? 0) as 0 | 1 | 2 | 3}
                size={corolle}
                entrante={i === entrante}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
