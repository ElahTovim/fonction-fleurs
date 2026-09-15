import { admin } from "@/lib/supabaseAdmin";
import { applyTurn, json, loadGame } from "@/lib/arbitre";
import { BOT, type BotLevel } from "@/lib/game";

// Le robot joue : appelé par la page quand l'heure prévue est passée. Avant l'heure, rien.
export async function POST(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const g = await loadGame(code);
  if (!g) return json({ error: "Partie introuvable." }, 404);
  if (g.mode !== "solo" || g.status !== "playing" || g.turn_seat !== 2 || !g.bot_due_at) return json({ game: g });
  if (Date.now() < new Date(g.bot_due_at).getTime()) return json({ game: g, wait: true });

  const db = admin();
  const { data: turn } = await db.from("turns").select("id").eq("game_code", code).eq("seat", 2).eq("round", g.round).is("answered_at", null).maybeSingle();
  if (!turn) return json({ game: g });
  const correct = Math.random() < BOT[g.bot_level as BotLevel].accuracy;
  const elapsed = g.bot_delay_ms ?? 30_000;
  const { data: closed } = await db.from("turns").update({ answered_at: new Date().toISOString(), given: "robot", correct, elapsed_ms: elapsed })
    .eq("id", turn.id).is("answered_at", null).select("id");
  if (!closed?.length) return json({ game: await loadGame(code) });
  const game = await applyTurn(g, 2, correct, elapsed);
  return json({ game });
}
