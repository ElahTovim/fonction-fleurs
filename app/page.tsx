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

  return (
    <main className="sheet">
      <header className="masthead">
        <span className="wordmark">Fonction fleurs</span>
        <span className="meta">les maths de l&apos;IA</span>
      </header>

      <img className="accueil" src="/fleurs/accueil.webp" alt="" width={1000} height={672} fetchPriority="high" />

      <h1 className="display">Une équation juste,<br />une fleur de plus.</h1>
      <p className="lede">
        Chacun son tour, une question tirée des dix notions du cours. Plus la réponse arrive vite,
        plus la fleur est belle. Le premier bouquet de cinq fleurs gagne.
      </p>

      {/* La même espèce aux trois étages : ce qui change, c'est l'ouverture. */}
      <div className="legende">
        <figure>
          <Flower palette="a" index={0} quality={3} size={62} />
          <figcaption>moins de 20 s</figcaption>
        </figure>
        <figure>
          <Flower palette="a" index={0} quality={2} size={62} />
          <figcaption>moins de 45 s</figcaption>
        </figure>
        <figure>
          <Flower palette="a" index={0} quality={1} size={62} />
          <figcaption>au delà</figcaption>
        </figure>
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
        />
        {error && <p className="source" style={{ color: "var(--clay)" }} role="alert">{error}</p>}
      </div>

      <button className="btn" disabled={!!busy} onClick={() => create("duo")}>
        {busy === "duo" ? "Création" : "Défier quelqu'un"}
      </button>
      <p className="source" style={{ marginTop: -18 }}>
        Vous recevrez un lien à envoyer. Aucun compte à créer, ni pour vous ni pour l&apos;autre joueur.
      </p>

      <div className="field">
        <span className="field__label">Ou jouer seul, contre la machine</span>
        <div className="segments" role="group" aria-label="Niveau du robot">
          {([1, 2, 3] as const).map((l) => (
            <button key={l} className="segment" aria-pressed={level === l} onClick={() => setLevel(l)}>
              {BOT[l].name.replace("Robot ", "")}
            </button>
          ))}
        </div>
      </div>
      <button className="btn btn--quiet" disabled={!!busy} onClick={() => create("solo")}>
        {busy === "solo" ? "Création" : `Affronter le ${BOT[level].name.replace("Robot ", "robot ")}`}
      </button>
    </main>
  );
}
