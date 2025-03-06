
import { PitchType } from '../types/pitch';
import { applyCountBasedScoring, applyPatternRecognition, applyHandednessScoring } from './scoringUtils';

// Helper function to find key with highest score
export function findHighestScoringKey<T extends string>(scores: Record<T, number>): T {
  return Object.entries(scores)
    .sort((a, b) => {
      // Ensure we're comparing numbers by converting to numbers and handling null/undefined
      const scoreA = a[1] === null || a[1] === undefined ? 0 : Number(a[1]);
      const scoreB = b[1] === null || b[1] === undefined ? 0 : Number(b[1]);
      return scoreB - scoreA;
    })
    .map(entry => entry[0] as T)[0];
}

// Re-export all scoring utilities
export {
  applyCountBasedScoring,
  applyPatternRecognition,
  applyHandednessScoring
};
