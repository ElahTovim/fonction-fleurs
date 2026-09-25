"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getName, getToken, setName as saveName } from "@/lib/identity";
import { type Game as G, QUALITY_ARTICLED, QUALITY_LABEL, SPEED_TIERS_MS } from "@/lib/game";
import { assetsOf, paletteOf, videoSrc } from "@/lib/fleurs";
import type { PublicQuestion } from "@/lib/questions";
import { Bouquet } from "./Bouquet";
import { Flower } from "./Flower";

type Turn = { turnId: string; question: PublicQuestion; startedAt: number };
type Result = { correct: boolean; elapsedMs: number; quality: number; answer: string; explain: string; choices?: string[] };

const post = async (url: string, body: unknown) => {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { ok: r.ok, data: await r.json() };
};

export function Game({ code }: { code: string }) {
  const [game, setGame] = useState<G | null>(null);
  const [seat, setSeat] = useState<0 | 1 | 2 | null>(null);
  const [name, setName] = useState("");
  const [draft, setDraft] = useState("");
  const [turn, setTurn] = useState<Turn | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [, setTick] = useState(0);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const token = useRef("");

  // 1. Rejoindre avec le jeton de l'appareil : même jeton, même siège.
  const join = useCallback(async (n: string) => {
    token.current = getToken();
    const { ok, data } = await post(`/api/games/${code}/join`, { name: n, token: token.current });
    if (!ok) { setError(data.error ?? "Partie introuvable."); return; }
    setSeat(data.seat);
    setGame(data.game);
  }, [code]);

  useEffect(() => {
    const n = getName();
    setName(n);
    if (n) join(n);
  }, [join]);

  // 2. Mise à jour pour tous : Supabase pousse chaque changement de la partie.
  //    Le sondage de secours couvre le cas où la connexion temps réel tombe.
  useEffect(() => {
    const ch = supabase
      .channel(`game-${code}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "games", filter: `code=eq.${code}` }, (p) => setGame(p.new as G))
      .subscribe();
    const poll = setInterval(async () => {
      const r = await fetch(`/api/games?code=${code}`);
      if (r.ok) setGame(await r.json());
    }, 5000);
    const tick = setInterval(() => setTick((t) => t + 1), 250);
    return () => { supabase.removeChannel(ch); clearInterval(poll); clearInterval(tick); };
  }, [code]);

  // 3. Solo : la pause du robot écoulée, la page demande à l'arbitre de le faire jouer.
  useEffect(() => {
    if (!game || game.mode !== "solo" || game.turn_seat !== 2 || !game.bot_due_at || seat !== 1) return;
    const due = new Date(game.bot_due_at).getTime();
    const t = setTimeout(async () => {
      const { data } = await post(`/api/games/${code}/bot`, {});
      if (data.game) setGame(data.game);
    }, Math.max(0, due - Date.now()) + 250);
    return () => clearTimeout(t);
  }, [game, code, seat]);

  useEffect(() => { if (game && game.turn_seat !== seat) setTurn(null); }, [game, seat]);

  // 4. Les corolles de ma palette sont chargées d'avance : une fleur gagnée
  //    ne doit jamais apparaître en deux temps.
  useEffect(() => {
    if (!seat) return; // ni spectateur (0), ni encore rejoint (null)
    assetsOf(paletteOf(seat)).forEach((src) => { const i = new Image(); i.src = src; });
  }, [seat]);

  async function ready() {
    setBusy(true);
    setError("");
    setResult(null);
    setInput("");
    const { ok, data } = await post(`/api/games/${code}/question`, { token: token.current });
    setBusy(false);
    if (!ok) { setError(data.error); return; }
    setTurn({ turnId: data.turnId, question: data.question, startedAt: Date.now() });
  }

  async function answer(value: string) {
    if (!turn || busy) return;
    setBusy(true);
    const { ok, data } = await post(`/api/games/${code}/answer`, { token: token.current, turnId: turn.turnId, answer: value });
    setBusy(false);
    if (!ok) { setError(data.error); setTurn(null); return; }
    setResult(data);
    setTurn(null);
    setGame(data.game);
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: "Fonction fleurs", text: `${name} vous défie.`, url }); return; } catch {}
    }
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  }

  // Première visite sur cet appareil : on demande le prénom, rien d'autre.
  if (!name) {
    return (
      <main className="sheet">
        <header className="masthead">
          <span className="wordmark">Fonction fleurs</span>
          <span className="meta">partie {code}</span>
        </header>
        <h1 className="display">On vous a passé<br />le lien.</h1>
        <div className="field">
          <label className="field__label" htmlFor="name">Votre prénom pour rejoindre</label>
          <input id="name" className="input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Comment on vous appelle" maxLength={20} enterKeyHint="go" />
        </div>
        <button className="btn" disabled={!draft.trim()} onClick={() => { saveName(draft.trim()); setName(draft.trim()); join(draft.trim()); }}>
          Rejoindre la partie
        </button>
        {error && <p className="source" style={{ color: "var(--clay)" }} role="alert">{error}</p>}
      </main>
    );
  }

  if (error && !game) {
    return (
      <main className="sheet">
        <h1 className="display">Cette partie<br />n&apos;existe pas.</h1>
        <p className="lede">Vérifiez le lien reçu, ou lancez la vôtre.</p>
        <a className="btn" href="/" style={{ textDecoration: "none", textAlign: "center" }}>Créer une partie</a>
      </main>
    );
  }
  if (!game || seat === null) return <main className="sheet"><p className="attente">Connexion à la partie</p></main>;

  // Fin de partie : le plan prend tout l'écran. Ma palette, mon issue.
  if (game.status === "finished") {
    const gagne = game.winner_seat === 0 || game.winner_seat === seat;
    const issue = seat === 0 || gagne ? "victoire" : "defaite";
    const pal = paletteOf(seat === 0 ? ((game.winner_seat || 1) as 1 | 2) : seat);
    const nomGagnant = game.winner_seat === 1 ? game.p1_name : game.p2_name;
    return (
      <main className="fin">
        <video className="fin__video" src={videoSrc(pal, issue)} autoPlay muted playsInline preload="auto" />
        <div className="fin__texte">
          <p className="kicker">Partie terminée</p>
          <p className="fin__nom">{game.winner_seat === 0 ? "Égalité" : nomGagnant}</p>
          <p className="fin__quoi">
            {game.winner_seat === 0
              ? "Deux bouquets d'égale beauté."
              : gagne
                ? "Votre bouquet est complet."
                : "a terminé son bouquet avant vous."}
          </p>
          <a className="btn" href="/" style={{ textDecoration: "none", textAlign: "center" }}>Nouvelle partie</a>
        </div>
      </main>
    );
  }

  const myTurn = game.turn_seat === seat && game.status === "playing";
  const opponent = seat === 1 ? game.p2_name : game.p1_name;
  const elapsedMs = turn ? Math.max(0, Date.now() - turn.startedAt) : 0;
  const secs = Math.floor(elapsedMs / 1000);
  const tier = elapsedMs <= SPEED_TIERS_MS.epanouie ? 3 : elapsedMs <= SPEED_TIERS_MS.fleur ? 2 : 1;
  const maPalette = paletteOf(seat === 0 ? 1 : seat);
  const mesFleurs = seat === 2 ? game.p2_flowers : game.p1_flowers;

  return (
    <main className="sheet">
      <header className="masthead">
        <span className="wordmark">Fonction fleurs</span>
        <span className="meta">partie {code}, manche {game.round}</span>
      </header>

      <Bouquet name={game.p1_name ?? "Joueur 1"} flowers={game.p1_flowers} size={game.bouquet_size}
        active={game.turn_seat === 1} mine={seat === 1} palette={paletteOf(1)} />
      <Bouquet name={game.p2_name ?? "En attente"} flowers={game.p2_flowers} size={game.bouquet_size}
        active={game.turn_seat === 2} mine={seat === 2} palette={paletteOf(2)} />

      {game.status === "lobby" && (
        <section className="panel">
          {seat === 1 ? (
            <>
              <h2 className="question">Envoyez ce lien.</h2>
              <p className="lede">La première personne qui l&apos;ouvre et donne son prénom prend la seconde place.</p>
              <p className="share">{typeof window !== "undefined" ? window.location.href : ""}</p>
              <button className="btn" onClick={share}>{copied ? "Lien copié" : "Partager le lien"}</button>
            </>
          ) : (
            <p className="attente">La partie va commencer</p>
          )}
        </section>
      )}

      {game.status === "playing" && seat === 0 && (
        <section className="panel">
          <p className="kicker">Spectateur</p>
          <p className="lede">Les deux places sont prises, vous regardez.</p>
          {game.question_public && (
            <>
              <p className="question">{game.question_public.text}</p>
              {game.question_public.data && <p className="data">{game.question_public.data}</p>}
            </>
          )}
        </section>
      )}

      {game.status === "playing" && seat !== 0 && !myTurn && !result && (
        <section className="panel">
          <p className="attente">{game.mode === "solo" ? `${opponent} cherche` : `Au tour de ${opponent}`}</p>
          {game.question_public && (
            <>
              <p className="source">Sa question, pour vous entraîner en attendant.</p>
              <p className="question">{game.question_public.text}</p>
              {game.question_public.data && <p className="data">{game.question_public.data}</p>}
            </>
          )}
        </section>
      )}

      {result && (
        <section className={`panel verdict ${result.correct ? "verdict--ok" : "verdict--ko"}`}>
          {result.correct ? (
            <>
              <Flower palette={maPalette} index={mesFleurs.length - 1} quality={result.quality as 1 | 2 | 3} size={150} grande entrante />
              <p className="verdict__line">Juste, en <span className="chiffre">{Math.round(result.elapsedMs / 1000)}</span> s</p>
              <p className="lede">Vous gagnez {QUALITY_ARTICLED[result.quality]}.</p>
            </>
          ) : (
            <>
              <p className="verdict__line">Raté.</p>
              <p className="lede">
                La réponse était {result.choices ? result.choices[Number(result.answer)] : result.answer.replace(".", ",")}.
              </p>
            </>
          )}
          <p className="verdict__why">{result.explain}</p>
          <button className="btn btn--quiet" onClick={() => (myTurn ? ready() : setResult(null))}>
            {myTurn ? "Question suivante" : "Continuer"}
          </button>
        </section>
      )}

      {myTurn && !result && !turn && (
        <section className="panel">
          <h2 className="question">À vous.</h2>
          <p className="lede">Le chronomètre part quand la question s&apos;affiche, pas avant.</p>
          <button className="btn" disabled={busy} onClick={ready}>{busy ? "Tirage" : "Voir la question"}</button>
        </section>
      )}

      {myTurn && turn && (
        <section className="panel">
          <div className="qhead">
            <p className="kicker">{turn.question.notion}, leçon {turn.question.lesson}</p>
            <p className="chrono">
              <span className="chrono__n">{secs}</span>
              <span className="chrono__mot">{QUALITY_LABEL[tier]}</span>
            </p>
          </div>

          <p className="question">{turn.question.text}</p>
          {turn.question.data && <p className="data">{turn.question.data}</p>}

          {turn.question.kind === "choice" ? (
            <div className="choices">
              {turn.question.choices!.map((c, i) => (
                <button key={i} className="choice" disabled={busy} onClick={() => answer(String(i))}>{c}</button>
              ))}
            </div>
          ) : (
            <form className="panel" onSubmit={(e) => { e.preventDefault(); if (input.trim()) answer(input); }}>
              {/* Le pavé numérique des téléphones n'a pas de signe moins,
                  et beaucoup de réponses sont négatives. D'où ce bouton. */}
              <div className="answer">
                <input
                  className="input" inputMode="decimal" autoFocus value={input}
                  onChange={(e) => setInput(e.target.value)} placeholder="Votre réponse" enterKeyHint="send"
                />
                <button type="button" className="sign" aria-label="Changer le signe de la réponse"
                  onClick={() => setInput((v) => (v.startsWith("-") ? v.slice(1) : "-" + v))}>
                  ±
                </button>
              </div>
              <button className="btn" type="submit" disabled={busy || !input.trim()}>Valider</button>
            </form>
          )}
        </section>
      )}

      {game.last_event && <p className="log">{game.last_event}</p>}
      {error && <p className="source" style={{ color: "var(--clay)" }} role="alert">{error}</p>}
    </main>
  );
}
