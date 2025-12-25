
export enum SkinGoal {
  ACNE = 'Acne',
  HYPERPIGMENTATION = 'Hyperpigmentation',
  TEXTURE = 'Texture',
  ANTI_AGING = 'Anti-aging',
  RAZOR_BUMPS = 'Razor Bumps'
}

export enum ActiveType {
  RETINOID = 'Retinoid',
  AHA_BHA = 'AHA/BHA',
  VITAMIN_C = 'Vitamin C',
  BENZOYL_PEROXIDE = 'Benzoyl Peroxide',
  AZELAIC_ACID = 'Azelaic Acid',
  NIACINAMIDE = 'Niacinamide'
}

export interface UserProfile {
  name: string;
  goals: SkinGoal[];
  sensitivity: number; // 1-10
  shaves: boolean;
  fragranceTolerance: boolean;
}

export interface SymptomLog {
  timestamp: number;
  stinging: boolean;
  redness: boolean;
  peeling: boolean;
  dryness: boolean;
  burning: boolean;
}

export interface RoutineLog {
  timestamp: number;
  productName: string;
  category: 'cleanse' | 'moisturize' | 'active' | 'sunscreen';
  activesUsed: ActiveType[];
}

export interface EnvState {
  uvIndex: number;
  humidity: number;
  temp: number;
  pollution: number;
}

export interface SkinState {
  barrierScore: number;
  lastUpdated: number;
  currentSymptoms: SymptomLog;
}

export interface DecisionResult {
  status: 'GREEN' | 'YELLOW' | 'RED';
  reason: string;
  suggestion: string;
}
