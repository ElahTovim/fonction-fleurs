#!/usr/bin/env python3
"""Fabrique les plans de bouquet de Fonction fleurs.

Règle de direction artistique (DA-core.md) : RIEN n'apparaît en cours de plan.
Toutes les corolles sont présentes dès la première image ; seules leurs
positions changent. Le mouvement est donc calculé ici, image par image, et
aucun modèle génératif n'intervient : il inventerait des feuilles en route.

    python3 outils/bouquet.py
"""

from __future__ import annotations
import math, os, random, shutil, subprocess, sys
from PIL import Image, ImageFilter

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FLEURS = os.path.join(RACINE, "public", "fleurs")
PAPIER = (248, 241, 226)
L, H = 720, 1280          # rendu, l'encodage garde ces dimensions
FPS = 25

PALETTES = {
    "a": ["a-gerbera-pleine@2x.webp", "a-allium-pleine@2x.webp"],
    "b": ["b-souci-pleine@2x.webp", "b-agapanthe-pleine@2x.webp"],
    "intro": ["a-gerbera-pleine@2x.webp", "a-allium-pleine@2x.webp",
              "b-souci-pleine@2x.webp", "b-agapanthe-pleine@2x.webp"],
}


def sortie(t: float) -> float:
    """Décélération : vif au départ, posé à l'arrivée."""
    return 1 - pow(1 - t, 3)


def plan_bouquet(n: int, graine: int):
    """Positions d'arrivée : une rosette DENSE. Les rayons sont calés sur le
    diamètre des corolles pour qu'elles se chevauchent, comme dans un bouquet
    serré à la main, et non posées en cercle avec des trous entre elles."""
    rnd = random.Random(graine)
    cx, cy = L / 2, H * 0.43
    t_coeur, t1, t2 = 0.385, 0.350, 0.315
    d1, d2 = t1 * L, t2 * L                    # diamètres des deux couronnes
    r1, r2 = d1 * 0.60, d2 * 1.10              # chevauchement garanti
    places = [(cx, cy, t_coeur, 0)]            # le coeur, au-dessus de tout
    couronnes = [(6, r1, t1), (n - 7, r2, t2)]
    for k, (combien, rayon, taille) in enumerate(couronnes):
        depart = rnd.uniform(0, math.tau)
        for i in range(combien):
            a = depart + math.tau * i / combien + rnd.uniform(-0.07, 0.07)
            places.append((
                cx + math.cos(a) * rayon * 0.88 + rnd.uniform(-9, 9),
                cy + math.sin(a) * rayon + rnd.uniform(-9, 9),
                taille + rnd.uniform(-0.022, 0.022),
                2 - k,                          # les couronnes passent derrière
            ))
    return places


def plan_disperse(places, graine: int):
    """Positions de départ : les mêmes fleurs, écartées en couronne large,
    toutes entièrement dans le cadre. Aucune n'entre ni ne sort du champ."""
    rnd = random.Random(graine + 99)
    cx, cy = L / 2, H * 0.47
    n = len(places)
    out = []
    for i, (_, _, taille, z) in enumerate(places):
        a = math.tau * i / n + rnd.uniform(-0.09, 0.09)
        rx, ry = L * 0.315, H * 0.335
        x = cx + math.cos(a) * rx * rnd.uniform(0.86, 1.0)
        y = cy + math.sin(a) * ry * rnd.uniform(0.86, 1.0)
        marge = taille * L * 0.5 + 6
        x = min(max(x, marge), L - marge)
        y = min(max(y, marge), H - marge)
        out.append((x, y, taille, z))
    return out


def charger(noms, n):
    """Une corolle par emplacement, les espèces alternées."""
    src = [Image.open(os.path.join(FLEURS, f)).convert("RGBA") for f in noms]
    return [src[i % len(src)] for i in range(n)]


def poser(toile, img, x, y, taille, angle, ombre=True):
    cote = max(8, int(taille * L))
    f = img.resize((cote, cote), Image.LANCZOS)
    if angle:
        f = f.rotate(angle, resample=Image.BICUBIC, expand=False)
    if ombre:
        # Ombre NOIRE uniquement (règle DA), douce et décalée vers le bas.
        sil = Image.new("RGBA", f.size, (0, 0, 0, 0))
        sil.putalpha(f.getchannel("A").point(lambda v: int(v * 0.38)))
        sil = sil.filter(ImageFilter.GaussianBlur(cote * 0.045))
        toile.alpha_composite(sil, (int(x - cote / 2) + 6, int(y - cote / 2) + 11))
    toile.alpha_composite(f, (int(x - cote / 2), int(y - cote / 2)))


def rendre(cle: str, sens: str, sortie_mp4: str, secondes=3.6, pause=1.4, n=12):
    noms = PALETTES[cle]
    graine = sum(map(ord, cle))
    fin = plan_bouquet(n, graine)
    debut = plan_disperse(fin, graine)
    corolles = charger(noms, n)
    if sens == "disperse":                 # la défaite : le bouquet se défait
        debut, fin = fin, debut
    ordre = sorted(range(n), key=lambda i: -fin[i][3])   # du fond vers l'avant

    tmp = os.path.join("/tmp", f"bouquet-{cle}-{sens}")
    shutil.rmtree(tmp, ignore_errors=True)
    os.makedirs(tmp)
    total = int(secondes * FPS)
    arret = int(pause * FPS)
    rnd = random.Random(graine)
    phases = [rnd.uniform(0, math.tau) for _ in range(n)]
    retards = [rnd.uniform(0, 0.34) for _ in range(n)]

    for k in range(total + arret):
        t = min(1.0, k / max(1, total - 1))
        toile = Image.new("RGBA", (L, H), PAPIER + (255,))
        for i in ordre:
            # chaque fleur part avec un léger retard : le bouquet se compose
            u = sortie(min(1.0, max(0.0, (t - retards[i]) / (1 - retards[i]))))
            x0, y0, s0, _ = debut[i]
            x1, y1, s1, _ = fin[i]
            x = x0 + (x1 - x0) * u
            y = y0 + (y1 - y0) * u
            s = s0 + (s1 - s0) * u
            # respiration des pétales : une oscillation lente, jamais une apparition
            temps = k / FPS
            angle = 2.1 * math.sin(temps * 1.5 + phases[i])
            s *= 1 + 0.012 * math.sin(temps * 1.9 + phases[i] * 1.7)
            poser(toile, corolles[i], x, y, s, angle)
        toile.convert("RGB").save(os.path.join(tmp, f"{k:04d}.png"))

    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS),
         "-i", os.path.join(tmp, "%04d.png"),
         "-c:v", "libx264", "-crf", "31", "-preset", "veryslow",
         "-pix_fmt", "yuv420p", "-movflags", "+faststart", sortie_mp4],
        check=True)
    shutil.rmtree(tmp, ignore_errors=True)
    ko = os.path.getsize(sortie_mp4) / 1024
    print(f"  {os.path.basename(sortie_mp4):16} {total + arret:3} images  {ko:5.0f} Ko")


if __name__ == "__main__":
    print("Plans de bouquet (rien n'apparaît en cours de plan) :")
    rendre("intro", "assemble", os.path.join(FLEURS, "intro.mp4"), secondes=3.4, pause=0.5, n=13)
    for p in ("a", "b"):
        rendre(p, "assemble", os.path.join(FLEURS, f"victoire-{p}.mp4"), secondes=3.8, pause=1.6, n=12)
        rendre(p, "disperse", os.path.join(FLEURS, f"defaite-{p}.mp4"), secondes=3.6, pause=1.0, n=12)
