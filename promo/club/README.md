# Vidéo promo — Noche, espace club

Vidéo horizontale 1920×1080, 60 fps, 32 s, pensée pour donner envie aux
clubs de devenir partenaires de Noche. Style « cellules UI flottantes » en 3D,
sans mockup de téléphone : cartes sombres, faisceaux de lumière dorés, whips
avec flou de mouvement, logo final.

Fichier final : `noche-club-promo.mp4` (H.264 + AAC). Aperçu image par
seconde : `storyboard.jpg`.

## Identité (reprise de nocheparis.com)

- Couleurs : encre `#080808`, papier `#f5f2eb`, jaune `#f9c927`, or `#a07800`,
  vert succès `#67c58d` ; fond en dégradé radial `#29240c → #0d0c08 → #050505`
  comme le hero du site.
- Logo : `noche-logo.png` officiel (utilisé en masque, découpé lettre par
  lettre pour l'animation).
- Typo : capitales condensées (Anton) + accents en serif italique (Instrument
  Serif), comme « NOCHE. UNE APP. TOUTE LA NUIT. » et « Plus de *nuit.* ».
- Ton pro du site : vouvoiement, « Remplissez vos tables. Gardez le contrôle. »,
  CTA « Devenir partenaire ».

## Storyboard (120 BPM, une scène = 2 mesures)

| Temps | Scène | Message |
| --- | --- | --- |
| 0–4 s | Intro | Un point doré devient le « O » du logo NOCHE · « Espace club » |
| 4–7 s | Accroche | « Ce soir, votre club affiche *complet.* » |
| 7–11 s | 01 Calendrier | Création de soirée (line-up, tables, minimum) → « En ligne » |
| 11–15 s | 02 Réservations | Plan de salle qui se remplit (14/16) + réservations de tables, bouteilles, acomptes, avis |
| 15–19 s | 03 QR entrée | Réservations du soir cochées + scan QR « Réservation validée » |
| 19–23 s | 04 Statistiques | CA en direct, courbe, réservations, tables, panier moyen, virements |
| 23–27 s | 05 Visibilité | Carte 3D, le club en pin doré, les clients qui convergent |
| 27–32 s | Fin | Logo + « Remplissez vos tables. *Gardez le contrôle.* » + « Devenir partenaire » + nocheparis.com |

Les chiffres, noms (« La Nuit Dorée », Léa M.…) et données sont fictifs.

## Fichiers

- `promo.html` — toute l'animation, pilotée par `window.renderAt(t)`
  (déterministe, image par image). Ouvre `promo.html?play` dans Chrome pour
  un aperçu temps réel, ou `promo.html#12.5` pour figer une image.
- `music.mjs` — bande-son générée procéduralement (house en la mineur,
  whooshes, pops UI, impact final), calée sur la timeline.
- `render.mjs` — capture les 1920 images avec Playwright/Chromium.
- `snap.mjs` — capture quelques instants pour vérifier une scène.
- `fonts/` — Anton, Instrument Serif, Inter, JetBrains Mono (Google Fonts, OFL).

## Re-générer la vidéo

```bash
cd promo/club
node music.mjs music.wav
node render.mjs                     # écrit frames/f00000.jpg … (FPS, WORKERS en env)
ffmpeg -framerate 60 -i frames/f%05d.jpg -i music.wav \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart \
  -c:a aac -b:a 256k -shortest noche-club-promo.mp4
```

Chromium doit être lancé avec `--allow-file-access-from-files` (déjà fait par
les scripts) pour que le masque du logo se charge. Playwright doit être
résolvable par `import('playwright')`, sinon pointe `PLAYWRIGHT_PATH` vers son
`index.mjs`.
