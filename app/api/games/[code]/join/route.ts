import { admin } from "@/lib/supabaseAdmin";
import { json, loadGame, seatOf, updateGame } from "@/lib/arbitre";

// Rejoindre : même jeton → même siège ; siège 2 libre → on le prend ; sinon spectateur.
export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { name, token } = await req.json();
  const g = await loadGame(code);
  if (!g) return json({ error: "Partie introuvable." }, 404);
  const already = await seatOf(code, token);
  if (already) return json({ seat: already.seat, game: g });
  if (g.mode === "duo" && g.status === "lobby" && name?.trim()) {
    const clean = name.trim().slice(0, 20);
    const { error } = await admin().from("players").insert({ game_code: code, seat: 2, name: clean, token });
    if (!error) {
      const game = await updateGame(code, { p2_name: clean, status: "playing", turn_seat: 1, last_event: `${clean} a rejoint. ${g.p1_name} commence.` });
      return json({ seat: 2, game });
    }
  }
  return json({ seat: 0, game: g }); // spectateur : le lien a circulé, rien ne se passe
}
