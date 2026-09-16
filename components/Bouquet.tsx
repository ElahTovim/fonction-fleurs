"use client";
import { useEffect, useRef, useState } from "react";
import { Flower } from "./Flower";
import { beauty } from "@/lib/game";

type Props = { name: string; flowers: number[]; size: number; active: boolean; mine: boolean };

export function Bouquet({ name, flowers, size, active, mine }: Props) {
  // La dernière fleur gagnée s'ouvre ; les autres sont déjà là.
  const [bloomAt, setBloomAt] = useState(-1);
  const seen = useRef(flowers.length);
  useEffect(() => {
    if (flowers.length > seen.current) {
      setBloomAt(flowers.length - 1);
      const t = setTimeout(() => setBloomAt(-1), 900);
      seen.current = flowers.length;
      return () => clearTimeout(t);
    }
    seen.current = flowers.length;
  }, [flowers.length]);

  return (
    <section className={`plate ${active ? "plate--active" : ""}`} aria-label={`Bouquet de ${name}`}>
      <div className="plate__head">
        <h2 className="plate__name">
          {name}
          {mine && <span className="plate__you">vous</span>}
        </h2>
        <p className="plate__count">
          <span className="num">{flowers.length}</span>
          <span className="plate__sep">sur</span>
          <span className="num">{size}</span>
          {flowers.length > 0 && <span className="plate__beauty">beauté <span className="num">{beauty(flowers)}</span></span>}
        </p>
      </div>
      <ul className="plate__row">
        {Array.from({ length: size }, (_, i) => (
          <li key={i}>
            <Flower quality={(flowers[i] ?? 0) as 0 | 1 | 2 | 3} index={i} size={46} bloom={i === bloomAt} />
          </li>
        ))}
      </ul>
    </section>
  );
}
