
import { PitchType, PitchLocation } from '../types/pitch';
import { RecommendationScores } from '../types/historicalData';
import { addRandomness, promoteVariety } from './randomizationUtils';

// Function to integrate data-driven recommendations with rule-based system
export const mergeRecommendationScores = (
  ruleBasedScores: RecommendationScores,
  dataBasedScores: RecommendationScores,
  dataWeight: number = 0.8,  // Weight given to data-driven recommendations (0-1)
  options: {
    randomness?: number;    // Level of randomness to apply (0-1)
    recentPitchTypes?: PitchType[];  // Recently used pitch types for variety promotion
    recentLocations?: PitchLocation[];  // Recently used locations for variety promotion
  } = {}
): RecommendationScores => {
  const { 
    randomness = 0.15,
    recentPitchTypes = [],
    recentLocations = []
  } = options;
  
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
  
  // Apply randomness to break loops and ties
  const randomizedTypeScores = addRandomness(mergedTypeScores, randomness);
  const randomizedLocationScores = addRandomness(mergedLocationScores, randomness);
  
  // Promote variety based on recent pitch history
  const finalTypeScores = promoteVariety(randomizedTypeScores, recentPitchTypes);
  const finalLocationScores = promoteVariety(randomizedLocationScores, recentLocations);
  
  return { 
    typeScores: finalTypeScores as Record<PitchType, number>, 
    locationScores: finalLocationScores as Record<PitchLocation, number> 
  };
};
