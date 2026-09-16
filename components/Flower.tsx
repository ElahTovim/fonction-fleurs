// Un spécimen d'herbier. Trois états de floraison :
// 1 bouton (lent), 2 fleur (moins de 45 s), 3 fleur épanouie (moins de 20 s).
// La silhouette et la teinte varient selon la place dans le bouquet,
// pour qu'une rangée de cinq ne soit jamais une répétition.

const HUES = [348, 42, 288, 14, 218, 320, 68, 256];

// Trois silhouettes de pétale, base au point (0,0), pointe vers le haut.
const PETALS = [
  "M0 0 C -10 -8, -11 -23, 0 -30 C 11 -23, 10 -8, 0 0 Z", // ronde
  "M0 0 C -7 -11, -7.5 -24, 0 -31 C 7.5 -24, 7 -11, 0 0 Z", // pointue
  "M0 0 C -11.5 -7, -12.5 -19, -5 -27 C -1 -30, 1 -30, 5 -27 C 12.5 -19, 11.5 -7, 0 0 Z", // en coupe
];

const CX = 32;
const CY = 30;

type Props = { quality: 0 | 1 | 2 | 3; index: number; size?: number; bloom?: boolean };

export function Flower({ quality, index, size = 56, bloom = false }: Props) {
  const hue = HUES[index % HUES.length];
  const shape = PETALS[index % PETALS.length];
  const petal = `hsl(${hue} 64% 63%)`;
  const petalInk = `hsl(${hue} 52% 33%)`;
  const heart = `hsl(${(hue + 34) % 360} 70% 57%)`;
  const h = Math.round(size * 1.38);

  if (quality === 0) {
    return (
      <svg className="flower" width={size} height={h} viewBox="0 0 64 88" aria-label="place libre">
        <circle cx={CX} cy={32} r="10" fill="none" stroke="var(--rule)" strokeWidth="1.7" strokeDasharray="2 4.5" strokeLinecap="round" />
        <path d="M32 86 L32 46" fill="none" stroke="var(--rule)" strokeWidth="1.7" strokeDasharray="2 4.5" strokeLinecap="round" />
      </svg>
    );
  }

  const label = quality === 1 ? "bouton" : quality === 2 ? "fleur" : "fleur épanouie";
  const leafLeft = index % 2 === 0;

  const stem = (
    <g>
      <path d="M32 86 C 32 70, 30 56, 31 44" fill="none" stroke="var(--stem)" strokeWidth="2.8" strokeLinecap="round" />
      <path
        d={leafLeft ? "M31 66 C 20 64, 15 55, 16 46 C 26 48, 31 57, 31 66 Z" : "M31 66 C 42 64, 47 55, 46 46 C 36 48, 31 57, 31 66 Z"}
        fill="var(--stem)"
        stroke="var(--stem-ink)"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </g>
  );

  // Le bouton : une corolle encore fermée, serrée dans ses sépales.
  if (quality === 1) {
    return (
      <svg className={`flower ${bloom ? "flower--new" : ""}`} width={size} height={h} viewBox="0 0 64 88" aria-label={label}>
        {stem}
        <g className="petal-group" stroke={petalInk} strokeWidth="1.2" strokeLinejoin="round">
          <path className="petal" style={{ animationDelay: "0ms" }} d="M31 48 C 17 38, 17 18, 31 8 C 45 18, 45 38, 31 48 Z" fill={petal} />
          <path className="petal" style={{ animationDelay: "60ms" }} d="M31 45 C 23 37, 23 20, 31 13 C 39 20, 39 37, 31 45 Z" fill={`hsl(${hue} 68% 71%)`} />
        </g>
        <g stroke="var(--stem-ink)" strokeWidth="1.2" strokeLinejoin="round" fill="var(--stem)">
          <path d="M31 50 C 23 47, 20 40, 24 35 C 28 39, 31 45, 31 50 Z" />
          <path d="M31 50 C 39 47, 42 40, 38 35 C 34 39, 31 45, 31 50 Z" />
        </g>
      </svg>
    );
  }

  const count = quality === 3 ? 8 : index % 3 === 2 ? 5 : 6;
  const outer = Array.from({ length: count }, (_, i) => (i / count) * 360);
  const inner = quality === 3 ? outer.map((a) => a + 360 / count / 2) : [];

  return (
    <svg className={`flower ${bloom ? "flower--new" : ""}`} width={size} height={h} viewBox="0 0 64 88" aria-label={label}>
      {stem}
      <g className="petal-group" stroke={petalInk} strokeWidth="1.2" strokeLinejoin="round">
        {inner.map((a, i) => (
          <g key={`i${i}`} transform={`rotate(${a} ${CX} ${CY})`}>
            <g transform={`translate(${CX} ${CY}) scale(0.64)`}>
              <path className="petal" style={{ animationDelay: `${i * 18}ms` }} d={shape} fill={`hsl(${hue} 58% 51%)`} />
            </g>
          </g>
        ))}
        {outer.map((a, i) => (
          <g key={`o${i}`} transform={`rotate(${a} ${CX} ${CY})`}>
            <g transform={`translate(${CX} ${CY}) scale(${quality === 3 ? 1 : 0.86})`}>
              <path className="petal" style={{ animationDelay: `${(inner.length + i) * 18}ms` }} d={shape} fill={petal} />
            </g>
          </g>
        ))}
      </g>
      <circle className="flower__heart" cx={CX} cy={CY} r={quality === 3 ? 6.6 : 5} fill={heart} stroke={petalInk} strokeWidth="1.2" />
    </svg>
  );
}
