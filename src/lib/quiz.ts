import type { Country, QuizQuestion } from '../types';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickDistractors(
  pool: Country[],
  self: Country,
  getValue: (c: Country) => string | null,
  correctValue: string,
  count: number,
): string[] {
  const seen = new Set([correctValue.toLowerCase()]);
  const values: string[] = [];
  const candidates = shuffle(pool.filter((c) => c.cca3 !== self.cca3));
  for (const c of candidates) {
    const v = getValue(c);
    if (!v || seen.has(v.toLowerCase())) continue;
    seen.add(v.toLowerCase());
    values.push(v);
    if (values.length >= count) break;
  }
  return values;
}

function buildQuestion(
  question: string,
  correct: string,
  distractors: string[],
): QuizQuestion | null {
  if (distractors.length < 2) return null; // not enough variety for a fair question
  const options = shuffle([correct, ...distractors.slice(0, 3)]);
  return { question, options, correctIndex: options.indexOf(correct) };
}

function capitalQuestion(country: Country, pool: Country[]): QuizQuestion | null {
  if (!country.capital) return null;
  const distractors = pickDistractors(pool, country, (c) => c.capital, country.capital, 3);
  return buildQuestion(
    `Quelle est la capitale de ${country.nameFr} ?`,
    country.capital,
    distractors,
  );
}

function regionQuestion(country: Country, pool: Country[]): QuizQuestion | null {
  const distractors = pickDistractors(
    pool,
    country,
    (c) => (c.regionFr !== country.regionFr ? c.regionFr : null),
    country.regionFr,
    3,
  );
  return buildQuestion(
    `Sur quel continent se trouve ${country.nameFr} ?`,
    country.regionFr,
    distractors,
  );
}

function currencyQuestion(country: Country, pool: Country[]): QuizQuestion | null {
  const cur = country.currencies[0];
  if (!cur) return null;
  const distractors = pickDistractors(
    pool,
    country,
    (c) => c.currencies[0]?.name ?? null,
    cur.name,
    3,
  );
  return buildQuestion(
    `Quelle est la monnaie utilisée en ${country.nameFr} ?`,
    cur.name,
    distractors,
  );
}

function languageQuestion(country: Country, pool: Country[]): QuizQuestion | null {
  const lang = country.languages[0];
  if (!lang) return null;
  const distractors = pickDistractors(
    pool,
    country,
    (c) => c.languages.find((l) => !country.languages.includes(l)) ?? null,
    lang,
    3,
  );
  return buildQuestion(
    `Quelle langue est parlée en ${country.nameFr} ?`,
    lang,
    distractors,
  );
}

function borderCountQuestion(country: Country): QuizQuestion | null {
  const correct = String(country.borders.length);
  const seen = new Set([correct]);
  const offsets = shuffle([1, -1, 2, -2, 3, -3]);
  const options: string[] = [];
  for (const off of offsets) {
    const v = country.borders.length + off;
    if (v < 0) continue;
    const s = String(v);
    if (seen.has(s)) continue;
    seen.add(s);
    options.push(s);
    if (options.length >= 3) break;
  }
  if (options.length < 2) return null;
  return buildQuestion(
    `Combien de pays voisins partagent une frontière avec ${country.nameFr} ?`,
    correct,
    options,
  );
}

function flagQuestion(country: Country, pool: Country[]): QuizQuestion | null {
  if (!country.flag) return null;
  const distractors = pickDistractors(pool, country, (c) => c.nameFr, country.nameFr, 3);
  return buildQuestion(`${country.flag} À quel pays appartient ce drapeau ?`, country.nameFr, distractors);
}

export function generateQuiz(country: Country, allCountries: Country[], size = 3): QuizQuestion[] {
  const generators = shuffle([
    capitalQuestion,
    currencyQuestion,
    languageQuestion,
    flagQuestion,
    regionQuestion,
    borderCountQuestion,
  ]);

  const questions: QuizQuestion[] = [];
  for (const gen of generators) {
    if (questions.length >= size) break;
    const q = gen(country, allCountries);
    if (q) questions.push(q);
  }
  return questions;
}
