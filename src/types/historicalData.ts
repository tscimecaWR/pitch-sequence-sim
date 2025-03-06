
import { PitchType, PitchLocation, BatterHandedness, PitcherHandedness } from './pitch';

// Interface for historical pitch data
export interface HistoricalPitchData {
  type: PitchType;
  location: PitchLocation;
  count: { balls: number; strikes: number };
  batterHandedness: BatterHandedness;
  pitcherHandedness: PitcherHandedness;
  result: 'Successful' | 'Unsuccessful';  // Simplified outcome (strike/out vs ball/hit)
  situationId?: string;  // Optional identifier for specific game situations
  metadata?: {  // Additional data from the CSV schema
    date?: string;
    pitcher?: string;
    velocity?: number;
    spinRate?: number;
    horizontalBreak?: number;
    verticalBreak?: number;
    [key: string]: any;  // Allow for additional metadata fields
  };
}

// Type for recommendations score structure
export interface RecommendationScores {
  typeScores: Record<PitchType, number>;
  locationScores: Record<PitchLocation, number>;
}

// Type for the results of data-driven recommendations
export interface DataDrivenRecommendationResult extends RecommendationScores {
  insights: string[];
  pitcherNames?: string[];
}

// Type for the current pitch situation
export interface CurrentPitchSituation {
  count: { balls: number; strikes: number };
  batterHandedness: BatterHandedness;
  pitcherHandedness: PitcherHandedness;
  previousPitches?: any[];
}
