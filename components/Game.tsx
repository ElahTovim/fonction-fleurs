"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getName, getToken, setName as saveName } from "@/lib/identity";
import { type Game as G, QUALITY_ARTICLED, QUALITY_LABEL, SPEED_TIERS_MS } from "@/lib/game";
import type { PublicQuestion } from "@/lib/questions";
import { Bouquet } from "./Bouquet";
import { Flower } from "./Flower";

type Turn = { turnId: string; question: PublicQuestion; startedAt: number };
type Result = { correct: boolean; elapsedMs: number; quality: number; answer: string; explain: string; choices?: string[] };

const post = async (url: string, body: unknown) => {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { ok: r.ok, data: await r.json() };
};

const RING = 2 * Math.PI * 26;

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
          <span className="masthead__title">Fonction fleurs</span>
          <span className="masthead__meta">partie <span className="num">{code}</span></span>
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
        <p className="question">Cette partie n&apos;existe pas.</p>
        <p className="lede">Vérifiez le lien reçu, ou lancez la vôtre.</p>
        <a className="btn" href="/" style={{ textDecoration: "none", textAlign: "center" }}>Créer une partie</a>
      </main>
    );
  }
  if (!game || seat === null) return <main className="sheet"><p className="lede">Connexion à la partie.</p></main>;

  const myTurn = game.status === "playing" && game.turn_seat === seat;
  const opponent = seat === 1 ? game.p2_name : game.p1_name;
  const elapsedMs = turn ? Math.max(0, Date.now() - turn.startedAt) : 0;
  const secs = Math.floor(elapsedMs / 1000);
  const tier = elapsedMs <= SPEED_TIERS_MS.epanouie ? 3 : elapsedMs <= SPEED_TIERS_MS.fleur ? 2 : 1;
  const tierColor = tier === 3 ? "var(--accent)" : tier === 2 ? "var(--amber)" : "var(--clay)";
  const myFlowers = seat === 2 ? game.p2_flowers : game.p1_flowers;

  return (
    <main className="sheet">
      <header className="masthead">
        <span className="masthead__title">Fonction fleurs</span>
        <span className="masthead__meta">
          partie <span className="num">{code}</span>, manche <span className="num">{game.round}</span>
        </span>
      </header>

      <Bouquet name={game.p1_name ?? "Joueur 1"} flowers={game.p1_flowers} size={game.bouquet_size} active={game.status === "playing" && game.turn_seat === 1} mine={seat === 1} />
      <Bouquet name={game.p2_name ?? "En attente"} flowers={game.p2_flowers} size={game.bouquet_size} active={game.status === "playing" && game.turn_seat === 2} mine={seat === 2} />

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
            <div className="thinking"><span className="thinking__dot" />La partie va commencer.</div>
          )}
        </section>
      )}

      {game.status === "playing" && seat === 0 && (
        <section className="panel">
          <p className="panel__kicker">Les deux places sont prises, vous regardez.</p>
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
          <div className="thinking">
            <span className="thinking__dot" />
            {game.mode === "solo" ? `${opponent} cherche` : `Au tour de ${opponent}`}
          </div>
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
              <Flower quality={result.quality as 1 | 2 | 3} index={myFlowers.length - 1} size={78} bloom />
              <p className="verdict__line">Juste, en <span className="num">{Math.round(result.elapsedMs / 1000)}</span> s</p>
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
          <button className="btn" disabled={busy} onClick={ready}>{busy ? "Tirage de la question" : "Voir la question"}</button>
        </section>
      )}

      {myTurn && turn && (
        <section className="panel">
          <div className="qhead">
            <div>
              <p className="panel__kicker">{turn.question.notion}</p>
              <p className="source">leçon <span className="num">{turn.question.lesson}</span></p>
            </div>
            <div>
              <div className="timer">
                <svg width="62" height="62" viewBox="0 0 62 62" aria-hidden="true">
                  <circle className="timer__track" cx="31" cy="31" r="26" fill="none" strokeWidth="4" />
                  <circle
                    className="timer__arc"
                    cx="31" cy="31" r="26" fill="none" strokeWidth="4" strokeLinecap="round"
                    stroke={tierColor}
                    strokeDasharray={RING}
                    strokeDashoffset={RING * (1 - Math.min(elapsedMs / SPEED_TIERS_MS.fleur, 1))}
                  />
                </svg>
                <span className="timer__value" style={{ color: tierColor }}>{secs}</span>
              </div>
              <p className="timer__tier">{QUALITY_LABEL[tier]}</p>
            </div>
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
                <button
                  type="button" className="sign" aria-label="Changer le signe de la réponse"
                  onClick={() => setInput((v) => (v.startsWith("-") ? v.slice(1) : "-" + v))}
                >
                  ±
                </button>
              </div>
              <button className="btn" type="submit" disabled={busy || !input.trim()}>Valider</button>
            </form>
          )}
        </section>
      )}

      {game.status === "finished" && (
        <section className="panel finale">
          <p className="panel__kicker">Partie terminée</p>
          <p className="finale__name">{game.winner_seat === 0 ? "Égalité" : game.winner_seat === 1 ? game.p1_name : game.p2_name}</p>
          <p className="lede">
            {game.winner_seat === 0 ? "Deux bouquets d'égale beauté." : game.winner_seat === seat ? "Vous gagnez." : "l'emporte."}
          </p>
          <a className="btn" href="/" style={{ textDecoration: "none", textAlign: "center" }}>Nouvelle partie</a>
        </section>
      )}

      {game.last_event && <p className="log">{game.last_event}</p>}
      {error && <p className="source" style={{ color: "var(--clay)" }} role="alert">{error}</p>}
    </main>
  );
}
