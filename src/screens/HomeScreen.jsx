const TIERS = [
  {
    id: 1,
    emoji: '🚩',
    label: 'Flags',
    desc: 'Guess the country from its flag',
  },
  {
    id: 2,
    emoji: '🏙️',
    label: 'Capitals',
    desc: 'Name the capital city',
  },
  {
    id: 3,
    emoji: '👥',
    label: 'Population',
    desc: 'Which country has more people?',
  },
  {
    id: 4,
    emoji: '🗺️',
    label: 'Geography',
    desc: 'Rivers, mountains, regions',
  },
  {
    id: 5,
    emoji: '💰',
    label: 'Economy',
    desc: 'Exports, GDP, trade',
  },
  {
    id: 6,
    emoji: '🎌',
    label: 'Culture',
    desc: 'Languages, food, landmarks',
  },
];

const UNLOCK_THRESHOLD = 10;

const isTierUnlocked = (tierId) => {
  if (tierId === 1) return true;
  if (tierId > 3) return false;
  const prevHigh = parseInt(
    localStorage.getItem(`quiz_high_score_tier_${tierId - 1}`) ?? '0', 10
  );
  return prevHigh >= UNLOCK_THRESHOLD;
};

const getTotalScore = () => {
  return [1, 2, 3].reduce((sum, id) => {
    return sum + parseInt(localStorage.getItem(`quiz_high_score_tier_${id}`) ?? '0', 10);
  }, 0);
};

const HomeScreen = ({ user, onSelectTier, onLeaderboard }) => {
  const totalScore = getTotalScore();

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff' }}>

      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 60%, #42a5f5 100%)',
        padding: '40px 20px 32px',
        textAlign: 'center',
        color: '#ffffff',
      }}>
        <div style={{ fontSize: '64px', marginBottom: '8px' }}>🌍</div>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '800',
          letterSpacing: '-0.5px',
          marginBottom: '6px',
          color: '#ffffff',
        }}>
          GeoMaster
        </h1>
        <p style={{ fontSize: '15px', opacity: 0.85, marginBottom: '24px' }}>
          How well do you know the world?
        </p>

        {/* Player card */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '16px',
          padding: '14px 20px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '14px',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: '700',
            color: '#ffffff',
          }}>
            {user.firstName.charAt(0).toUpperCase()}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff' }}>
              {user.firstName}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.8 }}>
              Total best: {totalScore} pts
            </div>
          </div>
        </div>
      </div>

      {/* Tiers */}
      <div style={{ padding: '20px 16px' }}>
        <p style={{
          fontSize: '13px',
          fontWeight: '700',
          color: '#888',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginBottom: '14px',
          paddingLeft: '4px',
        }}>
          Choose a challenge
        </p>

        {TIERS.map((tier, index) => {
          const unlocked = isTierUnlocked(tier.id);
          const comingSoon = tier.id > 3;
          const savedLevel = parseInt(
            localStorage.getItem(`quiz_level_tier_${tier.id}`) ?? '1', 10
          );
          const savedHigh = parseInt(
            localStorage.getItem(`quiz_high_score_tier_${tier.id}`) ?? '0', 10
          );
          const prevHigh = tier.id > 1
            ? parseInt(localStorage.getItem(`quiz_high_score_tier_${tier.id - 1}`) ?? '0', 10)
            : null;

          const progressToUnlock = tier.id > 1 && !unlocked && !comingSoon
            ? Math.min((prevHigh / UNLOCK_THRESHOLD) * 100, 100)
            : null;

          return (
            <button
              key={tier.id}
              onClick={() => unlocked && onSelectTier(tier.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px',
                borderRadius: '18px',
                border: 'none',
                background: unlocked ? '#ffffff' : '#f5f5f5',
                cursor: unlocked ? 'pointer' : 'not-allowed',
                marginBottom: '10px',
                textAlign: 'left',
                opacity: comingSoon ? 0.45 : 1,
                boxShadow: unlocked ? '0 2px 12px rgba(0,0,0,0.08)' : 'none',
                transition: 'transform 0.1s, box-shadow 0.1s',
                animationDelay: `${index * 0.05}s`,
              }}
              onMouseDown={e => {
                if (unlocked) {
                  e.currentTarget.style.transform = 'scale(0.97)';
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)';
                }
              }}
              onMouseUp={e => {
                if (unlocked) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
                }
              }}
            >
              {/* Emoji badge */}
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: unlocked ? '#e8f0fe' : '#eeeeee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                flexShrink: 0,
              }}>
                {tier.emoji}
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: '700',
                  fontSize: '16px',
                  color: unlocked ? '#000000' : '#aaaaaa',
                  marginBottom: '2px',
                }}>
                  {tier.label}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#888888',
                  marginBottom: unlocked || progressToUnlock !== null ? '6px' : '0',
                }}>
                  {tier.desc}
                </div>

                {/* Unlocked — level + score */}
                {unlocked && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      background: '#e8f0fe',
                      color: '#1565c0',
                      padding: '2px 8px',
                      borderRadius: '20px',
                    }}>
                      Level {savedLevel}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      background: '#fff8e1',
                      color: '#f57f17',
                      padding: '2px 8px',
                      borderRadius: '20px',
                    }}>
                      Best: {savedHigh}
                    </span>
                  </div>
                )}

                {/* Locked — progress bar */}
                {progressToUnlock !== null && (
                  <div>
                    <div style={{
                      fontSize: '11px',
                      color: '#e57373',
                      marginBottom: '4px',
                      fontWeight: '600',
                    }}>
                      Score {UNLOCK_THRESHOLD} in {TIERS[tier.id - 2].label} to unlock
                      ({prevHigh}/{UNLOCK_THRESHOLD})
                    </div>
                    <div style={{
                      height: '4px',
                      background: '#eeeeee',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${progressToUnlock}%`,
                        background: '#ef9a9a',
                        borderRadius: '4px',
                        transition: 'width 0.3s',
                      }} />
                    </div>
                  </div>
                )}

                {/* Coming soon */}
                {comingSoon && (
                  <div style={{ fontSize: '11px', color: '#aaa', fontWeight: '600' }}>
                    Coming soon
                  </div>
                )}
              </div>

              {/* Right icon */}
              <div style={{
                fontSize: '20px',
                color: unlocked ? '#1976d2' : '#cccccc',
                flexShrink: 0,
              }}>
                {comingSoon ? '🔒' : unlocked ? '›' : '🔒'}
              </div>
            </button>
          );
        })}

        {/* Leaderboard button */}
        <button
          onClick={onLeaderboard}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '16px',
            borderRadius: '18px',
            border: 'none',
            background: 'linear-gradient(135deg, #1565c0, #1976d2)',
            color: '#ffffff',
            fontSize: '17px',
            fontWeight: '700',
            cursor: 'pointer',
            marginTop: '8px',
            marginBottom: '10px',
            boxShadow: '0 4px 12px rgba(25,118,210,0.4)',
          }}
        >
          🏆 Global Leaderboard
        </button>

        <p style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#aaa',
          marginTop: '8px',
          marginBottom: '20px',
        }}>
          More tiers coming soon
        </p>
      </div>
    </div>
  );
};

export default HomeScreen;