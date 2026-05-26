import { supabase } from '../supabase.js';

// check if user is a real Telegram user or a browser guest
const isRealUser = (user) => typeof user.id === 'number';

export const upsertUser = async (telegramUser) => {
  if (!isRealUser(telegramUser)) return null;

  const { data, error } = await supabase
    .from('users')
    .upsert({
      telegram_id: telegramUser.id,
      username: telegramUser.username ?? null,
      first_name: telegramUser.firstName,
      country_code: telegramUser.countryCode ?? 'XX',
    }, { onConflict: 'telegram_id' })
    .select()
    .single();

  if (error) console.error('upsertUser error:', error);
  return data;
};

export const saveScore = async (telegramUser, score, tier, level) => {
  if (!isRealUser(telegramUser)) return;

  const { error } = await supabase
    .from('scores')
    .insert({
      telegram_id: telegramUser.id,
      score,
      tier,
      level,
    });

  if (error) console.error('saveScore error:', error);
};

export const upsertHighScore = async (telegramUser, score, tier) => {
  if (!isRealUser(telegramUser)) return;

  const { error } = await supabase
    .from('high_scores')
    .upsert({
      telegram_id: telegramUser.id,
      first_name: telegramUser.firstName,
      username: telegramUser.username ?? null,
      country_code: telegramUser.countryCode ?? 'XX',
      tier,
      high_score: score,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'telegram_id,tier',
      ignoreDuplicates: false,
    });

  if (error) console.error('upsertHighScore error:', error);
};

export const getLeaderboard = async (tier, limit = 20) => {
  const { data, error } = await supabase
    .from('high_scores')
    .select('first_name, username, country_code, high_score, updated_at')
    .eq('tier', tier)
    .order('high_score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getLeaderboard error:', error);
    return [];
  }
  return data;
};

export const getCountryLeaderboard = async (tier) => {
  const { data, error } = await supabase
    .from('high_scores')
    .select('country_code, high_score')
    .eq('tier', tier)
    .order('high_score', { ascending: false });

  if (error) {
    console.error('getCountryLeaderboard error:', error);
    return [];
  }

  const countryMap = {};
  data.forEach(row => {
    const cc = row.country_code ?? 'XX';
    if (!countryMap[cc]) countryMap[cc] = { country_code: cc, total: 0, players: 0 };
    countryMap[cc].total += row.high_score;
    countryMap[cc].players += 1;
  });

  return Object.values(countryMap)
    .sort((a, b) => b.total - a.total);
};