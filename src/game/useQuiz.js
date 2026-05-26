import { useReducer, useEffect, useRef, useCallback } from 'react';
import { quizReducer, initialState, PHASES } from './quizReducer.js';
import { generateQuestion, filterByLevel } from './quizUtils.js';
import { fetchAllCountries } from '../services/countryApi.js';
import { saveScore, upsertHighScore } from '../services/supabaseService.js';

const HIGH_SCORE_KEY = (tier) => `quiz_high_score_tier_${tier}`;
const LEVEL_KEY = (tier) => `quiz_level_tier_${tier}`;
const LEVEL_UP_THRESHOLD = 10;

export const useQuiz = (tier = 1, user = null) => {
  const savedLevel = parseInt(localStorage.getItem(LEVEL_KEY(tier)) ?? '1', 10);

  const [state, dispatch] = useReducer(quizReducer, {
    ...initialState,
    tier,
    level: savedLevel,
  });

  const allCountriesRef = useRef([]);
  const usedCountriesRef = useRef(new Set());
  const currentScoreRef = useRef(0);
  const streakRef = useRef(0);
  const timerRef = useRef(null);

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);
  }, []);

  const handleGameOver = useCallback(async () => {
    stopTimer();
    streakRef.current = 0;
    const finalScore = currentScoreRef.current;
    const storedHigh = parseInt(localStorage.getItem(HIGH_SCORE_KEY(tier)) ?? '0', 10);
    const highScore = Math.max(finalScore, storedHigh);

    if (finalScore > storedHigh) {
      localStorage.setItem(HIGH_SCORE_KEY(tier), String(highScore));
    }

    if (finalScore >= LEVEL_UP_THRESHOLD && state.level < 4) {
      const newLevel = state.level + 1;
      localStorage.setItem(LEVEL_KEY(tier), String(newLevel));
      dispatch({ type: 'LEVEL_UP' });
    }

    // save to Supabase if user is available
    if (user) {
      await saveScore(user, finalScore, tier, state.level);
      if (finalScore > storedHigh) {
        await upsertHighScore(user, finalScore, tier);
      }
    }

    dispatch({ type: 'GAME_OVER', finalScore, highScore });
  }, [tier, state.level, user]);

  const nextQuestion = useCallback(() => {
    if (allCountriesRef.current.length === 0) return;

    const pool = filterByLevel(allCountriesRef.current, state.level);
    let available = pool.filter(c => !usedCountriesRef.current.has(c.cca2));

    if (available.length < 4) {
      usedCountriesRef.current.clear();
      available = pool;
    }

    const question = generateQuestion(available, tier, state.level);
    usedCountriesRef.current.add(question.correctCountry.cca2);

    dispatch({
      type: 'QUESTION_LOADED',
      question,
      score: currentScoreRef.current,
      streak: streakRef.current,
    });
  }, [tier, state.level]);

  const startQuiz = useCallback(async () => {
    dispatch({ type: 'LOADING' });
    currentScoreRef.current = 0;
    try {
      if (allCountriesRef.current.length > 0) {
        nextQuestion();
        return;
      }
      const countries = await fetchAllCountries();
      allCountriesRef.current = countries;
      nextQuestion();
    } catch {
      dispatch({ type: 'GAME_OVER', finalScore: 0, highScore: 0 });
    }
  }, [nextQuestion]);

  const submitAnswer = useCallback((selected) => {
    stopTimer();
    const correctAnswer = state.question?.correctAnswer;
    if (selected === correctAnswer) {
      currentScoreRef.current += 1;
      streakRef.current += 1;
      nextQuestion();
    } else {
      streakRef.current = 0;
      handleGameOver();
    }
  }, [state.question, nextQuestion, handleGameOver]);

  const restart = useCallback(() => {
    stopTimer();
    currentScoreRef.current = 0;
    streakRef.current = 0;
    usedCountriesRef.current.clear();
    dispatch({ type: 'RESTART' });
  }, []);

  // start timer when new question loads
  useEffect(() => {
    if (state.phase === PHASES.QUESTION) {
      startTimer();
    }
    return stopTimer;
  }, [state.phase, state.question, startTimer]);

  // game over when timer hits zero
  useEffect(() => {
    if (state.phase === PHASES.QUESTION && state.remainingTime === 0) {
      handleGameOver();
    }
  }, [state.remainingTime, state.phase, handleGameOver]);

  // start quiz on mount AND when phase goes back to INITIAL
  useEffect(() => {
    if (state.phase === PHASES.INITIAL) {
      startQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  return { state, submitAnswer, restart };
};