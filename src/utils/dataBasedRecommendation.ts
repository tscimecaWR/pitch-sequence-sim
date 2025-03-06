
import { HistoricalPitchData, CurrentPitchSituation, DataDrivenRecommendationResult } from '../types/historicalData';
import { getDataDrivenRecommendation } from './historicalDataAnalysis';
import { importHistoricalData } from './historicalDataImport';
import { addRandomness, promoteVariety } from './randomizationUtils';

// Re-export types and functions
export { 
  getDataDrivenRecommendation,
  importHistoricalData
};

export type { 
  HistoricalPitchData,
  CurrentPitchSituation,
  DataDrivenRecommendationResult
};

// Function to merge recommendation scores
export const mergeRecommendationScores = (
  ruleBasedScores: { typeScores: Record<string, number>; locationScores: Record<string, number> },
  dataBasedScores: { typeScores: Record<string, number>; locationScores: Record<string, number> },
  dataWeight: number = 0.8,  
  options: {
    randomness?: number;
    recentPitchTypes?: string[];
    recentLocations?: string[];
  } = {}
) => {
  const { 
    randomness = 0.15,
    recentPitchTypes = [],
    recentLocations = []
  } = options;
  
  const ruleWeight = 1 - dataWeight;
  
  // Merge pitch type scores
  const mergedTypeScores: Record<string, number> = {};
  for (const type in ruleBasedScores.typeScores) {
    const ruleScore = ruleBasedScores.typeScores[type] || 0;
    const dataScore = dataBasedScores.typeScores[type] || 0;
    mergedTypeScores[type] = (ruleScore * ruleWeight) + (dataScore * dataWeight);
  }
  
  // Merge location scores
  const mergedLocationScores: Record<string, number> = {};
  for (const location in ruleBasedScores.locationScores) {
    const ruleScore = ruleBasedScores.locationScores[location] || 0;
    const dataScore = dataBasedScores.locationScores[location] || 0;
    mergedLocationScores[location] = (ruleScore * ruleWeight) + (dataScore * dataWeight);
  }
  
  // Apply randomness and variety promotion
  const randomizedTypeScores = addRandomness(mergedTypeScores, randomness);
  const randomizedLocationScores = addRandomness(mergedLocationScores, randomness);
  
  const finalTypeScores = promoteVariety(randomizedTypeScores, recentPitchTypes);
  const finalLocationScores = promoteVariety(randomizedLocationScores, recentLocations);
  
  return { 
    typeScores: finalTypeScores, 
    locationScores: finalLocationScores 
  };
};
