const BASE_URL = 'https://restcountries.com/v3.1';
const CACHE_KEY = 'cached_all_countries';

const fromJson = (json) => ({
  commonName: json.name?.common ?? '',
  flagPng: json.flags?.png ?? '',
  flagSvg: json.flags?.svg ?? json.flags?.png ?? '',
  population: json.population ?? 0,
  cca2: json.cca2 ?? '',
  capital: Array.isArray(json.capital) && json.capital.length > 0
    ? json.capital[0]
    : 'N/A',
  region: json.region ?? '',
  subregion: json.subregion ?? '',
});

export const fetchAllCountries = async () => {
  try {
    const res = await fetch(
      `${BASE_URL}/all?fields=name,flags,population,cca2,capital,region,subregion`
    );
    if (!res.ok) throw new Error('Failed to fetch');

    const data = await res.json();
    const countries = data.map(fromJson);

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(countries));
    } catch {
      // storage full, skip caching
    }

    return countries;
  } catch (fetchError) {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) return JSON.parse(cached);
    throw new Error('No internet and no cached data found.', { cause: fetchError });
  }
};