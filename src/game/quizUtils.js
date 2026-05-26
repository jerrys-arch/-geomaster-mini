// Difficulty buckets based on population
// derived from your CountrySummary.population field — no extra API needed
const getDifficulty = (country) => {
  if (country.population > 50_000_000) return 'easy';
  if (country.population > 10_000_000) return 'medium';
  if (country.population > 1_000_000) return 'hard';
  return 'expert';
};

export const filterByLevel = (countries, level) => {
  switch (level) {
    case 1: return countries.filter(c => getDifficulty(c) === 'easy');
    case 2: return countries.filter(c => ['easy', 'medium'].includes(getDifficulty(c)));
    case 3: return countries.filter(c => ['easy', 'medium', 'hard'].includes(getDifficulty(c)));
    case 4: return countries; // all countries
    default: return countries;
  }
};

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const buildOptions = (correct, all, getLabel) => {
  const options = [getLabel(correct)];
  while (options.length < 4) {
    const random = pickRandom(all);
    const label = getLabel(random);
    if (!options.includes(label)) options.push(label);
  }
  return options.sort(() => Math.random() - 0.5);
};

// Tier 1 — Flag quiz (mirrors your QuizUtils.dart exactly)
export const generateFlagQuestion = (countries) => {
  const correct = pickRandom(countries);
  const options = buildOptions(correct, countries, c => c.commonName);
  return {
    type: 'flag',
    prompt: 'Which country does this flag belong to?',
    correctCountry: correct,
    options,
    correctAnswer: correct.commonName,
  };
};

// Tier 2 — Capitals
export const generateCapitalQuestion = (countries) => {
  const eligible = countries.filter(c => c.capital !== 'N/A');
  const correct = pickRandom(eligible);
  const options = buildOptions(correct, eligible, c => c.capital);
  return {
    type: 'capital',
    prompt: `What is the capital of ${correct.commonName}?`,
    correctCountry: correct,
    options,
    correctAnswer: correct.capital,
  };
};

// Tier 3 — Population
export const generatePopulationQuestion = (countries) => {
  const shuffled = [...countries].sort(() => Math.random() - 0.5).slice(0, 4);
  const correct = shuffled.reduce((a, b) => a.population > b.population ? a : b);
  const options = shuffled.map(c => c.commonName).sort(() => Math.random() - 0.5);
  return {
    type: 'population',
    prompt: 'Which country has the largest population?',
    correctCountry: correct,
    options,
    correctAnswer: correct.commonName,
  };
};

export const generateQuestion = (countries, tier, level) => {
  const pool = filterByLevel(countries, level);
  switch (tier) {
    case 1: return generateFlagQuestion(pool);
    case 2: return generateCapitalQuestion(pool);
    case 3: return generatePopulationQuestion(pool);
    default: return generateFlagQuestion(pool);
  }
};