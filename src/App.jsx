import { useState } from 'react';
import { upsertUser } from './services/supabaseService.js';
import HomeScreen from './screens/HomeScreen.jsx';
import QuizScreen from './screens/QuizScreen.jsx';

const { ready, getUser } = (() => {
  const tg = window.Telegram?.WebApp;
  return {
    ready: () => { tg?.ready(); tg?.expand(); },
    getUser: () => {
      const user = tg?.initDataUnsafe?.user;
      return {
        id: user?.id ?? 'guest_' + Math.random().toString(36).slice(2, 8),
        firstName: user?.first_name ?? 'Explorer',
        username: user?.username ?? null,
        languageCode: user?.language_code ?? 'en',
        countryCode: 'XX',
      };
    },
  };
})();

ready();
const initialUser = getUser();
upsertUser(initialUser);

const App = () => {
  const [selectedTier, setSelectedTier] = useState(null);

  if (selectedTier) {
    return (
      <QuizScreen
        tier={selectedTier}
        user={initialUser}
        onBack={() => setSelectedTier(null)}
      />
    );
  }

  return (
    <HomeScreen
      user={initialUser}
      onSelectTier={(tier) => setSelectedTier(tier)}
    />
  );
};

export default App;