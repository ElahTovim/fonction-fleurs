import { admin } from "@/lib/supabaseAdmin";
import { applyTurn, json, loadGame, seatOf } from "@/lib/arbitre";
import { isCorrect, type Question } from "@/lib/questions";
import { qualityFor } from "@/lib/game";

// Le joueur répond : une seule fois, jugée et chronométrée par le serveur.
export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { token, turnId, answer } = await req.json();
  const g = await loadGame(code);
  if (!g) return json({ error: "Partie introuvable." }, 404);
  const me = await seatOf(code, token);
  if (!me) return json({ error: "Tu n'es pas dans cette partie." }, 403);
  if (g.status !== "playing" || g.turn_seat !== me.seat) return json({ error: "Ce n'est pas ton tour." }, 409);

  const db = admin();
  const { data: turn } = await db.from("turns").select("*").eq("id", turnId).eq("game_code", code).eq("seat", me.seat).maybeSingle();
  if (!turn) return json({ error: "Tour inconnu." }, 404);
  const q = turn.question as Question;
  const now = Date.now();
  const elapsed = Math.max(0, now - new Date(turn.revealed_at).getTime());
  const correct = isCorrect(q, String(answer ?? ""));

  // Écriture atomique : ne passe que si personne n'a encore répondu à ce tour.
  const { data: closed } = await db.from("turns")
    .update({ answered_at: new Date(now).toISOString(), given: String(answer ?? ""), correct, elapsed_ms: elapsed, quality: correct ? qualityFor(elapsed) : 0 })
    .eq("id", turnId).is("answered_at", null).select("id");
  if (!closed?.length) return json({ error: "Déjà répondu." }, 409);

  const game = await applyTurn(g, me.seat, correct, elapsed);
  return json({ correct, elapsedMs: elapsed, quality: correct ? qualityFor(elapsed) : 0, answer: q.answer, explain: q.explain, choices: q.choices, game });
}
