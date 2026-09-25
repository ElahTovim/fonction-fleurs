"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getName, getToken, setName as saveName } from "@/lib/identity";
import { BOT } from "@/lib/game";

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

  // Tout tient sur un écran : le plan d'ouverture a déjà montré les fleurs,
  // cette page ne sert plus qu'à entrer son prénom et partir.
  return (
    <main className="sheet sheet--compact">
      <header className="masthead">
        <span className="wordmark">Fonction fleurs</span>
        <span className="meta">les maths de l&apos;IA</span>
      </header>

      <div className="accroche">
        <h1 className="display">Une équation juste,<br />une fleur de plus.</h1>
        <p className="lede">
          Chacun son tour. Plus la réponse arrive vite, plus la fleur est belle.
          Le premier bouquet de cinq gagne.
        </p>
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
        <span className="field__label">Ou seul, contre la machine</span>
        <div className="segments" role="group" aria-label="Niveau du robot">
          {([1, 2, 3] as const).map((l) => (
            <button key={l} className="segment" aria-pressed={level === l} onClick={() => setLevel(l)}>
              {BOT[l].name.replace("Robot ", "")}
            </button>
          ))}
        </div>
        <button className="btn btn--quiet" disabled={!!busy} onClick={() => create("solo")}>
          {busy === "solo" ? "Création" : "Jouer contre le robot"}
        </button>
      </div>
    </main>
  );
}
