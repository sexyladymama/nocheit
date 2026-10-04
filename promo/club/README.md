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
- Logo avec le « O » jaune comme sur les visuels App Store, icône de l'app
  (`noche-icon.png`) sur la carte de fin.

## Fidèle à l'app (App Store « Noche Paris » + captures du site)

- Cellules blanches comme l'interface réelle (cartes blanches, boutons noirs
  en pilule) posées sur le fond noir et or.
- Vocabulaire des vrais écrans : « Espace club · Noche Club », « Revenus du
  club · Revenus nets après commission », « Réservations confirmées »,
  « 30 jours », « Table VIP · 7 pers. · min. 150 € », « Show bouteille
  +150 € », « Code d'entrée Noche », paiement Apple Pay, bulles de prix sur
  la carte.
- Espace partenaire tel que décrit sur l'App Store : horaires, tables,
  bouteilles, options, événements, stocks, réservations, contrôle d'entrée.
- `night.jpg` : photo de club du site, teintée or en CSS pour rester dans la
  palette.

## Storyboard (120 BPM, une scène = 2 mesures)

| Temps | Scène | Message |
| --- | --- | --- |
| 0–4 s | Intro | Un point doré devient le « O » du logo NOCHE · « Espace club » |
| 4–7 s | Accroche | « Ce soir, votre club affiche *complet.* » |
| 7–11 s | 01 Événements | Nouvel événement (date, horaires, Table VIP, option Show bouteille) → « En ligne » |
| 11–15 s | 02 Réservations | Plan de salle qui se remplit (14/16) + réservations de tables, bouteilles, paiement Apple Pay, avis |
| 15–19 s | 03 Contrôle d'entrée | Réservations du soir cochées + scan du « Code d'entrée Noche » |
| 19–23 s | 04 Statistiques | Revenus du club (30 jours), réservations confirmées, tables, bouteilles, avis |
| 23–27 s | 05 Visibilité | Carte 3D avec bulles de prix, Noche Club en pin doré, les clients qui convergent |
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
