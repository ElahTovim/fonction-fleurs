import { admin } from "@/lib/supabaseAdmin";
import { json, loadGame, seatOf } from "@/lib/arbitre";
import { BOT, BOUQUET_SIZE, type BotLevel } from "@/lib/game";

/** Le code de la revanche se déduit du code de la partie : ABCDE puis ABCDER,
 *  puis ABCDERR. Les deux joueurs peuvent donc la trouver sans qu'on ait à
 *  écrire un lien quelque part : chacun sait où regarder. */
export const codeRevanche = (code: string) => code + "R";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { token } = await req.json();
  const g = await loadGame(code);
  if (!g) return json({ error: "Partie introuvable." }, 404);
  if (g.status !== "finished") return json({ error: "La partie n'est pas terminée." }, 409);
  const me = await seatOf(code, token);
  if (!me) return json({ error: "Vous n'étiez pas dans cette partie." }, 403);

  const suivant = codeRevanche(code);
  const db = admin();
  const deja = await loadGame(suivant);
  if (deja) return json({ code: suivant });      // quelqu'un a déjà cliqué

  const { data: joueurs } = await db.from("players")
    .select("seat,name,token").eq("game_code", code).order("seat");
  if (!joueurs?.length) return json({ error: "Joueurs introuvables." }, 500);

  // Les mêmes noms, les mêmes jetons, donc les mêmes sièges et les mêmes
  // palettes : la revanche se joue sans que personne ait à se reconnecter.
  const { error } = await db.from("games").insert({
    code: suivant,
    status: g.mode === "solo" ? "playing" : "playing",
    mode: g.mode,
    bot_level: g.bot_level,
    bouquet_size: BOUQUET_SIZE,
    p1_name: g.p1_name,
    p2_name: g.p2_name,
    last_event: "Revanche. À " + g.p1_name + " de jouer.",
  });
  if (error) return json({ error: error.message }, 500);

  await db.from("players").insert(
    joueurs.filter((j) => j.token).map((j) => ({
      game_code: suivant, seat: j.seat, name: j.name, token: j.token,
    }))
  );

  if (g.mode === "solo" && !g.bot_level) return json({ error: "Niveau du robot inconnu." }, 500);
  void BOT; void (g.bot_level as BotLevel | null);
  return json({ code: suivant });
}
