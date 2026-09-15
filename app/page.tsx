"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getName, getToken, setName as saveName } from "@/lib/identity";
import { BOT } from "@/lib/game";
import { Flower } from "@/components/Flower";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [level, setLevel] = useState<1 | 2 | 3>(2);
  const [busy, setBusy] = useState<"duo" | "solo" | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { setName(getName()); }, []);

  async function create(mode: "duo" | "solo") {
    if (!name.trim()) { setError("Ton prénom d'abord."); return; }
    setBusy(mode); setError("");
    saveName(name.trim());
    const res = await fetch("/api/games", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), token: getToken(), mode, botLevel: level }) });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Erreur."); setBusy(null); return; }
    router.push(`/p/${data.code}`);
  }

  return (
    <main className="shell">
      <header className="brand">
        <span className="brand__title">Jeu des fleurs</span>
        <span className="brand__sub">maths de l'IA</span>
      </header>

      <section className="card stack">
        <p className="muted">Une question sur les dix notions du cours. Réponse juste : une fleur. Plus tu réponds vite, plus elle est belle. Premier bouquet de cinq fleurs gagne.</p>
        <div className="legend">
          <div><Flower quality={3} index={0} size={44} />moins de 20 s</div>
          <div><Flower quality={2} index={1} size={44} />moins de 45 s</div>
          <div><Flower quality={1} index={2} size={44} />au-delà</div>
        </div>
      </section>

      <section className="card stack">
        <label className="tag" htmlFor="name">Ton prénom</label>
        <input id="name" className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Léa" maxLength={20} autoComplete="given-name" />
        {error && <p className="small" style={{ color: "var(--danger)" }}>{error}</p>}
        <button className="btn" disabled={!!busy} onClick={() => create("duo")}>{busy === "duo" ? "Création…" : "Défier un ami"}</button>
        <p className="muted small">Tu recevras un lien à envoyer. Il ne faut aucun compte.</p>
      </section>

      <section className="card stack">
        <span className="tag">Ou jouer seul</span>
        <div className="chips">
          {([1, 2, 3] as const).map(l => (
            <button key={l} className={`chip ${level === l ? "chip--on" : ""}`} onClick={() => setLevel(l)}>{BOT[l].name.replace("Robot ", "")}</button>
          ))}
        </div>
        <button className="btn btn--ghost" disabled={!!busy} onClick={() => create("solo")}>{busy === "solo" ? "Création…" : `Contre ${BOT[level].name}`}</button>
      </section>
    </main>
  );
}
