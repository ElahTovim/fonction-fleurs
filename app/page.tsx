"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
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

  useEffect(() => setName(getName()), []);

  async function create(mode: "duo" | "solo") {
    if (!name.trim()) { setError("Votre prénom d'abord."); return; }
    setBusy(mode);
    setError("");
    saveName(name.trim());
    const res = await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), token: getToken(), mode, botLevel: level }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "La partie n'a pas pu être créée."); setBusy(null); return; }
    router.push(`/p/${data.code}`);
  }

  // Un seul écran, sans titre : le plan d'ouverture a déjà tout dit.
  // Une fleur, un prénom, deux façons de partir, et les bases en bas.
  return (
    <main className="sheet sheet--accueil">
      <header className="masthead">
        <span className="wordmark">Fonction fleurs</span>
        <span className="meta">les maths de l&apos;IA</span>
      </header>

      <div className="accueil__fleur">
        <Flower palette="a" index={0} quality={3} size={118} grande />
        <p className="source">Une question, une fleur. Premier bouquet de cinq.</p>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="name">Votre prénom</label>
        <input
          id="name"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Comment on vous appelle"
          maxLength={20}
          autoComplete="given-name"
          enterKeyHint="go"
          onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) create("duo"); }}
        />
        {error && <p className="source" style={{ color: "var(--clay)" }} role="alert">{error}</p>}
      </div>

      <button className="btn" disabled={!!busy} onClick={() => create("duo")}>
        {busy === "duo" ? "Création" : "Défier quelqu'un"}
      </button>

      <div className="solo">
        <div className="segments" role="group" aria-label="Niveau du robot">
          {([1, 2, 3] as const).map((l) => (
            <button key={l} className="segment" aria-pressed={level === l} onClick={() => setLevel(l)}>
              {BOT[l].name.replace("Robot ", "")}
            </button>
          ))}
        </div>
        <button className="btn btn--quiet" disabled={!!busy} onClick={() => create("solo")}>
          {busy === "solo" ? "Création" : "Jouer seul"}
        </button>
      </div>

      <Link className="lien-bas" href="/bases">Les bases</Link>
    </main>
  );
}
