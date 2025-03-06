
import { PitchType, PitchLocation } from '../types/pitch';
import { RecommendationScores } from '../types/historicalData';

// Function to integrate data-driven recommendations with rule-based system
export const mergeRecommendationScores = (
  ruleBasedScores: RecommendationScores,
  dataBasedScores: RecommendationScores,
  dataWeight: number = 0.5  // Weight given to data-driven recommendations (0-1)
): RecommendationScores => {
  const ruleWeight = 1 - dataWeight;
  
  // Merge pitch type scores
  const mergedTypeScores: Record<PitchType, number> = {} as Record<PitchType, number>;
  for (const type in ruleBasedScores.typeScores) {
    const ruleScore = ruleBasedScores.typeScores[type as PitchType] || 0;
    const dataScore = dataBasedScores.typeScores[type as PitchType] || 0;
    mergedTypeScores[type as PitchType] = (ruleScore * ruleWeight) + (dataScore * dataWeight);
  }
  
  // Merge location scores
  const mergedLocationScores: Record<PitchLocation, number> = {} as Record<PitchLocation, number>;
  for (const location in ruleBasedScores.locationScores) {
    const ruleScore = ruleBasedScores.locationScores[location as PitchLocation] || 0;
    const dataScore = dataBasedScores.locationScores[location as PitchLocation] || 0;
    mergedLocationScores[location as PitchLocation] = (ruleScore * ruleWeight) + (dataScore * dataWeight);
  }
  
  return { typeScores: mergedTypeScores, locationScores: mergedLocationScores };
};
