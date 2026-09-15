// Une fleur en SVG. Trois qualités : 1 bouton, 2 fleur, 3 fleur épanouie.
const HUES = [340, 25, 48, 275, 200, 120, 0, 300];

export function Flower({ quality, index, size = 56 }: { quality: 0 | 1 | 2 | 3; index: number; size?: number }) {
  const hue = HUES[index % HUES.length];
  const petal = `hsl(${hue} 75% 62%)`, petalDark = `hsl(${hue} 60% 48%)`, leaf = "#3E7A4F", stem = "#2F5E3C";
  if (quality === 0) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" aria-label="emplacement vide">
        <circle cx="32" cy="26" r="13" fill="none" stroke="#C9C3B5" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="32" y1="40" x2="32" y2="60" stroke="#C9C3B5" strokeWidth="2" strokeDasharray="4 4" />
      </svg>
    );
  }
  const petals = quality === 3 ? 8 : 5;
  const r = quality === 3 ? 12 : 9;
  const d = quality === 3 ? 11 : 8;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-label={quality === 1 ? "bouton" : quality === 2 ? "fleur" : "fleur épanouie"}>
      {quality === 3 && <circle cx="32" cy="26" r="24" fill={`hsl(${hue} 90% 80% / 0.35)`} />}
      <path d="M32 60 C32 50, 32 42, 32 34" stroke={stem} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M32 50 C26 48, 22 44, 22 40 C28 40, 31 44, 32 50 Z" fill={leaf} />
      {quality === 1 ? (
        <>
          <ellipse cx="32" cy="27" rx="7" ry="11" fill={petalDark} />
          <ellipse cx="32" cy="25" rx="4.5" ry="9" fill={petal} />
          <path d="M25 33 C28 30, 36 30, 39 33 C36 36, 28 36, 25 33 Z" fill={leaf} />
        </>
      ) : (
        <>
          {Array.from({ length: petals }, (_, i) => {
            const a = (i / petals) * Math.PI * 2 - Math.PI / 2;
            return <ellipse key={i} cx={32 + Math.cos(a) * d} cy={26 + Math.sin(a) * d} rx={r * 0.55} ry={r} fill={i % 2 ? petal : petalDark} transform={`rotate(${(a * 180) / Math.PI + 90} ${32 + Math.cos(a) * d} ${26 + Math.sin(a) * d})`} />;
          })}
          <circle cx="32" cy="26" r={quality === 3 ? 6 : 4.5} fill="#F5C542" stroke="#C9931B" strokeWidth="1.5" />
        </>
      )}
    </svg>
  );
}
