
import { PitchType, PitchLocation } from '../types/pitch';
import { 
  HistoricalPitchData, 
  CurrentPitchSituation, 
  DataDrivenRecommendationResult 
} from '../types/historicalData';

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

  // Extract the current situation
  const { count, batterHandedness, pitcherHandedness } = currentSituation;
  
  // Filter data based on the current situation
  const relevantData = historicalData.filter(pitch => {
    // Match by count (or close to it)
    const countMatch = pitch.count.balls === count.balls && pitch.count.strikes === count.strikes;
    
    // Match by handedness
    const handednessMatch = 
      pitch.batterHandedness === batterHandedness && 
      pitch.pitcherHandedness === pitcherHandedness;
    
    return countMatch && handednessMatch;
  });
  
  console.log(`Found ${relevantData.length} relevant pitches for this situation`);
  
  if (relevantData.length === 0) {
    insights.push("No historical data for this specific situation");
    return { typeScores, locationScores, insights, pitcherNames };
  }

  // Calculate success rates for each pitch type
  const typeCounts: Record<PitchType, { success: number, total: number }> = {
    'Fastball': { success: 0, total: 0 },
    'Curveball': { success: 0, total: 0 },
    'Slider': { success: 0, total: 0 },
    'Changeup': { success: 0, total: 0 },
    'Cutter': { success: 0, total: 0 },
    'Sinker': { success: 0, total: 0 },
    'Splitter': { success: 0, total: 0 }
  };
  
  // Calculate success rates for each location
  const locationCounts: Record<PitchLocation, { success: number, total: number }> = Object.keys(locationScores).reduce((acc, loc) => {
    acc[loc as PitchLocation] = { success: 0, total: 0 };
    return acc;
  }, {} as Record<PitchLocation, { success: number, total: number }>);
  
  // Track pitchers with successful pitches
  const successfulPitchers: Record<string, boolean> = {};
  
  // Analyze the data
  relevantData.forEach(pitch => {
    const isSuccess = pitch.result === 'Successful';
    
    // Count for pitch types
    typeCounts[pitch.type].total += 1;
    if (isSuccess) typeCounts[pitch.type].success += 1;
    
    // Count for locations
    locationCounts[pitch.location].total += 1;
    if (isSuccess) locationCounts[pitch.location].success += 1;
    
    // Track successful pitchers
    if (isSuccess && pitch.metadata?.pitcher && !successfulPitchers[pitch.metadata.pitcher]) {
      successfulPitchers[pitch.metadata.pitcher] = true;
      pitcherNames.push(pitch.metadata.pitcher);
    }
  });
  
  // Calculate scores based on success rates
  Object.entries(typeCounts).forEach(([type, data]) => {
    if (data.total >= 3) {  // Require at least 3 data points
      const successRate = data.success / data.total;
      typeScores[type as PitchType] = Math.round(successRate * 10);
      
      // Add insight for top pitches
      if (successRate > 0.6) {  // Lowered threshold to 60% to show more insights
        insights.push(`${type} has a ${Math.round(successRate * 100)}% success rate in similar situations (${data.success}/${data.total})`);
      }
    }
  });
  
  Object.entries(locationCounts).forEach(([location, data]) => {
    if (data.total >= 3) {  // Require at least 3 data points
      const successRate = data.success / data.total;
      locationScores[location as PitchLocation] = Math.round(successRate * 10);
      
      // Add insights for locations too
      if (successRate > 0.6) {
        insights.push(`${location} location has a ${Math.round(successRate * 100)}% success rate (${data.success}/${data.total})`);
      }
    }
  });
  
  // Add insights about the data
  if (insights.length === 0 && relevantData.length > 0) {
    // Find best pitch type
    const bestType = Object.entries(typeCounts)
      .filter(([_, data]) => data.total >= 3)
      .sort(([_, dataA], [__, dataB]) => {
        const rateA = dataA.success / dataA.total;
        const rateB = dataB.success / dataB.total;
        return rateB - rateA;
      })[0];
      
    if (bestType) {
      const [type, data] = bestType;
      const successRate = data.success / data.total;
      insights.push(`${type} is historically the most effective pitch in this situation (${Math.round(successRate * 100)}% success - ${data.success}/${data.total})`);
    }
  }
  
  // Add data sufficiency insight
  insights.push(`Analysis based on ${relevantData.length} similar historical pitches`);
  
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
