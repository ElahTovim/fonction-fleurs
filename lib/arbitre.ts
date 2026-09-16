// L'arbitre : la seule chose qui écrit dans la base. Tourne chez Vercel, jamais sur un téléphone.
import { admin } from "./supabaseAdmin";
import { type BotLevel, botDraw, type Game, QUALITY_ARTICLED, qualityFor, settleRound } from "./game";
import { randomQuestion, toPublic } from "./questions";

export async function loadGame(code: string): Promise<Game | null> {
  const { data } = await admin().from("games").select("*").eq("code", code).maybeSingle();
  return (data as Game) ?? null;
}

export async function seatOf(code: string, token: string): Promise<{ seat: 1 | 2; name: string } | null> {
  const { data } = await admin().from("players").select("seat,name").eq("game_code", code).eq("token", token).maybeSingle();
  return (data as { seat: 1 | 2; name: string }) ?? null;
}

export async function updateGame(code: string, patch: Partial<Game>): Promise<Game> {
  const { data, error } = await admin().from("games").update({ ...patch, updated_at: new Date().toISOString() }).eq("code", code).select("*").single();
  if (error) throw error;
  return data as Game;
}

// Ouvre le tour du robot : tire la question et le temps de réflexion.
export async function startBotTurn(g: Game): Promise<Partial<Game>> {
  const { think: delay } = botDraw(g.bot_level as BotLevel);
  const q = randomQuestion();
  await admin().from("turns").insert({ game_code: g.code, seat: 2, round: g.round, question: q });
  return {
    question_public: toPublic(q),
    bot_due_at: new Date(Date.now() + delay).toISOString(),
    bot_delay_ms: delay,
  };
}

// Applique le résultat d'un tour et fait avancer la partie.
// `botQuality` n'est passé que pour le robot : sa fleur vient de son niveau,
// pas de son temps de réflexion, qui n'est qu'une courte pause d'affichage.
export async function applyTurn(g: Game, seat: 1 | 2, correct: boolean, elapsedMs: number, botQuality?: 1 | 2 | 3): Promise<Game> {
  const name = seat === 1 ? g.p1_name : g.p2_name;
  const quality = correct ? (botQuality ?? qualityFor(elapsedMs)) : 0;
  const secs = Math.round(elapsedMs / 1000);
  const patch: Partial<Game> = {
    last_event: correct
      ? botQuality
        ? `${name} a répondu juste : ${QUALITY_ARTICLED[quality]}.`
        : `${name} a répondu juste en ${secs} s : ${QUALITY_ARTICLED[quality]}.`
      : `${name} s'est trompé. Pas de fleur.`,
    question_public: null,
    bot_due_at: null,
    bot_delay_ms: null,
  };
  const flowersKey = seat === 1 ? "p1_flowers" : "p2_flowers";
  const flowers = [...g[flowersKey], ...(correct ? [quality] : [])];
  patch[flowersKey] = flowers;

  if (seat === 1) {
    patch.turn_seat = 2;
    if (g.mode === "solo") Object.assign(patch, await startBotTurn({ ...g, ...patch } as Game));
  } else {
    const verdict = settleRound({ ...g, [flowersKey]: flowers });
    if (verdict.finished) {
      patch.status = "finished";
      patch.winner_seat = verdict.winner;
      patch.last_event = verdict.winner === 0
        ? "Égalité parfaite : deux bouquets aussi beaux."
        : `${verdict.winner === 1 ? g.p1_name : g.p2_name} a terminé son bouquet !`;
    } else {
      patch.round = g.round + 1;
      patch.turn_seat = 1;
    }
  }
  return updateGame(g.code, patch);
}

export function json(body: unknown, status = 200) {
  return Response.json(body, { status });
}
