
/**
 * Utility functions to add controlled randomness to recommendations
 * to help prevent the algorithm from getting stuck in loops
 */

// Add small random perturbations to scores to break ties and repetitive patterns
export function addRandomness(
  scores: Record<string, number>,
  randomnessLevel: number = 0.15 // Default randomness factor (0.0-1.0)
): Record<string, number> {
  const result = { ...scores };
  
  // Apply random variations to each score
  Object.keys(result).forEach(key => {
    // Generate a random value between -randomnessLevel and +randomnessLevel
    const randomFactor = (Math.random() * 2 - 1) * randomnessLevel;
    
    // Calculate the maximum possible perturbation (proportional to the score's magnitude)
    const maxPerturbation = Math.abs(result[key] * randomnessLevel);
    
    // Apply the random perturbation
    result[key] += maxPerturbation * randomFactor;
  });
  
  return result;
}

// Add more weight to rarely used options to promote variety
export function promoteVariety(
  scores: Record<string, number>,
  recentChoices: string[],
  varietyBoost: number = 1.5 // Boost factor for rarely used options
): Record<string, number> {
  const result = { ...scores };
  
  if (recentChoices.length === 0) return result;
  
  // Count occurrences of each choice in recent history
  const occurrenceCounts: Record<string, number> = {};
  Object.keys(result).forEach(key => {
    occurrenceCounts[key] = recentChoices.filter(choice => choice === key).length;
  });
  
  // Find the least used options
  const minOccurrences = Math.min(...Object.values(occurrenceCounts));
  
  // Boost scores for less frequently used options
  Object.keys(result).forEach(key => {
    const occurrenceRatio = (occurrenceCounts[key] - minOccurrences) / recentChoices.length;
    // Apply inverse boost (less used = more boost)
    result[key] += (1 - occurrenceRatio) * varietyBoost;
  });
  
  return result;
}
