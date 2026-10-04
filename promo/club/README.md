# Vidéo promo — Nocheit pour les clubs

Vidéo horizontale 1920×1080, 60 fps, 32 s, pensée pour donner envie aux
clubs de s'inscrire sur Nocheit. Style « cellules UI flottantes » en 3D,
sans mockup de téléphone : cartes en verre sombre, glow néon, whips avec
flou de mouvement, logo final.

Fichier final : `nocheit-club-promo.mp4` (H.264 + AAC).

## Storyboard (120 BPM, une scène = 2 mesures)

| Temps | Scène | Message |
| --- | --- | --- |
| 0–4 s | Intro | Un point lumineux devient le logo · « nocheit — pour les clubs » |
| 4–7 s | Accroche | « Ton club mérite une salle pleine. » |
| 7–11 s | 01 Publier | Création de soirée (line-up, prix, jauge) → « En ligne », 12 400 noctambules notifiés |
| 11–15 s | 02 Vendre | Jauge qui se remplit (438/450) + ventes qui arrivent (billets, table VIP, guest list) |
| 15–19 s | 03 Accueillir | Guest list cochée en direct + scan QR « Entrée validée » |
| 19–23 s | 04 Piloter | Recettes en direct (12 480 €), courbe, entrées, tables, panier moyen |
| 23–27 s | 05 Être vu | Carte 3D de la nuit, le club en pin, les gens qui convergent |
| 27–32 s | Fin | Logo + « Inscris ton club. » + bouton « Inscrire mon club » |

Les chiffres, noms (« NEON RIOT », « Le Velvet »…) et personnes sont fictifs.

## Fichiers

- `promo.html` — toute l'animation, pilotée par `window.renderAt(t)`
  (déterministe, image par image). Ouvre `promo.html?play` dans Chrome pour
  un aperçu temps réel, ou `promo.html#12.5` pour figer une image.
- `music.mjs` — bande-son générée procéduralement (house en la mineur,
  whooshes, pops UI, impact final), calée sur la timeline.
- `render.mjs` — capture les 1920 images avec Playwright/Chromium.
- `snap.mjs` — capture quelques instants pour vérifier une scène.
- `fonts/` — Unbounded, Inter, JetBrains Mono (Google Fonts, OFL).

## Re-générer la vidéo

```bash
cd promo/club
node music.mjs music.wav
node render.mjs                     # écrit frames/f00000.jpg … (FPS, WORKERS en env)
ffmpeg -framerate 60 -i frames/f%05d.jpg -i music.wav \
  -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -movflags +faststart \
  -c:a aac -b:a 256k -shortest nocheit-club-promo.mp4
```

Playwright doit être résolvable par `import('playwright')`, sinon pointe
`PLAYWRIGHT_PATH` vers son `index.mjs`.
