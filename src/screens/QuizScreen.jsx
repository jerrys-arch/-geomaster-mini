import { useState, useCallback } from 'react';
import { PHASES } from '../game/quizReducer.js';
import { useQuiz } from '../game/useQuiz.js';
import { useTelegram } from '../telegram/useTelegram.js';
import TimerBar from '../components/TimerBar.jsx';
import OptionButton from '../components/OptionButton.jsx';
import Shimmer from '../components/Shimmer.jsx';

const TIER_NAMES = { 1: 'Flag Quiz', 2: 'Capitals', 3: 'Population' };

const QuestionCard = ({ question, score, streak, remainingTime, onAnswer, answerStatus }) => {
  const danger = remainingTime <= 5;
  const showFlag = question.type !== 'population';

  return (
    <div style={{ padding: '20px' }}>

      {/* Score + Streak + Timer row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            key={score}
            className="pop"
            style={{ fontSize: '18px', fontWeight: '600' }}
          >
            Score: {score}
          </span>
          {streak >= 2 && (
            <span style={{
              fontSize: '15px',
              fontWeight: '700',
              color: '#ff6d00',
              animation: 'pop 0.3s ease',
            }}>
              🔥 {streak}
            </span>
          )}
        </div>
        <span style={{
          fontSize: '18px',
          fontWeight: '600',
          color: danger ? '#e53935' : '#1976d2',
        }}>
          ⏱ {remainingTime}s
        </span>
      </div>

      <TimerBar remaining={remainingTime} />

      {/* Flag for flag + capital questions */}
      {showFlag && (
        <div style={{
          height: '200px',
          borderRadius: '12px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          background: '#f5f5f5',
          transition: 'border 0.2s',
          border: answerStatus?.isCorrect === true
            ? '3px solid #4caf50'
            : answerStatus?.isCorrect === false
            ? '3px solid #e53935'
            : '3px solid transparent',
        }}>
          <img
            src={question.correctCountry.flagPng}
            alt="Flag"
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        </div>
      )}

      {/* Population globe */}
      {!showFlag && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '140px',
          fontSize: '90px',
          marginBottom: '24px',
        }}>
          🌍
        </div>
      )}

      {/* Question prompt */}
      <p style={{
        fontSize: '20px',
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: '20px',
        lineHeight: '1.4',
      }}>
        {question.prompt}
      </p>

      {/* Options */}
      {question.options.map(opt => {
        let status = null;
        if (answerStatus) {
          if (opt === question.correctAnswer) status = 'correct';
          else if (opt === answerStatus.selected) status = 'wrong';
        }
        return (
          <OptionButton
            key={opt}
            label={opt}
            onClick={onAnswer}
            disabled={!!answerStatus}
            status={status}
          />
        );
      })}
    </div>
  );
};

const GameOverScreen = ({ finalScore, highScore, tier, level, onRestart, onShare }) => {
  const isNewHigh = finalScore >= highScore && finalScore > 0;
  const leveledUp = finalScore >= 10 && level < 4;

  const getEmoji = () => {
    if (finalScore === 0) return '😢';
    if (finalScore < 5) return '😅';
    if (finalScore < 10) return '😊';
    if (finalScore < 20) return '🔥';
    return '🏆';
  };

  const getMessage = () => {
    if (finalScore === 0) return 'Better luck next time!';
    if (finalScore < 5) return 'Keep practicing!';
    if (finalScore < 10) return 'Not bad at all!';
    if (finalScore < 20) return "You're on fire!";
    return 'Absolutely legendary!';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0f4ff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px 20px',
      textAlign: 'center',
    }}>

      <div style={{
        fontSize: '80px',
        marginBottom: '12px',
        animation: 'pop 0.4s ease',
      }}>
        {getEmoji()}
      </div>

      <h1 style={{
        fontSize: '28px',
        fontWeight: '800',
        color: '#1565c0',
        marginBottom: '6px',
      }}>
        {getMessage()}
      </h1>

      <p style={{ fontSize: '15px', color: '#888', marginBottom: '28px' }}>
        Tier {tier} • Level {level}
      </p>

      {/* Score cards */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        width: '100%',
        maxWidth: '320px',
      }}>
        <div style={{
          flex: 1,
          background: '#ffffff',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        }}>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>
            Score
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: '800',
            color: '#1565c0',
          }}>
            {finalScore}
          </div>
        </div>

        <div style={{
          flex: 1,
          background: '#ffffff',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        }}>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>
            Best
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: '800',
            color: '#f57f17',
          }}>
            {highScore}
          </div>
        </div>
      </div>

      {isNewHigh && (
        <div style={{
          background: 'linear-gradient(135deg, #ff6d00, #ff9100)',
          borderRadius: '12px',
          padding: '12px 24px',
          marginBottom: '16px',
          color: '#ffffff',
          fontSize: '15px',
          fontWeight: '700',
          animation: 'pop 0.4s ease',
          width: '100%',
          maxWidth: '320px',
        }}>
          🎉 New High Score!
        </div>
      )}

      {leveledUp && (
        <div style={{
          background: 'linear-gradient(135deg, #2e7d32, #43a047)',
          borderRadius: '12px',
          padding: '12px 24px',
          marginBottom: '16px',
          color: '#ffffff',
          fontSize: '15px',
          fontWeight: '700',
          animation: 'pop 0.5s ease',
          width: '100%',
          maxWidth: '320px',
        }}>
          ⬆️ Level Up! Level {level + 1} Unlocked
        </div>
      )}

      <div style={{
        width: '100%',
        maxWidth: '320px',
        marginTop: '8px',
      }}>
        <button onClick={onRestart} style={{
          width: '100%',
          height: '55px',
          borderRadius: '15px',
          border: 'none',
          background: '#1976d2',
          color: '#ffffff',
          fontSize: '18px',
          fontWeight: '700',
          cursor: 'pointer',
          marginBottom: '12px',
          boxShadow: '0 4px 12px rgba(25,118,210,0.4)',
        }}>
          Play Again
        </button>

        <button onClick={onShare} style={{
          width: '100%',
          height: '55px',
          borderRadius: '15px',
          border: '2px solid #1976d2',
          background: 'transparent',
          color: '#1976d2',
          fontSize: '18px',
          fontWeight: '600',
          cursor: 'pointer',
        }}>
          📤 Challenge a Friend
        </button>
      </div>
    </div>
  );
};

const QuizScreen = ({ tier = 1, user, onBack }) => {
  const { state, submitAnswer, restart } = useQuiz(tier, user);
  const { shareScore } = useTelegram();
  const [answerStatus, setAnswerStatus] = useState(null);

  const handleAnswer = useCallback((selected) => {
    if (answerStatus) return;

    const correct = state.question?.correctAnswer;
    const isCorrect = selected === correct;

    setAnswerStatus({ selected, isCorrect });

    setTimeout(() => {
      setAnswerStatus(null);
      submitAnswer(selected);
    }, 800);
  }, [answerStatus, state.question, submitAnswer]);

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px 20px 0',
        gap: '12px',
        background: '#f0f4ff',
      }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none',
          fontSize: '24px', cursor: 'pointer',
          color: '#000000',
        }}>
          ←
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>
          {TIER_NAMES[tier]} • Level {state.level}
        </h2>
      </div>

      {(state.phase === PHASES.LOADING || state.phase === PHASES.INITIAL) && (
        <Shimmer />
      )}

      {state.phase === PHASES.QUESTION && state.question && (
        <QuestionCard
          question={state.question}
          score={state.score}
          streak={state.streak}
          remainingTime={state.remainingTime}
          onAnswer={handleAnswer}
          answerStatus={answerStatus}
        />
      )}

      {state.phase === PHASES.GAME_OVER && (
        <GameOverScreen
          finalScore={state.finalScore}
          highScore={state.highScore}
          tier={tier}
          level={state.level}
          onRestart={restart}
          onShare={() => shareScore(state.finalScore, state.highScore, tier)}
        />
      )}
    </div>
  );
};

export default QuizScreen;