
import { PitchType, PitchLocation } from '../types/pitch';
import { 
  HistoricalPitchData, 
  CurrentPitchSituation, 
  DataDrivenRecommendationResult 
} from '../types/historicalData';

// Helper function to calculate similarity score between two situations
const calculateSimilarityScore = (
  current: CurrentPitchSituation,
  historical: HistoricalPitchData
): number => {
  let score = 0;
  const maxScore = 10;
  
  // Count similarity (0-4 points)
  // Perfect count match
  if (current.count.balls === historical.count.balls && 
      current.count.strikes === historical.count.strikes) {
    score += 4;
  } 
  // Similar count - same total (e.g., 2-1 vs 1-2)
  else if (current.count.balls + current.count.strikes === 
           historical.count.balls + historical.count.strikes) {
    score += 2;
  }
  // Similar pressure - two strikes or three balls
  else if ((current.count.strikes === 2 && historical.count.strikes === 2) ||
           (current.count.balls === 3 && historical.count.balls === 3)) {
    score += 3;
  }
  // Somewhat similar count
  else if (Math.abs(current.count.balls - historical.count.balls) <= 1 &&
           Math.abs(current.count.strikes - historical.count.strikes) <= 1) {
    score += 1;
  }
  
  // Handedness similarity (0-6 points)
  // Perfect handedness match
  if (current.batterHandedness === historical.batterHandedness && 
      current.pitcherHandedness === historical.pitcherHandedness) {
    score += 6;
  }
  // Partial handedness match (batter only)
  else if (current.batterHandedness === historical.batterHandedness) {
    score += 3;
  }
  // Partial handedness match (pitcher only)
  else if (current.pitcherHandedness === historical.pitcherHandedness) {
    score += 3;
  }
  
  // Normalize score to a 0-1 range
  return score / maxScore;
};

// Central function to get data-driven pitch recommendations
export const getDataDrivenRecommendation = (
  currentSituation: CurrentPitchSituation,
  historicalData: HistoricalPitchData[] = []
): DataDrivenRecommendationResult => {
  // Initialize scores
  const typeScores: Record<PitchType, number> = {
    'Fastball': 0, 'Curveball': 0, 'Slider': 0, 'Changeup': 0,
    'Cutter': 0, 'Sinker': 0, 'Splitter': 0
  };
  
  const locationScores: Record<PitchLocation, number> = {
    'High Inside': 0, 'High Middle': 0, 'High Outside': 0,
    'Middle Inside': 0, 'Middle Middle': 0, 'Middle Outside': 0,
    'Low Inside': 0, 'Low Middle': 0, 'Low Outside': 0,
    'Way High Inside': 0, 'Way High': 0, 'Way High Outside': 0,
    'Way Inside': 0, 'Way Outside': 0,
    'Way Low Inside': 0, 'Way Low': 0, 'Way Low Outside': 0
  };
  
  const insights: string[] = [];
  const pitcherNames: string[] = [];

  // Log data received
  console.log(`Processing data-driven recommendation with ${historicalData.length} historical records`);
  
  // Immediately return if no historical data
  if (historicalData.length === 0) {
    insights.push("No historical data available");
    return { typeScores, locationScores, insights, pitcherNames };
  }

  // Fuzzy match threshold (minimum similarity score to consider)
  const SIMILARITY_THRESHOLD = 0.4; // 40% similarity required
  
  // Calculate similarity scores for all historical pitches
  const relevantData = historicalData
    .map(pitch => ({
      pitch,
      similarityScore: calculateSimilarityScore(currentSituation, pitch)
    }))
    .filter(item => item.similarityScore >= SIMILARITY_THRESHOLD)
    .sort((a, b) => b.similarityScore - a.similarityScore);

  // Limit to the most relevant matches
  const MAX_RELEVANT_PITCHES = 100;
  const topRelevantData = relevantData.slice(0, MAX_RELEVANT_PITCHES);
  
  console.log(`Found ${topRelevantData.length} relevant pitches with fuzzy matching (threshold: ${SIMILARITY_THRESHOLD})`);
  
  if (topRelevantData.length === 0) {
    insights.push("No similar situations found in historical data");
    return { typeScores, locationScores, insights, pitcherNames };
  }

  // Group similar pitches for reporting
  const exactMatches = topRelevantData.filter(item => item.similarityScore === 1).length;
  const strongMatches = topRelevantData.filter(item => item.similarityScore >= 0.8 && item.similarityScore < 1).length;
  const moderateMatches = topRelevantData.filter(item => item.similarityScore >= 0.6 && item.similarityScore < 0.8).length;
  const weakMatches = topRelevantData.filter(item => item.similarityScore >= SIMILARITY_THRESHOLD && item.similarityScore < 0.6).length;
  
  // Add insight about match quality
  if (exactMatches > 0) {
    insights.push(`Found ${exactMatches} exact situation matches in historical data`);
  }
  if (strongMatches > 0 || moderateMatches > 0 || weakMatches > 0) {
    insights.push(`Found ${strongMatches + moderateMatches + weakMatches} similar situations (${strongMatches} strong, ${moderateMatches} moderate, ${weakMatches} partial matches)`);
  }

  // Calculate success rates for each pitch type with weighted scoring
  const typeCounts: Record<PitchType, { success: number, total: number, weightedSuccess: number }> = {
    'Fastball': { success: 0, total: 0, weightedSuccess: 0 },
    'Curveball': { success: 0, total: 0, weightedSuccess: 0 },
    'Slider': { success: 0, total: 0, weightedSuccess: 0 },
    'Changeup': { success: 0, total: 0, weightedSuccess: 0 },
    'Cutter': { success: 0, total: 0, weightedSuccess: 0 },
    'Sinker': { success: 0, total: 0, weightedSuccess: 0 },
    'Splitter': { success: 0, total: 0, weightedSuccess: 0 }
  };
  
  // Calculate success rates for each location with weighted scoring
  const locationCounts: Record<PitchLocation, { success: number, total: number, weightedSuccess: number }> = 
    Object.keys(locationScores).reduce((acc, loc) => {
      acc[loc as PitchLocation] = { success: 0, total: 0, weightedSuccess: 0 };
      return acc;
    }, {} as Record<PitchLocation, { success: number, total: number, weightedSuccess: number }>);
  
  // Track pitchers with successful pitches
  const successfulPitchers: Record<string, boolean> = {};
  
  // Analyze the data with weighted importance based on similarity score
  topRelevantData.forEach(({ pitch, similarityScore }) => {
    const isSuccess = pitch.result === 'Successful';
    const weight = similarityScore; // Use similarity as weighting factor
    
    // Count for pitch types
    typeCounts[pitch.type].total += 1;
    typeCounts[pitch.type].weightedSuccess += isSuccess ? weight : 0;
    if (isSuccess) typeCounts[pitch.type].success += 1;
    
    // Count for locations
    locationCounts[pitch.location].total += 1;
    locationCounts[pitch.location].weightedSuccess += isSuccess ? weight : 0;
    if (isSuccess) locationCounts[pitch.location].success += 1;
    
    // Track successful pitchers
    if (isSuccess && pitch.metadata?.pitcher && !successfulPitchers[pitch.metadata.pitcher]) {
      successfulPitchers[pitch.metadata.pitcher] = true;
      pitcherNames.push(pitch.metadata.pitcher);
    }
  });
  
  // Lower minimum data point threshold with fuzzy matching
  const MIN_DATA_POINTS = 2; // Reduced from 3 in the original code
  
  // Calculate scores based on weighted success rates
  Object.entries(typeCounts).forEach(([type, data]) => {
    if (data.total >= MIN_DATA_POINTS) {
      const weightedSuccessRate = data.weightedSuccess / data.total;
      const rawSuccessRate = data.success / data.total;
      typeScores[type as PitchType] = Math.round(weightedSuccessRate * 10);
      
      // Add insight for top pitches
      if (rawSuccessRate > 0.5) {  // Further lowered threshold for insights
        insights.push(`${type} has a ${Math.round(rawSuccessRate * 100)}% success rate in similar situations (${data.success}/${data.total})`);
      }
    }
  });
  
  Object.entries(locationCounts).forEach(([location, data]) => {
    if (data.total >= MIN_DATA_POINTS) {
      const weightedSuccessRate = data.weightedSuccess / data.total;
      const rawSuccessRate = data.success / data.total;
      locationScores[location as PitchLocation] = Math.round(weightedSuccessRate * 10);
      
      // Add insights for locations too
      if (rawSuccessRate > 0.5) {
        insights.push(`${location} location has a ${Math.round(rawSuccessRate * 100)}% success rate (${data.success}/${data.total})`);
      }
    }
  });
  
  // Add insights about the data
  if (insights.length <= 2) { // If we only have the match quality insights
    // Find best pitch type
    const bestType = Object.entries(typeCounts)
      .filter(([_, data]) => data.total >= MIN_DATA_POINTS)
      .sort(([_, dataA], [__, dataB]) => {
        const rateA = dataA.success / dataA.total;
        const rateB = dataB.success / dataB.total;
        return rateB - rateA;
      })[0];
      
    if (bestType) {
      const [type, data] = bestType;
      const successRate = data.success / data.total;
      insights.push(`${type} is historically the most effective pitch in similar situations (${Math.round(successRate * 100)}% success - ${data.success}/${data.total})`);
    }
  }
  
  // Add data sufficiency insight
  insights.push(`Analysis based on ${topRelevantData.length} similar historical pitches using fuzzy matching`);
  
  // Add insights about successful pitchers if available
  if (pitcherNames.length > 0) {
    if (pitcherNames.length === 1) {
      insights.push(`${pitcherNames[0]} has had success with this pitch selection`);
    } else if (pitcherNames.length <= 3) {
      insights.push(`Pitchers like ${pitcherNames.join(', ')} have had success with this approach`);
    } else {
      insights.push(`${pitcherNames.length} pitchers have had success with this approach`);
    }
  }
  
  return { typeScores, locationScores, insights, pitcherNames };
};
