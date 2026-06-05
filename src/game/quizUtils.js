// Difficulty buckets based on population
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
    case 4: return countries;
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

// Tier 1 — Flag quiz
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

// --- DAILY CHALLENGE ---

// Seeded random — same date = same questions for everyone worldwide
const seededRandom = (seed) => {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
};

const dateToSeed = (dateStr) => {
  return dateStr.split('-').reduce((acc, val) => acc * 100 + parseInt(val), 0);
};

export const generateDailyQuestions = (allCountries, tier = 1, dateStr, count = 10) => {
  const seed = dateToSeed(dateStr);
  const rand = seededRandom(seed + tier * 1000);

  // use well-known countries for daily challenge so it's fair for everyone
  const pool = allCountries.filter(c => c.population > 10_000_000);
  const shuffled = [...pool].sort(() => rand() - 0.5);
  const selected = shuffled.slice(0, count);

  return selected.map(country => {
    if (tier === 2) {
      const eligible = pool.filter(c => c.capital !== 'N/A');
      const capitalWrong = [...eligible]
        .filter(c => c.cca2 !== country.cca2)
        .sort(() => rand() - 0.5)
        .slice(0, 3)
        .map(c => c.capital);
      const capitalOptions = [country.capital, ...capitalWrong]
        .sort(() => rand() - 0.5);
      return {
        type: 'capital',
        prompt: `What is the capital of ${country.commonName}?`,
        correctCountry: country,
        options: capitalOptions,
        correctAnswer: country.capital,
      };
    }

    // default — flag question
    const wrong = [...pool]
      .filter(c => c.cca2 !== country.cca2)
      .sort(() => rand() - 0.5)
      .slice(0, 3)
      .map(c => c.commonName);
    const options = [country.commonName, ...wrong]
      .sort(() => rand() - 0.5);
    return {
      type: 'flag',
      prompt: 'Which country does this flag belong to?',
      correctCountry: country,
      options,
      correctAnswer: country.commonName,
    };
  });
};