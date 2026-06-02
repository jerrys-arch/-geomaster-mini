import { useState } from 'react';
import { upsertUser } from './services/supabaseService.js';
import HomeScreen from './screens/HomeScreen.jsx';
import QuizScreen from './screens/QuizScreen.jsx';
import LeaderboardScreen from './screens/LeaderboardScreen.jsx';

const tg = window.Telegram?.WebApp;

const initApp = () => {
  tg?.ready();
  tg?.expand();
  const user = tg?.initDataUnsafe?.user;
  return {
    id: user?.id ?? 'guest_' + Math.random().toString(36).slice(2, 8),
    firstName: user?.first_name ?? 'Explorer',
    username: user?.username ?? null,
    languageCode: user?.language_code ?? 'en',
    countryCode: 'XX',
  };
};

const initialUser = initApp();
upsertUser(initialUser);

const App = () => {
  const [screen, setScreen] = useState('home');
  const [selectedTier, setSelectedTier] = useState(null);

  if (screen === 'quiz' && selectedTier) {
    return (
      <QuizScreen
        tier={selectedTier}
        user={initialUser}
        onBack={() => setScreen('home')}
      />
    );
  }

  if (screen === 'leaderboard') {
    return (
      <LeaderboardScreen
        user={initialUser}
        onBack={() => setScreen('home')}
      />
    );
  }

  return (
    <HomeScreen
      user={initialUser}
      onSelectTier={(tier) => {
        setSelectedTier(tier);
        setScreen('quiz');
      }}
      onLeaderboard={() => setScreen('leaderboard')}
    />
  );
};

export default App;