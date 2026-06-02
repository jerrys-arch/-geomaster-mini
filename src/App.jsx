import { useState, useEffect } from 'react';
import { upsertUser } from './services/supabaseService.js';
import HomeScreen from './screens/HomeScreen.jsx';
import QuizScreen from './screens/QuizScreen.jsx';
import LeaderboardScreen from './screens/LeaderboardScreen.jsx';

const App = () => {
  const [screen, setScreen] = useState('home');
  const [selectedTier, setSelectedTier] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    tg?.ready();
    tg?.expand();

    setTimeout(() => {
      const userObj = tg?.initDataUnsafe?.user;
      const telegramUser = {
        id: userObj?.id ?? 'guest_' + Math.random().toString(36).slice(2, 8),
        firstName: userObj?.first_name ?? 'Explorer',
        username: userObj?.username ?? null,
        languageCode: userObj?.language_code ?? 'en',
        countryCode: 'XX',
      };
      setUser(telegramUser);
      upsertUser(telegramUser);
    }, 500);
  }, []);

  if (!user) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh',
        background: '#f0f4ff', fontSize: '48px',
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