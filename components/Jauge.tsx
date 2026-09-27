"use client";
import { Flower } from "./Flower";
import { QUALITY_LABEL, SPEED_TIERS_MS, TURN_LIMIT_MS, qualityFor } from "@/lib/game";
import type { Palette } from "@/lib/fleurs";

/** Le temps qui reste, montré plutôt qu'écrit.
 *
 *  Une barre qui se vide, deux encoches aux deux seuils, et la fleur qu'on
 *  gagnerait à cet instant. On voit la corolle se refermer en approchant de
 *  l'encoche : le joueur n'a plus à retenir que 20 s et 45 s veulent dire
 *  quelque chose, il le lit. Passé la fin de la barre, le tour est perdu. */
export function Jauge({ elapsedMs, palette, lecon }: { elapsedMs: number; palette: Palette; lecon: number }) {
  const reste = Math.max(0, TURN_LIMIT_MS - elapsedMs);
  const part = (reste / TURN_LIMIT_MS) * 100;
  const q = qualityFor(elapsedMs);
  const secs = Math.ceil(reste / 1000);
  // Les quinze dernières secondes se voient sans qu'on ait à lire le nombre.
  const urgent = reste <= 15_000;

  return (
    <div className="jauge">
      <div className="jauge__barre">
        <div
          className="jauge__piste"
          role="progressbar"
          aria-label="Temps restant pour répondre"
          aria-valuemin={0}
          aria-valuemax={Math.round(TURN_LIMIT_MS / 1000)}
          aria-valuenow={secs}
          aria-valuetext={`${secs} secondes, ${QUALITY_LABEL[q]}`}
        >
          <div className="jauge__reste" style={{ width: `${part}%` }} />
        </div>
        {/* Les seuils sont posés SOUS la piste : dedans, ils disparaîtraient
            dès que la barre les a dépassés, au moment précis où ils comptent. */}
        {[SPEED_TIERS_MS.epanouie, SPEED_TIERS_MS.fleur].map((t) => (
          <span key={t} className="jauge__encoche" aria-hidden="true"
            style={{ left: `${(1 - t / TURN_LIMIT_MS) * 100}%` }} />
        ))}
      </div>
      <p className="jauge__etat">
        <Flower palette={palette} lecon={lecon} quality={q} size={26} />
        <span className="jauge__stade">{QUALITY_LABEL[q]}</span>
        <span className={`jauge__secondes ${urgent ? "jauge__secondes--court" : ""}`}>{secs} s</span>
      </p>
    </div>
  );
}
