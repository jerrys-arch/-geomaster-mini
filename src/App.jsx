import { useState, useEffect } from 'react';
import { upsertUser } from './services/supabaseService.js';
import HomeScreen from './screens/HomeScreen.jsx';
import QuizScreen from './screens/QuizScreen.jsx';
import LeaderboardScreen from './screens/LeaderboardScreen.jsx';

const tg = window.Telegram?.WebApp;

const getUser = () => {
  const user = tg?.initDataUnsafe?.user;
  console.log('Telegram user:', user);
  console.log('initData:', tg?.initData);
  return {
    id: user?.id ?? 'guest_' + Math.random().toString(36).slice(2, 8),
    firstName: user?.first_name ?? 'Explorer',
    username: user?.username ?? null,
    languageCode: user?.language_code ?? 'en',
    countryCode: 'XX',
  };
};

const App = () => {
  const [screen, setScreen] = useState('home');
  const [selectedTier, setSelectedTier] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    tg?.ready();
    tg?.expand();

    // small delay to let Telegram inject user data
    setTimeout(() => {
      const telegramUser = getUser();
      setUser(telegramUser);
      upsertUser(telegramUser);
    }, 300);
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