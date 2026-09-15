"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getName, getToken, setName as saveName } from "@/lib/identity";
import { type Game as G, QUALITY_LABEL } from "@/lib/game";
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
  const [, setNow] = useState(Date.now()); // tic de rendu pour le chrono
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const token = useRef("");

  // 1. Rejoindre avec le jeton de l'appareil (même jeton = même siège).
  const join = useCallback(async (n: string) => {
    token.current = getToken();
    const { ok, data } = await post(`/api/games/${code}/join`, { name: n, token: token.current });
    if (!ok) { setError(data.error ?? "Partie introuvable."); return; }
    setSeat(data.seat); setGame(data.game);
  }, [code]);

  useEffect(() => {
    const n = getName();
    setName(n);
    if (n) join(n);
  }, [join]);

  // 2. Mise à jour pour tous : Supabase pousse chaque changement de la partie.
  //    Plus un sondage toutes les 5 s au cas où la connexion temps réel dort.
  useEffect(() => {
    const ch = supabase.channel(`game-${code}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "games", filter: `code=eq.${code}` }, p => setGame(p.new as G))
      .subscribe();
    const poll = setInterval(async () => {
      const r = await fetch(`/api/games?code=${code}`);
      if (r.ok) setGame(await r.json());
    }, 5000);
    const tick = setInterval(() => setNow(Date.now()), 250);
    return () => { supabase.removeChannel(ch); clearInterval(poll); clearInterval(tick); };
  }, [code]);

  // 3. Solo : quand l'heure du robot est passée, on demande à l'arbitre de le faire jouer.
  useEffect(() => {
    if (!game || game.mode !== "solo" || game.turn_seat !== 2 || !game.bot_due_at || seat !== 1) return;
    const due = new Date(game.bot_due_at).getTime();
    const t = setTimeout(async () => {
      const { data } = await post(`/api/games/${code}/bot`, {});
      if (data.game) setGame(data.game);
    }, Math.max(0, due - Date.now()) + 400);
    return () => clearTimeout(t);
  }, [game, code, seat]);

  // Quand le tour n'est plus à moi, on range la question.
  useEffect(() => {
    if (game && game.turn_seat !== seat) setTurn(null);
  }, [game, seat]);

  async function ready() {
    setBusy(true); setError(""); setResult(null); setInput("");
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
    setResult(data); setTurn(null); setGame(data.game);
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ title: "Jeu des fleurs", text: `${name} te défie !`, url }); return; } catch {} }
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  }

  // Écran prénom (première visite sur cet appareil).
  if (!name) {
    return (
      <main className="shell">
        <header className="brand"><span className="brand__title">Jeu des fleurs</span><span className="brand__sub">partie {code}</span></header>
        <section className="card stack">
          <label className="tag" htmlFor="name">Ton prénom pour rejoindre</label>
          <input id="name" className="input" value={draft} onChange={e => setDraft(e.target.value)} placeholder="Léa" maxLength={20} />
          <button className="btn" disabled={!draft.trim()} onClick={() => { saveName(draft.trim()); setName(draft.trim()); join(draft.trim()); }}>Rejoindre</button>
          {error && <p className="small" style={{ color: "var(--danger)" }}>{error}</p>}
        </section>
      </main>
    );
  }

  if (error && !game) return <main className="shell"><section className="card"><p>{error}</p><p className="muted small">Vérifie le lien, ou <a href="/">crée une partie</a>.</p></section></main>;
  if (!game || seat === null) return <main className="shell"><p className="muted pulse">Connexion à la partie…</p></main>;

  const myTurn = game.status === "playing" && game.turn_seat === seat;
  const opponent = seat === 1 ? game.p2_name : game.p1_name;
  const elapsed = turn ? Math.max(0, Math.floor((Date.now() - turn.startedAt) / 1000)) : 0;
  const botLeft = game.bot_due_at ? Math.max(0, Math.ceil((new Date(game.bot_due_at).getTime() - Date.now()) / 1000)) : 0;

  return (
    <main className="shell">
      <header className="brand">
        <span className="brand__title">Jeu des fleurs</span>
        <span className="brand__sub">partie {code} · manche {game.round}</span>
      </header>

      <Bouquet name={game.p1_name ?? "Joueur 1"} flowers={game.p1_flowers} size={game.bouquet_size} active={game.status === "playing" && game.turn_seat === 1} mine={seat === 1} />
      <Bouquet name={game.p2_name ?? "…"} flowers={game.p2_flowers} size={game.bouquet_size} active={game.status === "playing" && game.turn_seat === 2} mine={seat === 2} />

      {game.status === "lobby" && (
        <section className="card card--accent stack">
          <span className="tag">En attente d'un adversaire</span>
          {seat === 1 ? (
            <>
              <p>Envoie ce lien. La première personne qui l'ouvre et donne son prénom prend la place.</p>
              <div className="share">{typeof window !== "undefined" ? window.location.href : ""}</div>
              <button className="btn" onClick={share}>{copied ? "Lien copié !" : "Partager le lien"}</button>
            </>
          ) : <p className="pulse">La partie va commencer…</p>}
        </section>
      )}

      {game.status === "playing" && seat === 0 && (
        <section className="card stack"><span className="tag">Spectateur</span><p className="muted">Les deux places sont prises. Tu regardes.</p>{game.question_public && <p className="question">{game.question_public.text}</p>}</section>
      )}

      {game.status === "playing" && seat !== 0 && !myTurn && !result && (
        <section className="card stack">
          <span className="tag pulse">Au tour de {opponent}</span>
          {game.mode === "solo" && botLeft > 0 && <p className="muted">Le robot réfléchit… {botLeft} s</p>}
          {game.question_public && <><p className="muted small">Sa question, pour t'entraîner en attendant :</p><p className="question">{game.question_public.text}</p></>}
        </section>
      )}

      {result && (
        <section className={`card result ${result.correct ? "result--ok" : "result--ko"} stack`}>
          <div className="result__title">{result.correct ? `Juste, en ${Math.round(result.elapsedMs / 1000)} s !` : "Raté."}</div>
          {result.correct ? <div style={{ display: "flex", justifyContent: "center" }}><Flower quality={result.quality as 1 | 2 | 3} index={(seat === 1 ? game.p1_flowers : game.p2_flowers).length - 1} size={80} /></div> : null}
          <p>{result.correct ? `Tu gagnes une ${QUALITY_LABEL[result.quality]}.` : `La réponse était ${result.choices ? result.choices[Number(result.answer)] : result.answer.replace(".", ",")}.`}</p>
          <p className="explain">{result.explain}</p>
          <button className="btn btn--ghost" onClick={() => setResult(null)}>Continuer</button>
        </section>
      )}

      {myTurn && !result && !turn && (
        <section className="card card--accent stack">
          <span className="tag">À toi de jouer</span>
          <p>Le chrono démarre quand la question s'affiche. Moins de 20 s : fleur épanouie. Moins de 45 s : fleur. Au-delà : bouton.</p>
          <button className="btn" disabled={busy} onClick={ready}>{busy ? "…" : "Prêt, montre la question"}</button>
        </section>
      )}

      {myTurn && turn && (
        <section className="card stack">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="tag">{turn.question.notion} · leçon {turn.question.lesson}</span>
            <span className={`timer ${elapsed < 20 ? "timer--gold" : ""}`}>{elapsed} s</span>
          </div>
          <p className="question">{turn.question.text}</p>
          {turn.question.kind === "choice" ? (
            <div className="choices">
              {turn.question.choices!.map((c, i) => <button key={i} className="choice" disabled={busy} onClick={() => answer(String(i))}>{c}</button>)}
            </div>
          ) : (
            <form className="stack" onSubmit={e => { e.preventDefault(); if (input.trim()) answer(input); }}>
              <input className="input" inputMode="decimal" autoFocus value={input} onChange={e => setInput(e.target.value)} placeholder="Ta réponse" />
              <button className="btn" type="submit" disabled={busy || !input.trim()}>{busy ? "…" : "Valider"}</button>
            </form>
          )}
        </section>
      )}

      {game.status === "finished" && (
        <section className="card card--accent winner stack">
          <span className="tag">Partie terminée</span>
          <div className="winner__name">{game.winner_seat === 0 ? "Égalité" : game.winner_seat === 1 ? game.p1_name : game.p2_name}</div>
          <p>{game.winner_seat === 0 ? "Deux bouquets aussi beaux." : game.winner_seat === seat ? "Tu as gagné !" : "a gagné."}</p>
          <a className="btn" href="/" style={{ textDecoration: "none", display: "block", textAlign: "center" }}>Nouvelle partie</a>
        </section>
      )}

      {game.last_event && <p className="event">{game.last_event}</p>}
      {error && <p className="small" style={{ color: "var(--danger)" }}>{error}</p>}
    </main>
  );
}
