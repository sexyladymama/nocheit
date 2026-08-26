# 🌍 Globe Quiz

Un globe 3D interactif où tous les pays démarrent **verrouillés**. Clique sur
un pays (ou laisse le hasard choisir), découvre 5 fun facts à son sujet, puis
réponds à un mini-quiz pour le débloquer définitivement.

## Fonctionnement

- **Globe interactif** ([globe.gl](https://github.com/vasturiano/globe.gl) /
  Three.js) : chaque pays est un polygone cliquable, coloré selon son état
  (verrouillé / survolé / sélectionné / débloqué).
- **Bouton "Pays aléatoire"** : sélectionne un pays encore verrouillé au
  hasard et anime la caméra jusqu'à lui.
- **Fiche pays** : 5 fun facts générés à partir des données du pays
  (capitale, continent, superficie, langues, monnaie, voisins, gentilé...).
- **Quiz de déblocage** : 3 questions à choix multiples générées
  dynamiquement (capitale, monnaie, langue, drapeau, continent, nombre de
  voisins...) avec des réponses erronées piochées parmi les autres pays. Il
  faut au moins 2 bonnes réponses sur 3 pour débloquer le pays.
- **Progression persistée** en `localStorage`, donc conservée entre deux
  visites.

Toutes les données pays proviennent du jeu de données public
[mledoze/countries](https://github.com/mledoze/countries) (frontières,
capitales, langues, monnaies, gentilés...), figées dans
`src/data/countries.json` via `scripts/build-countries.mjs`. Les frontières
du globe utilisent le topojson `world-atlas@2` (résolution 50m), converti à
la volée avec `topojson-client`. Aucun appel réseau n'est nécessaire au
runtime : tout est embarqué dans le bundle.

## Développement

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Régénérer les données pays

Si `scripts/raw_countries.json` est mis à jour (nouvelle version du dataset
mledoze/countries), régénère `src/data/countries.json` avec :

```bash
node scripts/build-countries.mjs
```
