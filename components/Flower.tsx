"use client";
import { fleurSrc, type Palette, especeOf } from "@/lib/fleurs";

const NOM: Record<number, string> = { 1: "bouton", 2: "fleur", 3: "fleur épanouie" };

type Props = {
  palette: Palette;
  index: number;
  quality: 0 | 1 | 2 | 3;
  size?: number;
  grande?: boolean;
  entrante?: boolean;
};

/** Une corolle. La place dans le bouquet donne l'espèce, la vitesse de
 *  réponse donne le stade d'ouverture. Vide, c'est un simple cercle. */
export function Flower({ palette, index, quality, size = 66, grande = false, entrante = false }: Props) {
  if (quality === 0) {
    return <span className="fleur fleur--vide" style={{ width: size, height: size }} aria-label="place libre" />;
  }
  return (
    <img
      className={`fleur ${entrante ? "fleur--entrante" : ""}`}
      src={fleurSrc(palette, index, quality, grande)}
      width={size}
      height={size}
      alt={`${especeOf(palette, index)}, ${NOM[quality]}`}
      loading={grande ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
    />
  );
}
