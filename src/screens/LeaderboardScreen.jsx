import { useState, useEffect } from 'react';
import { getLeaderboard } from '../services/supabaseService.js';

const TIERS = {
  1: { label: 'Flags', emoji: '🚩' },
  2: { label: 'Capitals', emoji: '🏙️' },
  3: { label: 'Population', emoji: '👥' },
};

const MEDALS = { 0: '🥇', 1: '🥈', 2: '🥉' };

const LeaderboardScreen = ({ user, onBack }) => {
  const [activeTier, setActiveTier] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const rows = await getLeaderboard(activeTier, 20);
      setData(rows);
      setLoading(false);
    };
    load();
  }, [activeTier]);

  const userRank = data.findIndex(
    row => row.telegram_id === user?.id
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 60%, #42a5f5 100%)',
        padding: '20px 20px 0',
        color: '#ffffff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button onClick={onBack} style={{
            background: 'none', border: 'none',
            fontSize: '24px', cursor: 'pointer',
            color: '#ffffff',
          }}>
            ←
          </button>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>
            🏆 Leaderboard
          </h2>
        </div>

        {/* Tier tabs */}
        <div style={{ display: 'flex', gap: '8px', paddingBottom: '0' }}>
          {Object.entries(TIERS).map(([id, tier]) => (
            <button
              key={id}
              onClick={() => setActiveTier(Number(id))}
              style={{
                flex: 1,
                padding: '10px 8px',
                borderRadius: '12px 12px 0 0',
                border: 'none',
                background: activeTier === Number(id)
                  ? '#f0f4ff'
                  : 'rgba(255,255,255,0.15)',
                color: activeTier === Number(id) ? '#1565c0' : '#ffffff',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tier.emoji} {tier.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>

        {/* Your rank card */}
        {userRank >= 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #ff6d00, #ff9100)',
            borderRadius: '14px',
            padding: '14px 16px',
            marginBottom: '16px',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.85, marginBottom: '2px' }}>
                Your rank
              </div>
              <div style={{ fontSize: '22px', fontWeight: '800' }}>
                #{userRank + 1}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', opacity: 0.85, marginBottom: '2px' }}>
                Your best
              </div>
              <div style={{ fontSize: '22px', fontWeight: '800' }}>
                {data[userRank]?.high_score ?? 0}
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
            Loading...
          </div>
        )}

        {/* Empty */}
        {!loading && data.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#888',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌍</div>
            <p style={{ fontSize: '16px', fontWeight: '600' }}>No scores yet</p>
            <p style={{ fontSize: '14px', marginTop: '6px' }}>
              Be the first on the leaderboard!
            </p>
          </div>
        )}

        {/* Leaderboard rows */}
        {!loading && data.map((row, index) => {
          const isCurrentUser = row.telegram_id === user?.id;
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '14px',
                background: isCurrentUser ? '#e8f0fe' : '#ffffff',
                marginBottom: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: isCurrentUser ? '2px solid #1976d2' : '2px solid transparent',
              }}
            >
              {/* Rank */}
              <div style={{
                width: '32px',
                textAlign: 'center',
                fontSize: index < 3 ? '22px' : '15px',
                fontWeight: '700',
                color: '#888',
                flexShrink: 0,
              }}>
                {MEDALS[index] ?? `#${index + 1}`}
              </div>

              {/* Avatar */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: isCurrentUser ? '#1976d2' : '#e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: '700',
                color: isCurrentUser ? '#ffffff' : '#666',
                flexShrink: 0,
              }}>
                {row.first_name?.charAt(0).toUpperCase() ?? '?'}
              </div>

              {/* Name */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: '700',
                  fontSize: '15px',
                  color: isCurrentUser ? '#1565c0' : '#000000',
                }}>
                  {row.first_name}
                  {isCurrentUser && (
                    <span style={{
                      fontSize: '11px',
                      background: '#1976d2',
                      color: '#fff',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      marginLeft: '6px',
                      fontWeight: '600',
                    }}>
                      You
                    </span>
                  )}
                </div>
                {row.username && (
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    @{row.username}
                  </div>
                )}
              </div>

              {/* Score */}
              <div style={{
                fontWeight: '800',
                fontSize: '20px',
                color: index === 0 ? '#f57f17' : '#1565c0',
                flexShrink: 0,
              }}>
                {row.high_score}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeaderboardScreen;