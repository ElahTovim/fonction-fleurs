import { admin } from "@/lib/supabaseAdmin";
import { BOT, BOUQUET_SIZE, type BotLevel, makeCode } from "@/lib/game";
import { json, loadGame, startBotTurn } from "@/lib/arbitre";

// Créer une partie. Le créateur prend le siège 1.
export async function POST(req: Request) {
  const { name, token, mode, botLevel } = await req.json();
  if (!name?.trim() || !token) return json({ error: "Prénom et jeton requis." }, 400);
  const solo = mode === "solo";
  const level = (solo ? Number(botLevel) || 2 : null) as BotLevel | null;
  const code = makeCode();
  const db = admin();
  const { error } = await db.from("games").insert({
    code,
    status: solo ? "playing" : "lobby",
    mode: solo ? "solo" : "duo",
    bot_level: level,
    bouquet_size: BOUQUET_SIZE,
    p1_name: name.trim().slice(0, 20),
    p2_name: solo ? BOT[level!].name : null,
    last_event: solo ? "La partie commence. À toi de jouer." : "En attente d'un adversaire…",
  });
  if (error) return json({ error: error.message }, 500);
  await db.from("players").insert({ game_code: code, seat: 1, name: name.trim().slice(0, 20), token });
  return json({ code });
}

export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code") ?? "";
  const g = await loadGame(code);
  return g ? json(g) : json({ error: "Partie introuvable." }, 404);
}
