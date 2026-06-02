import { useState, useEffect } from 'react';
import { upsertUser } from './services/supabaseService.js';
import HomeScreen from './screens/HomeScreen.jsx';
import QuizScreen from './screens/QuizScreen.jsx';
import LeaderboardScreen from './screens/LeaderboardScreen.jsx';

const getUser = () => {
  // Read tg fresh each time — not at module load time
  const tg = window.Telegram?.WebApp;

  console.log('tg object:', tg);
  console.log('initData:', tg?.initData);
  console.log('initDataUnsafe:', tg?.initDataUnsafe);

  // Try initDataUnsafe first
  const user = tg?.initDataUnsafe?.user;
  if (user?.id) {
    console.log('Got user from initDataUnsafe:', user);
    return {
      id: user.id,
      firstName: user.first_name ?? 'Explorer',
      username: user.username ?? null,
      languageCode: user.language_code ?? 'en',
      countryCode: 'XX',
    };
  }

  // Try parsing initData manually
  try {
    const initData = tg?.initData;
    if (initData) {
      const params = new URLSearchParams(initData);
      const userStr = params.get('user');
      if (userStr) {
        const parsed = JSON.parse(decodeURIComponent(userStr));
        console.log('Got user from initData parsing:', parsed);
        return {
          id: parsed.id,
          firstName: parsed.first_name ?? 'Explorer',
          username: parsed.username ?? null,
          languageCode: parsed.language_code ?? 'en',
          countryCode: 'XX',
        };
      }
    }
  } catch (e) {
    console.log('initData parse error:', e);
  }

  console.log('No Telegram user found, using guest');
  return {
    id: 'guest_' + Math.random().toString(36).slice(2, 8),
    firstName: 'Explorer',
    username: null,
    languageCode: 'en',
    countryCode: 'XX',
  };
};

const App = () => {
  const [screen, setScreen] = useState('home');
  const [selectedTier, setSelectedTier] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    tg?.ready();
    tg?.expand();

    // wait for Telegram to fully inject user data
    setTimeout(() => {
      const telegramUser = getUser();
      console.log('Final user:', telegramUser);
      setUser(telegramUser);
      upsertUser(telegramUser);
    }, 500);
  }, []);

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f0f4ff',
        fontSize: '48px',
      }}>
        🌍
      </div>
    );
  }

  if (screen === 'quiz' && selectedTier) {
    return (
      <QuizScreen
        tier={selectedTier}
        user={user}
        onBack={() => setScreen('home')}
      />
    );
  }

  if (screen === 'leaderboard') {
    return (
      <LeaderboardScreen
        user={user}
        onBack={() => setScreen('home')}
      />
    );
  }

  return (
    <HomeScreen
      user={user}
      onSelectTier={(tier) => {
        setSelectedTier(tier);
        setScreen('quiz');
      }}
      onLeaderboard={() => setScreen('leaderboard')}
    />
  );
};

export default App;