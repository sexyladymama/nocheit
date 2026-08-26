// One-off build script: trims the raw mledoze/countries dataset down to
// only the fields this app needs, and writes src/data/countries.json.
// Run with: node scripts/build-countries.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const raw = JSON.parse(readFileSync(join(__dirname, 'raw_countries.json'), 'utf-8'));

const REGION_FR = {
  Africa: 'Afrique',
  Americas: 'Amériques',
  Antarctic: 'Antarctique',
  Asia: 'Asie',
  Europe: 'Europe',
  Oceania: 'Océanie',
};

const countries = raw
  .filter((c) => c.ccn3)
  .map((c) => {
    const nameFr = c.translations?.fra?.common || c.name.common;
    const demonymFr = c.demonyms?.fra?.m || c.demonyms?.eng?.m || null;
    const languages = c.languages ? Object.values(c.languages) : [];
    const currencies = c.currencies
      ? Object.values(c.currencies).map((cur) => ({ name: cur.name, symbol: cur.symbol || '' }))
      : [];

    return {
      cca3: c.cca3,
      ccn3: c.ccn3,
      nameEn: c.name.common,
      nameFr,
      capital: c.capital?.[0] || null,
      region: c.region,
      regionFr: REGION_FR[c.region] || c.region,
      subregion: c.subregion || null,
      area: typeof c.area === 'number' ? Math.round(c.area) : null,
      languages,
      currencies,
      borders: c.borders || [],
      latlng: c.latlng || null,
      landlocked: !!c.landlocked,
      demonymFr,
      flag: c.flag || '',
      independent: !!c.independent,
    };
  })
  .sort((a, b) => a.nameFr.localeCompare(b.nameFr, 'fr'));

writeFileSync(
  join(__dirname, '..', 'src', 'data', 'countries.json'),
  JSON.stringify(countries),
);

console.log(`Wrote ${countries.length} countries to src/data/countries.json`);
