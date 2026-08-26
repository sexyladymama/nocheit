import type { Country } from '../types';

export interface CountryStat {
  label: string;
  value: string;
  wide?: boolean;
}

export interface CountryDossier {
  stats: CountryStat[];
  notes: string[];
}

function formatArea(km2: number): string {
  if (km2 >= 1_000_000) return `${(km2 / 1_000_000).toFixed(1).replace('.0', '')} M km²`;
  return `${km2.toLocaleString('fr-FR')} km²`;
}

function areaComparison(km2: number): string {
  if (km2 > 8_000_000) return 'un continent à lui seul';
  if (km2 > 2_000_000) return 'plusieurs fois la France';
  if (km2 > 500_000) return 'à peu près la France';
  if (km2 > 100_000) return 'à peu près le Portugal';
  if (km2 > 20_000) return 'à peu près la Bretagne';
  if (km2 > 1_000) return "un gros département français";
  return 'plus petit que le Grand Paris';
}

export function generateFacts(country: Country): CountryDossier {
  const stats: CountryStat[] = [];

  stats.push({
    label: 'Capitale',
    value: country.capital ?? 'Aucune',
  });

  stats.push({
    label: 'Continent',
    value: country.regionFr,
  });

  if (country.area) {
    stats.push({
      label: 'Superficie',
      value: formatArea(country.area),
    });
  }

  if (country.currencies.length > 0) {
    const cur = country.currencies[0];
    stats.push({
      label: 'Monnaie',
      value: `${cur.name}${cur.symbol ? ` (${cur.symbol})` : ''}`,
    });
  }

  if (country.languages.length > 0) {
    stats.push({
      label: 'Langue' + (country.languages.length > 1 ? 's' : ''),
      value: country.languages.slice(0, 3).join(', '),
      wide: country.languages.length > 1,
    });
  }

  const notes: string[] = [];

  if (country.area) {
    notes.push(
      `Avec ${formatArea(country.area)}, ${country.nameFr} fait à peu près ${areaComparison(
        country.area,
      )}.`,
    );
  }

  if (country.landlocked) {
    notes.push(`${country.nameFr} est un pays enclavé, sans accès direct à la mer.`);
  } else if (country.borders.length === 0) {
    notes.push(`${country.nameFr} n'a aucune frontière terrestre — c'est une île.`);
  } else {
    notes.push(
      `${country.nameFr} partage ses frontières avec ${country.borders.length} pays voisin${
        country.borders.length > 1 ? 's' : ''
      }.`,
    );
  }

  if (country.demonymFr) {
    notes.push(`On appelle ses habitants les ${country.demonymFr}s.`);
  }

  return { stats: stats.slice(0, 5), notes: notes.slice(0, 3) };
}
