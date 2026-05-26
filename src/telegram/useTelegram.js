const tg = window.Telegram?.WebApp;

export const useTelegram = () => {
  const ready = () => {
    tg?.ready();
    tg?.expand();
  };

  const getUser = () => {
    const user = tg?.initDataUnsafe?.user;
    return {
      id: user?.id ?? 'guest_' + Math.random().toString(36).slice(2, 8),
      firstName: user?.first_name ?? 'Explorer',
      username: user?.username ?? null,
      languageCode: user?.language_code ?? 'en',
    };
  };

  const shareScore = (score, highScore, tier) => {
    const tierNames = { 1: 'Flags', 2: 'Capitals', 3: 'Population' };
    const tierName = tierNames[tier] ?? 'GeoMaster';
    const text = `I just scored ${score} in ${tierName}! 🌍 My high score is ${highScore}. Can you beat me?`;
    const url = `https://t.me/share/url?url=https://t.me/your_bot&text=${encodeURIComponent(text)}`;
    if (tg) {
      tg.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const themeParams = tg?.themeParams ?? {};
  const colorScheme = tg?.colorScheme ?? 'light';

  return { ready, getUser, shareScore, themeParams, colorScheme, tg };
};