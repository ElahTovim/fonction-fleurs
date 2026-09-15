import { Flower } from "./Flower";
import { beauty } from "@/lib/game";

export function Bouquet({ name, flowers, size, active, mine }: { name: string; flowers: number[]; size: number; active: boolean; mine: boolean }) {
  return (
    <div className={`bouquet ${active ? "bouquet--active" : ""}`}>
      <div className="bouquet__head">
        <span className="bouquet__name">{name}{mine ? " (toi)" : ""}</span>
        <span className="bouquet__score">{flowers.length}/{size} · beauté {beauty(flowers)}</span>
      </div>
      <div className="bouquet__flowers">
        {Array.from({ length: size }, (_, i) => (
          <Flower key={i} quality={(flowers[i] ?? 0) as 0 | 1 | 2 | 3} index={i} size={52} />
        ))}
      </div>
    </div>
  );
}
