#!/usr/bin/env python3
"""Mesure l'équilibre du robot en rejouant la règle réelle.

Sert à régler BOT dans lib/game.ts : contre un joueur moyen, le niveau par
défaut (Lièvre) doit perdre un peu plus souvent qu'il ne gagne.

    python3 outils/robot.py
"""
import random

def partie(p_joueur, q_joueur, p_bot, q_bot, taille=5):
    f1, f2 = [], []
    for _ in range(60):
        if random.random() < p_joueur: f1.append(random.choice(q_joueur))
        if random.random() < p_bot:    f2.append(random.choice(q_bot))
        if len(f1) >= taille or len(f2) >= taille:
            if len(f1) != len(f2): return 1 if len(f1) > len(f2) else 2
            b1, b2 = sum(f1), sum(f2)
            return 0 if b1 == b2 else (1 if b1 > b2 else 2)
    return 0

PROFILS = {
    "à l'aise (85 % juste)":  (0.85, [3, 3, 3, 2]),
    "moyen (70 % juste)":     (0.70, [3, 2, 2, 1]),
    "qui découvre (55 %)":    (0.55, [2, 2, 1, 1]),
}
BOTS = {                       # doit rester aligné sur lib/game.ts
    "Tortue": (0.45, [1, 1, 1, 1, 2, 2, 3]),
    "Lièvre": (0.64, [1, 1, 2, 2, 2, 3]),
    "Fusée":  (0.82, [1, 2, 2, 3, 3, 3]),
}

if __name__ == "__main__":
    print("Part de parties gagnées par le robot (10 000 parties) :")
    for nom, (p, q) in PROFILS.items():
        cols = []
        for niveau, (pb, qb) in BOTS.items():
            random.seed(hash(niveau) & 0xffff)
            v = [partie(p, q, pb, qb) for _ in range(10000)]
            cols.append(f"{niveau} {100 * v.count(2) / len(v):4.0f} %")
        print(f"  joueur {nom:24} " + "   ".join(cols))
