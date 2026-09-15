import { admin } from "@/lib/supabaseAdmin";
import { json, loadGame, seatOf, updateGame } from "@/lib/arbitre";
import { randomQuestion, toPublic, type Question } from "@/lib/questions";

// Le joueur dit « Prêt » : l'arbitre révèle la question et démarre le chrono.
export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { token } = await req.json();
  const g = await loadGame(code);
  if (!g) return json({ error: "Partie introuvable." }, 404);
  const me = await seatOf(code, token);
  if (!me) return json({ error: "Tu n'es pas dans cette partie." }, 403);
  if (g.status !== "playing" || g.turn_seat !== me.seat) return json({ error: "Ce n'est pas ton tour." }, 409);

  const db = admin();
  // Un tour déjà ouvert pour ce joueur dans cette manche ? On le rend tel quel (le chrono continue).
  const { data: open } = await db.from("turns").select("id,question,revealed_at")
    .eq("game_code", code).eq("seat", me.seat).eq("round", g.round).is("answered_at", null).maybeSingle();
  if (open) return json({ turnId: open.id, question: toPublic(open.question as Question), revealedAt: open.revealed_at });

  const q = randomQuestion();
  const { data: turn, error } = await db.from("turns").insert({ game_code: code, seat: me.seat, round: g.round, question: q }).select("id,revealed_at").single();
  if (error) return json({ error: error.message }, 500);
  await updateGame(code, { question_public: toPublic(q) });
  return json({ turnId: turn.id, question: toPublic(q), revealedAt: turn.revealed_at });
}
