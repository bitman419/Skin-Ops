
import { SkinState, EnvState, RoutineLog, SymptomLog, ActiveType, DecisionResult } from '../types';

export const calculateBarrierScore = (
  currentScore: number,
  symptoms: SymptomLog,
  history: RoutineLog[],
  env: EnvState
): number => {
  let score = currentScore;

  // Penalties
  if (symptoms.stinging) score -= 25;
  if (symptoms.burning) score -= 30;
  if (symptoms.peeling) score -= 15;
  if (symptoms.redness) score -= 10;
  
  // Environment Penalties
  if (env.uvIndex > 8) score -= 5;
  if (env.humidity < 30) score -= 5;

  // Recovery - Check if last 24h had no actives
  const dayInMs = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const recentActives = history.filter(h => h.timestamp > now - dayInMs && h.category === 'active');
  
  if (recentActives.length === 0 && score < 100) {
    score += 10; // Bonus for rest
  }

  // Sanitize
  return Math.min(Math.max(score, 0), 100);
};

export const getStatusColor = (score: number): string => {
  if (score > 75) return 'text-green-400';
  if (score > 55) return 'text-blue-400';
  if (score > 30) return 'text-yellow-400';
  return 'text-red-500';
};

export const decideOnActive = (
  active: ActiveType,
  score: number,
  symptoms: SymptomLog,
  env: EnvState
): DecisionResult => {
  // Priority 1: Severe Symptoms
  if (symptoms.stinging || symptoms.burning) {
    return {
      status: 'RED',
      reason: 'Active inflammation detected via stinging/burning reports.',
      suggestion: 'Skip all actives. Focus on cica creams or petroleum jelly.'
    };
  }

  // Priority 2: Critical Barrier
  if (score < 40) {
    return {
      status: 'RED',
      reason: 'Barrier score is in the critical recovery zone.',
      suggestion: 'Strictly restorative routine: Ceramide moisturizer + gentle cleanser.'
    };
  }

  // Priority 3: Environmental
  if (env.uvIndex > 7 && (active === ActiveType.RETINOID || active === ActiveType.AHA_BHA)) {
    return {
      status: 'YELLOW',
      reason: 'High UV index today increases photosensitivity risks with this active.',
      suggestion: 'Save for PM use or skip if planning high outdoor exposure.'
    };
  }

  // Specific Active Logic
  if (active === ActiveType.AHA_BHA && score < 65) {
    return {
      status: 'YELLOW',
      reason: 'Exfoliants on a compromised barrier lead to micro-tears.',
      suggestion: 'Swap for a PHA or just a hydrating toner.'
    };
  }

  return {
    status: 'GREEN',
    reason: 'Skin integrity is stable and environmental load is manageable.',
    suggestion: 'Proceed as planned, but monitor for immediate reaction.'
  };
};
