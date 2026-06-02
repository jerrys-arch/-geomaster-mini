import { useState, useEffect } from 'react';
import { upsertUser } from './services/supabaseService.js';
import HomeScreen from './screens/HomeScreen.jsx';
import QuizScreen from './screens/QuizScreen.jsx';
import LeaderboardScreen from './screens/LeaderboardScreen.jsx';

const App = () => {
  const [screen, setScreen] = useState('home');
  const [selectedTier, setSelectedTier] = useState(null);
  const [user, setUser] = useState(null);
  const [debugInfo, setDebugInfo] = useState('loading...');

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    tg?.ready();
    tg?.expand();

    setTimeout(() => {
      const initData = tg?.initData ?? 'EMPTY';
      const initDataUnsafe = JSON.stringify(tg?.initDataUnsafe ?? {});
      const userObj = tg?.initDataUnsafe?.user;

      setDebugInfo(`
        initData: ${initData.substring(0, 100)}
        initDataUnsafe: ${initDataUnsafe}
        user: ${JSON.stringify(userObj)}
        tg version: ${tg?.version}
        platform: ${tg?.platform}
      `);

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

  // Show debug screen first
  if (debugInfo && user?.firstName === 'Explorer') {
    return (
      <div style={{
        padding: '20px',
        background: '#f0f4ff',
        minHeight: '100vh',
        fontSize: '12px',
        wordBreak: 'break-all',
      }}>
        <h2 style={{ marginBottom: '12px' }}>Debug Info</h2>
        <pre style={{
          background: '#fff',
          padding: '12px',
          borderRadius: '8px',
          whiteSpace: 'pre-wrap',
          marginBottom: '16px',
        }}>
          {debugInfo}
        </pre>
        <button
          onClick={() => setDebugInfo(null)}
          style={{
            width: '100%', height: '50px',
            background: '#1976d2', color: '#fff',
            border: 'none', borderRadius: '12px',
            fontSize: '16px', cursor: 'pointer',
          }}
        >
          Continue anyway
        </button>
      </div>
    );
  }

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