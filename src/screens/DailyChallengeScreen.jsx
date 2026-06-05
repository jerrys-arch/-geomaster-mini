import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchAllCountries } from '../services/countryApi.js';
import { generateDailyQuestions } from '../game/quizUtils.js';
import { getTodayDate, getDailyResult, saveDailyResult, getDailyLeaderboard } from '../services/supabaseService.js';
import TimerBar from '../components/TimerBar.jsx';
import OptionButton from '../components/OptionButton.jsx';
import Shimmer from '../components/Shimmer.jsx';

const TOTAL_QUESTIONS = 10;

const DailyChallengeScreen = ({ user, onBack }) => {
  const [phase, setPhase] = useState('loading');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [answerStatus, setAnswerStatus] = useState(null);
  const [remainingTime, setRemainingTime] = useState(15);
  const [todayResult, setTodayResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  const today = getTodayDate();
  const scoreRef = useRef(0);
  const currentIndexRef = useRef(0);

  useEffect(() => {
    const init = async () => {
      if (user && typeof user.id === 'number') {
        const existing = await getDailyResult(user.id, 1);
        if (existing) {
          setTodayResult(existing);
          const lb = await getDailyLeaderboard(1, 20);
          setLeaderboard(lb);
          setPhase('result');
          return;
        }
      }
      const countries = await fetchAllCountries();
      const qs = generateDailyQuestions(countries, 1, today, TOTAL_QUESTIONS);
      setQuestions(qs);
      setPhase('intro');
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = useCallback(async (selected) => {
    if (answerStatus) return;

    const question = questions[currentIndexRef.current];
    if (!question) return;

    const isCorrect = selected === question.correctAnswer;
    setAnswerStatus({ selected, isCorrect });
    setAnswers(prev => [...prev, { question, selected, isCorrect }]);

    if (isCorrect) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
    }

    const delay = isCorrect ? 600 : 1500;

    setTimeout(async () => {
      setAnswerStatus(null);
      const nextIndex = currentIndexRef.current + 1;

      if (nextIndex >= TOTAL_QUESTIONS) {
        const finalScore = scoreRef.current;
        if (user && typeof user.id === 'number') {
          await saveDailyResult(user, finalScore, TOTAL_QUESTIONS, 1);
        }
        const lb = await getDailyLeaderboard(1, 20);
        setLeaderboard(lb);
        setTodayResult({ score: finalScore, total: TOTAL_QUESTIONS });
        setPhase('result');
      } else {
        currentIndexRef.current = nextIndex;
        setCurrentIndex(nextIndex);
        setRemainingTime(15);
      }
    }, delay);
  }, [answerStatus, questions, user]);

  // timer
  useEffect(() => {
    if (phase !== 'playing' || answerStatus) return;
    if (remainingTime === 0) {
      handleAnswer(null);
      return;
    }
    const t = setTimeout(() => setRemainingTime(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, remainingTime, answerStatus, handleAnswer]);

  const getTimeUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  const getScoreEmoji = (s) => {
    if (s === 10) return '🏆';
    if (s >= 8) return '🔥';
    if (s >= 6) return '😊';
    if (s >= 4) return '😅';
    return '😢';
  };

  if (phase === 'loading') return <Shimmer />;

  if (phase === 'intro') return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', position: 'relative' }}>
      <div style={{
        background: 'linear-gradient(135deg, #1565c0, #42a5f5)',
        padding: '40px 20px 40px',
        textAlign: 'center',
        color: '#fff',
        position: 'relative',
      }}>
        <button onClick={onBack} style={{
          position: 'absolute', left: '20px', top: '20px',
          background: 'none', border: 'none', fontSize: '24px',
          cursor: 'pointer', color: '#fff',
        }}>←</button>
        <div style={{ fontSize: '64px', marginBottom: '12px' }}>📅</div>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
          Daily Challenge
        </h1>
        <p style={{ fontSize: '15px', opacity: 0.85 }}>{today}</p>
      </div>

      <div style={{ padding: '24px 20px' }}>
        <div style={{
          background: '#fff', borderRadius: '16px', padding: '20px',
          marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        }}>
          <h3 style={{ fontWeight: '700', marginBottom: '12px', fontSize: '17px' }}>
            How it works
          </h3>
          <div style={{ fontSize: '14px', color: '#555', lineHeight: '1.8' }}>
            <p>🌍 10 flag questions — same for everyone today</p>
            <p>⏱ 15 seconds per question</p>
            <p>❌ No second chances — one attempt per day</p>
            <p>🏆 Compare your score with players worldwide</p>
            <p>🔄 New challenge resets at midnight</p>
          </div>
        </div>

        <button
          onClick={() => { setPhase('playing'); setRemainingTime(15); }}
          style={{
            width: '100%', height: '60px', borderRadius: '16px',
            border: 'none', background: 'linear-gradient(135deg, #1565c0, #1976d2)',
            color: '#fff', fontSize: '20px', fontWeight: '800',
            cursor: 'pointer', boxShadow: '0 4px 16px rgba(25,118,210,0.4)',
          }}
        >
          Start Challenge 🚀
        </button>
      </div>
    </div>
  );

  if (phase === 'playing') {
    const question = questions[currentIndex];
    const danger = remainingTime <= 5;

    return (
      <div style={{ minHeight: '100vh', background: '#f0f4ff' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1565c0, #1976d2)',
          padding: '16px 20px', color: '#fff',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ fontSize: '15px', fontWeight: '700' }}>📅 Daily</div>
          <div style={{ fontSize: '15px', fontWeight: '700' }}>
            {currentIndex + 1} / {TOTAL_QUESTIONS}
          </div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: danger ? '#ff6d00' : '#fff' }}>
            ⏱ {remainingTime}s
          </div>
        </div>

        {/* Progress dots */}
        <div style={{
          display: 'flex', gap: '6px', padding: '12px 20px',
          justifyContent: 'center',
        }}>
          {[...Array(TOTAL_QUESTIONS)].map((_, i) => {
            const ans = answers[i];
            return (
              <div key={i} style={{
                width: '24px', height: '8px', borderRadius: '4px',
                background: ans
                  ? ans.isCorrect ? '#4caf50' : '#e53935'
                  : i === currentIndex ? '#1976d2' : '#e0e0e0',
                transition: 'background 0.3s',
              }} />
            );
          })}
        </div>

        <TimerBar remaining={remainingTime} />

        <div style={{ padding: '0 20px 20px' }}>
          <div style={{
            height: '180px', borderRadius: '12px', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '20px', background: '#f5f5f5',
            border: answerStatus?.isCorrect === true
              ? '3px solid #4caf50'
              : answerStatus?.isCorrect === false
              ? '3px solid #e53935'
              : '3px solid transparent',
            transition: 'border 0.2s',
          }}>
            <img
              src={question.correctCountry.flagPng}
              alt="Flag"
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              onError={(e) => {
                if (e.currentTarget.src !== question.correctCountry.flagSvg) {
                  e.currentTarget.src = question.correctCountry.flagSvg;
                }
              }}
            />
          </div>

          <p style={{
            fontSize: '20px', fontWeight: '600',
            textAlign: 'center', marginBottom: '16px',
          }}>
            {question.prompt}
          </p>

          {answerStatus && !answerStatus.isCorrect && (
            <div style={{
              textAlign: 'center', fontSize: '14px',
              color: '#2e7d32', fontWeight: '600',
              marginBottom: '8px', animation: 'pop 0.3s ease',
            }}>
              ✅ {question.correctAnswer}
            </div>
          )}

          {question.options.map(opt => {
            let status = null;
            if (answerStatus) {
              if (opt === question.correctAnswer) status = 'correct';
              else if (opt === answerStatus.selected && !answerStatus.isCorrect) status = 'wrong';
            }
            return (
              <OptionButton
                key={opt}
                label={opt}
                onClick={handleAnswer}
                disabled={!!answerStatus}
                status={status}
              />
            );
          })}
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    const s = todayResult?.score ?? 0;
    const t = todayResult?.total ?? TOTAL_QUESTIONS;

    return (
      <div style={{ minHeight: '100vh', background: '#f0f4ff' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1565c0, #42a5f5)',
          padding: '40px 20px 32px',
          textAlign: 'center', color: '#fff', position: 'relative',
        }}>
          <button onClick={onBack} style={{
            position: 'absolute', left: '20px', top: '20px',
            background: 'none', border: 'none', fontSize: '24px',
            cursor: 'pointer', color: '#fff',
          }}>←</button>
          <div style={{ fontSize: '64px', marginBottom: '8px' }}>
            {getScoreEmoji(s)}
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>
            {s} / {t}
          </h1>
          <p style={{ fontSize: '15px', opacity: 0.85, marginBottom: '8px' }}>
            Today's Challenge • {today}
          </p>
          <p style={{ fontSize: '13px', opacity: 0.7 }}>
            Next challenge in {getTimeUntilMidnight()}
          </p>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Answer review */}
          {answers.length > 0 && (
            <div style={{
              background: '#fff', borderRadius: '16px', padding: '16px',
              marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            }}>
              <h3 style={{ fontWeight: '700', marginBottom: '12px' }}>Your Answers</h3>
              {answers.map((ans, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 0',
                  borderBottom: i < answers.length - 1 ? '1px solid #f0f0f0' : 'none',
                }}>
                  <span style={{ fontSize: '18px' }}>
                    {ans.isCorrect ? '✅' : '❌'}
                  </span>
                  <img
                    src={ans.question.correctCountry.flagPng}
                    alt=""
                    style={{ width: '32px', height: '22px', objectFit: 'contain' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>
                      {ans.question.correctAnswer}
                    </div>
                    {!ans.isCorrect && ans.selected && (
                      <div style={{ fontSize: '12px', color: '#e53935' }}>
                        You said: {ans.selected}
                      </div>
                    )}
                    {!ans.isCorrect && !ans.selected && (
                      <div style={{ fontSize: '12px', color: '#e53935' }}>
                        Time ran out
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Today's leaderboard */}
          {leaderboard.length > 0 && (
            <div style={{
              background: '#fff', borderRadius: '16px', padding: '16px',
              marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            }}>
              <h3 style={{ fontWeight: '700', marginBottom: '12px' }}>
                Today's Top Players
              </h3>
              {leaderboard.slice(0, 5).map((row, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 0',
                  borderBottom: i < 4 ? '1px solid #f0f0f0' : 'none',
                }}>
                  <span style={{ fontSize: '18px', width: '28px' }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </span>
                  <div style={{ flex: 1, fontSize: '14px', fontWeight: '600' }}>
                    {row.first_name}
                  </div>
                  <div style={{ fontWeight: '800', color: '#1565c0' }}>
                    {row.score}/{row.total}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              const text = `I scored ${s}/${t} on today's GeoMaster Daily Challenge! 🌍 Can you beat me?\n${today}`;
              const url = `https://t.me/share/url?url=${encodeURIComponent('https://t.me/GeoMasterQuiz_bot/play')}&text=${encodeURIComponent(text)}`;
              window.Telegram?.WebApp?.openTelegramLink(url) ?? window.open(url, '_blank');
            }}
            style={{
              width: '100%', height: '55px', borderRadius: '15px',
              border: 'none', background: '#1976d2', color: '#fff',
              fontSize: '18px', fontWeight: '700', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(25,118,210,0.4)',
            }}
          >
            📤 Share My Result
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default DailyChallengeScreen;