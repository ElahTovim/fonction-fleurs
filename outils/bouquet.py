#!/usr/bin/env python3
"""Fabrique les plans de bouquet de Fonction fleurs.

Règle de direction artistique (DA-core.md, interdit ⛔) : RIEN n'apparaît en
cours de plan. Aucun fondu, aucun élément qui se matérialise. Le plan s'ouvre
sur un cadre VIDE, puis chaque fleur et chaque feuille entre par un bord de
l'écran et vient prendre sa place. Seules les positions changent.

C'est pour cela que le mouvement est calculé ici plutôt que confié à un
modèle génératif : un modèle invente des éléments en route, il ne peut pas
tenir cette règle.

    python3 outils/bouquet.py
"""

from __future__ import annotations
import math, os, random, shutil, subprocess
from PIL import Image, ImageFilter

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FLEURS = os.path.join(RACINE, "public", "fleurs")
PAPIER = (248, 241, 226)
L, H = 720, 1280
FPS = 25

ESPECES = {
    "a": ["a-gerbera-pleine@2x.webp", "a-allium-pleine@2x.webp"],
    "b": ["b-souci-pleine@2x.webp", "b-agapanthe-pleine@2x.webp"],
    "intro": ["a-gerbera-pleine@2x.webp", "a-allium-pleine@2x.webp",
              "b-souci-pleine@2x.webp", "b-agapanthe-pleine@2x.webp"],
}
FEUILLES = [f"feuille-{i}.webp" for i in range(1, 7)]


def sortie(t: float) -> float:
    return 1 - pow(1 - t, 3)


def arrangement(cle: str, n_fleurs: int, n_feuilles: int, graine: int):
    """Le bouquet fini : les feuilles derrière, puis deux couronnes de
    corolles, puis le coeur. Les rayons sont calés sur le diamètre des
    fleurs pour qu'elles se chevauchent, comme un bouquet serré à la main."""
    rnd = random.Random(graine)
    cx, cy = L / 2, H * 0.43
    t0, t1, t2 = 0.385, 0.350, 0.315
    r1, r2 = t1 * L * 0.60, t2 * L * 1.10
    noms = ESPECES[cle]
    elems = []                                   # (fichier, x, y, taille, angle, z)

    # Les feuilles pointent vers l'extérieur, juste derrière les corolles.
    depart = rnd.uniform(0, math.tau)
    for i in range(n_feuilles):
        a = depart + math.tau * i / n_feuilles
        rf = r2 * 1.02
        elems.append((FEUILLES[i % len(FEUILLES)],
                      cx + math.cos(a) * rf * 0.92, cy + math.sin(a) * rf,
                      0.215 + rnd.uniform(-0.02, 0.02),
                      -(math.degrees(a) + 90), 9))

    # Couronne extérieure, puis couronne intérieure, puis le coeur.
    k = 0
    for couronne, (combien, rayon, taille, z) in enumerate(
            [(n_fleurs - 7, r2, t2, 6), (6, r1, t1, 3)]):
        d = rnd.uniform(0, math.tau)
        for i in range(combien):
            a = d + math.tau * i / combien + rnd.uniform(-0.07, 0.07)
            elems.append((noms[k % len(noms)],
                          cx + math.cos(a) * rayon * 0.88 + rnd.uniform(-9, 9),
                          cy + math.sin(a) * rayon + rnd.uniform(-9, 9),
                          taille + rnd.uniform(-0.022, 0.022),
                          rnd.uniform(-8, 8), z))
            k += 1
    elems.append((noms[k % len(noms)], cx, cy, t0, rnd.uniform(-6, 6), 0))
    return elems


def hors_cadre(elems, graine: int):
    """Le point de départ de chaque élément : entièrement HORS du cadre, sur
    le bord vers lequel sa position finale le tire. La première image du plan
    est donc vide, et rien n'apparaît : tout entre par un bord."""
    rnd = random.Random(graine + 7)
    cx, cy = L / 2, H / 2
    out = []
    for _, x, y, taille, _, _ in elems:
        dx, dy = x - cx, y - cy
        norme = math.hypot(dx, dy) or 1.0
        a = math.atan2(dy, dx) + rnd.uniform(-0.30, 0.30)
        dx, dy = math.cos(a), math.sin(a)
        rayon = taille * L * 0.75                       # demi-diagonale large
        # distance minimale pour franchir le premier bord rencontré
        tx = (L / 2 + rayon) / abs(dx) if abs(dx) > 1e-6 else 1e9
        ty = (H / 2 + rayon) / abs(dy) if abs(dy) > 1e-6 else 1e9
        t = min(tx, ty) * rnd.uniform(1.10, 1.35)
        out.append((cx + dx * t, cy + dy * t))
    return out


def poser(toile, img, x, y, taille, angle):
    cote = max(8, int(taille * L))
    f = img.resize((cote, cote), Image.LANCZOS)
    if angle:
        f = f.rotate(angle, resample=Image.BICUBIC, expand=False)
    # Ombre NOIRE uniquement (règle DA), douce, décalée vers le bas.
    sil = Image.new("RGBA", f.size, (0, 0, 0, 0))
    sil.putalpha(f.getchannel("A").point(lambda v: int(v * 0.34)))
    sil = sil.filter(ImageFilter.GaussianBlur(cote * 0.045))
    toile.alpha_composite(sil, (int(x - cote / 2) + 6, int(y - cote / 2) + 11))
    toile.alpha_composite(f, (int(x - cote / 2), int(y - cote / 2)))


def rendre(cle, sens, sortie_mp4, secondes=3.8, pause=1.5, n_fleurs=12, n_feuilles=5):
    graine = sum(map(ord, cle))
    fin = arrangement(cle, n_fleurs, n_feuilles, graine)
    depart = hors_cadre(fin, graine)
    images = {n: Image.open(os.path.join(FLEURS, n)).convert("RGBA")
              for n, *_ in fin}
    if sens == "disperse":                       # la défaite : le bouquet s'en va
        aller = [(fin[i][1], fin[i][2]) for i in range(len(fin))]
        venir = depart
    else:
        aller = depart
        venir = [(fin[i][1], fin[i][2]) for i in range(len(fin))]

    ordre = sorted(range(len(fin)), key=lambda i: -fin[i][5])
    rnd = random.Random(graine)
    phases = [rnd.uniform(0, math.tau) for _ in fin]
    retards = [rnd.uniform(0, 0.38) for _ in fin]

    tmp = os.path.join("/tmp", f"bouquet-{cle}-{sens}")
    shutil.rmtree(tmp, ignore_errors=True)
    os.makedirs(tmp)
    total, arret = int(secondes * FPS), int(pause * FPS)

    for k in range(total + arret):
        t = min(1.0, k / max(1, total - 1))
        toile = Image.new("RGBA", (L, H), PAPIER + (255,))
        for i in ordre:
            u = sortie(min(1.0, max(0.0, (t - retards[i]) / (1 - retards[i]))))
            x = aller[i][0] + (venir[i][0] - aller[i][0]) * u
            y = aller[i][1] + (venir[i][1] - aller[i][1]) * u
            nom, _, _, taille, angle, _ = fin[i]
            temps = k / FPS
            # respiration : une oscillation lente, jamais une apparition
            a = angle + 2.0 * math.sin(temps * 1.5 + phases[i])
            s = taille * (1 + 0.012 * math.sin(temps * 1.9 + phases[i] * 1.7))
            poser(toile, images[nom], x, y, s, a)
        toile.convert("RGB").save(os.path.join(tmp, f"{k:04d}.png"))

    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS),
         "-i", os.path.join(tmp, "%04d.png"),
         "-c:v", "libx264", "-crf", "31", "-preset", "veryslow",
         "-pix_fmt", "yuv420p", "-movflags", "+faststart", sortie_mp4],
        check=True)
    shutil.rmtree(tmp, ignore_errors=True)
    print(f"  {os.path.basename(sortie_mp4):16} {total + arret:3} images  "
          f"{os.path.getsize(sortie_mp4)/1024:5.0f} Ko")


if __name__ == "__main__":
    print("Plans de bouquet : cadre vide au départ, tout entre par les bords.")
    rendre("intro", "assemble", os.path.join(FLEURS, "intro.mp4"),
           secondes=3.5, pause=0.6, n_fleurs=13, n_feuilles=6)
    for p in ("a", "b"):
        rendre(p, "assemble", os.path.join(FLEURS, f"victoire-{p}.mp4"),
               secondes=3.9, pause=1.7)
        rendre(p, "disperse", os.path.join(FLEURS, f"defaite-{p}.mp4"),
               secondes=3.6, pause=0.9)
