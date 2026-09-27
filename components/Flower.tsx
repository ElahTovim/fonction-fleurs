"use client";
import { fleurSrc, NOM_ESPECE, type Palette, especeDe } from "@/lib/fleurs";

const NOM: Record<number, string> = { 1: "bouton", 2: "fleur", 3: "fleur épanouie" };

type Props = {
  palette: Palette;
  /** La leçon dont vient la fleur : c'est elle qui décide de l'espèce. */
  lecon: number;
  quality: 0 | 1 | 2 | 3;
  size?: number;
  grande?: boolean;
  entrante?: boolean;
};

export function Flower({ palette, lecon, quality, size = 66, grande = false, entrante = false }: Props) {
  if (quality === 0) {
    return <span className="fleur fleur--vide" style={{ width: size, height: size }} aria-label="place libre" />;
  }
  return (
    <img
      className={`fleur ${entrante ? "fleur--entrante" : ""}`}
      src={fleurSrc(palette, lecon, quality, grande)}
      width={size}
      height={size}
      alt={`${NOM_ESPECE[especeDe(palette, lecon)]}, ${NOM[quality]}`}
      loading={grande ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
    />
  );
}
