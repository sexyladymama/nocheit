import type { Country } from '../types';

function formatArea(km2: number): string {
  if (km2 >= 1_000_000) return `${(km2 / 1_000_000).toFixed(1).replace('.0', '')} million de km²`;
  return `${km2.toLocaleString('fr-FR')} km²`;
}

function areaComparison(km2: number): string {
  if (km2 > 8_000_000) return "c'est un véritable continent à lui tout seul";
  if (km2 > 2_000_000) return "de quoi engloutir plusieurs fois la France";
  if (km2 > 500_000) return 'à peu près la taille de la France';
  if (km2 > 100_000) return 'à peu près la taille du Portugal';
  if (km2 > 20_000) return "à peu près la taille de la Bretagne";
  if (km2 > 1_000) return "à peine plus grand qu'un gros département français";
  return "plus petit que la ville de Paris et sa périphérie";
}

export function generateFacts(country: Country): string[] {
  const facts: string[] = [];

  if (country.capital) {
    facts.push(`🏛️ La capitale de ${country.nameFr} est **${country.capital}**.`);
  } else {
    facts.push(`🏛️ ${country.nameFr} n'a pas de capitale officiellement désignée.`);
  }

  facts.push(
    `🌍 ${country.nameFr} se situe en **${country.regionFr}**${
      country.subregion ? ` (${country.subregion})` : ''
    }.`,
  );

  if (country.area) {
    facts.push(
      `📏 Sa superficie est d'environ **${formatArea(country.area)}** — ${areaComparison(
        country.area,
      )}.`,
    );
  }

  if (country.languages.length > 0) {
    const langs = country.languages.slice(0, 3).join(', ');
    facts.push(
      `🗣️ On y parle ${country.languages.length > 1 ? 'notamment' : ''} **${langs}**${
        country.languages.length > 3 ? ', entre autres' : ''
      }.`,
    );
  }

  if (country.currencies.length > 0) {
    const cur = country.currencies[0];
    facts.push(`💰 La monnaie utilisée est **${cur.name}**${cur.symbol ? ` (${cur.symbol})` : ''}.`);
  }

  if (country.landlocked) {
    facts.push(`🚫🌊 ${country.nameFr} est un pays **enclavé**, sans accès à la mer.`);
  } else if (country.borders.length === 0) {
    facts.push(`🏝️ ${country.nameFr} n'a aucune frontière terrestre : c'est une île !`);
  }

  if (country.borders.length > 0) {
    facts.push(
      `🧭 ${country.nameFr} partage une frontière avec **${country.borders.length}** pays voisin${
        country.borders.length > 1 ? 's' : ''
      }.`,
    );
  }

  if (country.demonymFr) {
    facts.push(`👤 Les habitants de ${country.nameFr} sont appelés les **${country.demonymFr}s**.`);
  }

  if (country.nameEn !== country.nameFr) {
    facts.push(`🇬🇧 En anglais, ${country.nameFr} se dit **${country.nameEn}**.`);
  }

  // Keep exactly 5 varied facts, the most interesting ones first.
  return facts.slice(0, 5);
}
