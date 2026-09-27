import { admin } from "@/lib/supabaseAdmin";
import { applyTurn, json, loadGame } from "@/lib/arbitre";
import { TURN_LIMIT_MS } from "@/lib/game";
import type { Question } from "@/lib/questions";

// Le chrono du tour, arbitré par le serveur.
//
// N'importe quel écran ouvert sur la partie peut appeler cette route, y
// compris celui de l'adversaire ou d'un spectateur : c'est ce qui permet de
// fermer le tour d'un joueur qui a posé son téléphone. Aucune confiance n'est
// accordée à l'appelant, l'heure de départ vient de la table `turns`.
// La réponse dit le temps restant, pour que la page rappelle au bon moment.
export async function POST(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const g = await loadGame(code);
  if (!g) return json({ error: "Partie introuvable." }, 404);
  if (g.status !== "playing") return json({ game: g, msLeft: null });

  const db = admin();
  const { data: turn } = await db.from("turns").select("id,question,revealed_at")
    .eq("game_code", code).eq("seat", g.turn_seat).eq("round", g.round).is("answered_at", null).maybeSingle();
  if (!turn) return json({ game: g, msLeft: null });

  const due = new Date(turn.revealed_at).getTime() + TURN_LIMIT_MS;
  const msLeft = due - Date.now();
  if (msLeft > 0) return json({ game: g, msLeft });

  // Même verrou que pour une réponse : le premier qui ferme le tour l'emporte,
  // les autres appels ne font rien.
  const { data: closed } = await db.from("turns")
    .update({ answered_at: new Date().toISOString(), given: "", correct: false, elapsed_ms: TURN_LIMIT_MS, quality: 0 })
    .eq("id", turn.id).is("answered_at", null).select("id");
  if (!closed?.length) return json({ game: await loadGame(code), msLeft: null });

  const game = await applyTurn(g, g.turn_seat, {
    correct: false,
    elapsedMs: TURN_LIMIT_MS,
    lecon: (turn.question as Question).lesson,
    expire: true,
  });
  return json({ game, msLeft: null, expire: true });
}
