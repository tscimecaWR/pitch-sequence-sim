import { Pitch, PitchType, PitchLocation, BatterHandedness, PitcherHandedness } from '../types/pitch';
import { 
  applyCountBasedScoring, 
  applyPatternRecognition, 
  applyHandednessScoring, 
  findHighestScoringKey 
} from './pitchScoring';
import { 
  getDataDrivenRecommendation, 
  mergeRecommendationScores,
  HistoricalPitchData
} from './dataBasedRecommendation';

// Static variable to hold historical data once loaded
let historicalPitchData: HistoricalPitchData[] = [];

// Function to set historical data
export const setHistoricalPitchData = (data: HistoricalPitchData[]): void => {
  historicalPitchData = data;
  console.log(`Loaded ${data.length} historical pitch records`);
};

// Debug utility to get historical data count
export const getHistoricalDataCount = (): number => {
  return historicalPitchData.length;
};

// Enhanced recommendation logic using both rule-based and data-driven systems
export const recommendNextPitch = (
  pitches: Pitch[], 
  options: { 
    dataWeight?: number;
    includeInsights?: boolean;
    randomness?: number;
    includeDebugInfo?: boolean;
  } = {}
): { 
  type: PitchType; 
  location: PitchLocation; 
  insights?: string[];
  pitcherNames?: string[];
  debugInfo?: any;
} => {
  const { 
    dataWeight = 0.8, 
    includeInsights = true,
    randomness = 0.15,
    includeDebugInfo = false
  } = options;
  
  const debugInfo: any = {
    historicalDataCount: historicalPitchData.length,
    timing: {}
  };
  
  debugInfo.timing.start = performance.now();
  
  if (pitches.length === 0) {
    return {
      type: 'Fastball',
      location: 'Middle Middle',
      insights: includeInsights ? ['First pitch recommendation (no prior data)'] : undefined,
      debugInfo: includeDebugInfo ? debugInfo : undefined
    };
  }

  // Create scoring matrix for pitch types and locations
  const pitchTypeScores: Record<PitchType, number> = {
    'Fastball': 0,
    'Curveball': 0,
    'Slider': 0,
    'Changeup': 0,
    'Cutter': 0,
    'Sinker': 0,
    'Splitter': 0
  };
  
  const locationScores: Record<PitchLocation, number> = {
    // Strike zone
    'High Inside': 0, 'High Middle': 0, 'High Outside': 0,
    'Middle Inside': 0, 'Middle Middle': 0, 'Middle Outside': 0,
    'Low Inside': 0, 'Low Middle': 0, 'Low Outside': 0,
    // Ball zone
    'Way High Inside': 0, 'Way High': 0, 'Way High Outside': 0,
    'Way Inside': 0, 'Way Outside': 0,
    'Way Low Inside': 0, 'Way Low': 0, 'Way Low Outside': 0
  };

  // Get current count
  const lastPitch = pitches[pitches.length - 1];
  const currentCount = lastPitch.count?.after || { balls: 0, strikes: 0 };

  // Get handedness information from the last pitch
  const batterHandedness = lastPitch.batterHandedness || 'Right';
  const pitcherHandedness = lastPitch.pitcherHandedness || 'Right';

  // 1. RULE-BASED SYSTEM
  debugInfo.timing.ruleBasedStart = performance.now();
  
  // 1.1 Full Count Analysis
  applyCountBasedScoring(pitchTypeScores, locationScores, currentCount);
  
  // 1.2 Pattern Recognition
  applyPatternRecognition(pitchTypeScores, locationScores, pitches);
  
  // 1.3 Apply handedness-based recommendations
  applyHandednessScoring(pitchTypeScores, locationScores, batterHandedness, pitcherHandedness);

  // 1.4 Apply specific rules to avoid sliders and changeups in the top half of the zone
  const topHalfLocations: PitchLocation[] = [
    'High Inside', 'High Middle', 'High Outside',
    'Way High Inside', 'Way High', 'Way High Outside'
  ];
  
  // Direct override - heavily penalize these combinations regardless of other factors
  const pitchTypesToAvoidHigh: PitchType[] = ['Slider', 'Changeup'];
  
  // Add extra insights for the avoidance rule
  let avoidanceInsights: string[] = [];
  
  // Apply direct penalties to avoid these combinations
  for (const pitchType of pitchTypesToAvoidHigh) {
    for (const location of topHalfLocations) {
      // Apply a strong direct penalty that will generally avoid this combination
      locationScores[location] -= 10;
      
      // If this would be the chosen combination, add an insight
      if (pitchTypeScores[pitchType] === Math.max(...Object.values(pitchTypeScores)) &&
          locationScores[location] === Math.max(...Object.values(locationScores))) {
        avoidanceInsights.push(`Avoiding ${pitchType} in ${location} location (elevated location risk)`);
      }
    }
  }

  debugInfo.timing.ruleBasedEnd = performance.now();
  debugInfo.ruleBasedDuration = debugInfo.timing.ruleBasedEnd - debugInfo.timing.ruleBasedStart;

  // Store rule-based scores
  const ruleBasedScores = {
    typeScores: { ...pitchTypeScores },
    locationScores: { ...locationScores }
  };
  
  debugInfo.ruleBasedScores = ruleBasedScores;

  // 2. DATA-DRIVEN SYSTEM
  debugInfo.timing.dataBasedStart = performance.now();
  
  // Pull insights from historical data if available
  const dataBasedResult = getDataDrivenRecommendation({
    count: currentCount,
    batterHandedness,
    pitcherHandedness,
    previousPitches: pitches
  }, historicalPitchData);
  
  const { typeScores: dataTypeScores, locationScores: dataLocationScores, insights, pitcherNames } = dataBasedResult;
  
  debugInfo.timing.dataBasedEnd = performance.now();
  debugInfo.dataBasedDuration = debugInfo.timing.dataBasedEnd - debugInfo.timing.dataBasedStart;
  debugInfo.dataBasedResult = dataBasedResult;

  // Extract recent pitch types and locations for variety promotion
  const recentPitchTypes = pitches.slice(-3).map(p => p.type);
  const recentLocations = pitches.slice(-3).map(p => p.location);

  // 3. MERGE RECOMMENDATIONS
  debugInfo.timing.mergeStart = performance.now();
  
  // Combine rule-based and data-driven scores with randomness to break loops
  const mergedScores = mergeRecommendationScores(
    ruleBasedScores,
    { typeScores: dataTypeScores, locationScores: dataLocationScores },
    dataWeight,
    { randomness, recentPitchTypes, recentLocations }
  );
  
  debugInfo.timing.mergeEnd = performance.now();
  debugInfo.mergeDuration = debugInfo.timing.mergeEnd - debugInfo.timing.mergeStart;
  debugInfo.mergedScores = mergedScores;
  
  // Use the merged scores for final recommendation
  const bestPitchType = findHighestScoringKey(mergedScores.typeScores) as PitchType;
  const bestLocation = findHighestScoringKey(mergedScores.locationScores) as PitchLocation;
  
  // Final validation - if we still ended up with slider/changeup in top half, force a recalculation
  if (pitchTypesToAvoidHigh.includes(bestPitchType) && topHalfLocations.includes(bestLocation)) {
    // Force a different location by finding the best location that's not in the top half
    const validLocations = Object.entries(mergedScores.locationScores)
      .filter(([loc, _]) => !topHalfLocations.includes(loc as PitchLocation))
      .sort((a, b) => Number(b[1]) - Number(a[1]));
    
    if (validLocations.length > 0) {
      // Use the best scoring non-top-half location
      const bestAlternativeLocation = validLocations[0][0] as PitchLocation;
      
      // Add insight about the override
      avoidanceInsights.push(`Relocated ${bestPitchType} from ${bestLocation} to ${bestAlternativeLocation} (top half avoidance rule)`);
      
      debugInfo.timing.end = performance.now();
      debugInfo.totalDuration = debugInfo.timing.end - debugInfo.timing.start;
      
      // Return with override
      return {
        type: bestPitchType,
        location: bestAlternativeLocation,
        insights: includeInsights ? [...(insights || []), ...avoidanceInsights, 'Added randomness to avoid repetitive patterns'] : undefined,
        pitcherNames,
        debugInfo: includeDebugInfo ? debugInfo : undefined
      };
    }
  }

  // Add randomness insight
  const randomnessInsight = ['Added randomness to avoid repetitive patterns'];

  // Add any avoidance insights to the final insights
  const finalInsights = includeInsights ? 
    [...(insights || []), ...avoidanceInsights, ...randomnessInsight] : 
    undefined;
    
  debugInfo.timing.end = performance.now();
  debugInfo.totalDuration = debugInfo.timing.end - debugInfo.timing.start;

  return {
    type: bestPitchType,
    location: bestLocation,
    insights: finalInsights,
    pitcherNames,
    debugInfo: includeDebugInfo ? debugInfo : undefined
  };
};
