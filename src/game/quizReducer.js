export const PHASES = {
  INITIAL: 'initial',
  LOADING: 'loading',
  QUESTION: 'question',
  GAME_OVER: 'gameover',
};

export const initialState = {
  phase: PHASES.INITIAL,
  question: null,
  score: 0,
  streak: 0,
  remainingTime: 15,
  finalScore: 0,
  highScore: 0,
  tier: 1,
  level: 1,
};

export const quizReducer = (state, action) => {
  switch (action.type) {

    case 'LOADING':
      return { ...state, phase: PHASES.LOADING };

    case 'QUESTION_LOADED':
      return {
        ...state,
        phase: PHASES.QUESTION,
        question: action.question,
        score: action.score,
        streak: action.streak,
        remainingTime: 15,
      };

    case 'TICK':
      return { ...state, remainingTime: Math.max(0, state.remainingTime - 1) };

    case 'GAME_OVER':
      return {
        ...state,
        phase: PHASES.GAME_OVER,
        finalScore: action.finalScore,
        highScore: action.highScore,
      };

    case 'LEVEL_UP':
      return {
        ...state,
        level: Math.min(state.level + 1, 4),
      };

    case 'SET_TIER':
      return {
        ...initialState,
        tier: action.tier,
        phase: PHASES.INITIAL,
      };

    case 'RESTART':
      return {
        ...initialState,
        tier: state.tier,
        level: state.level,
        phase: PHASES.INITIAL,
      };

    default:
      return state;
  }
};