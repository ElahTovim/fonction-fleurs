import { admin } from "@/lib/supabaseAdmin";
import { json, loadGame, seatOf, updateGame } from "@/lib/arbitre";
import { randomQuestion, toPublic, type Question } from "@/lib/questions";

const since = (iso: string) => Math.max(0, Date.now() - new Date(iso).getTime());

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
  // `elapsedMs` plutôt que l'heure de départ : la page recale son chrono sur
  // le serveur sans dépendre de l'heure du téléphone, et une page rouverte
  // en cours de tour retrouve le bon temps restant.
  if (open) return json({ turnId: open.id, question: toPublic(open.question as Question), elapsedMs: since(open.revealed_at) });

  // Les notions que ce joueur a déjà manquées dans cette partie reviendront
  // plus souvent : le jeu s'ajuste à ce qui lui résiste.
  const { data: ratees } = await db.from("turns").select("question")
    .eq("game_code", code).eq("seat", me.seat).eq("correct", false);
  const aRevoir = [...new Set((ratees ?? []).map((t) => (t.question as Question).lesson))];
  // La notion du tour précédent ne revient pas tout de suite.
  const { data: avant } = await db.from("turns").select("question")
    .eq("game_code", code).eq("seat", me.seat).order("revealed_at", { ascending: false }).limit(1);
  const derniere = avant?.length ? (avant[0].question as Question).lesson : 0;
  const q = randomQuestion(aRevoir, derniere);
  const { data: turn, error } = await db.from("turns").insert({ game_code: code, seat: me.seat, round: g.round, question: q }).select("id,revealed_at").single();
  if (error) return json({ error: error.message }, 500);
  await updateGame(code, { question_public: toPublic(q) });
  return json({ turnId: turn.id, question: toPublic(q), elapsedMs: since(turn.revealed_at) });
}
