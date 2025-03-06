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

// Enhanced recommendation logic using both rule-based and data-driven systems
export const recommendNextPitch = (
  pitches: Pitch[], 
  options: { 
    dataWeight?: number;
    includeInsights?: boolean; 
  } = {}
): { 
  type: PitchType; 
  location: PitchLocation; 
  insights?: string[];
  pitcherNames?: string[];
} => {
  const { dataWeight = 0.5, includeInsights = true } = options;
  
  if (pitches.length === 0) {
    return {
      type: 'Fastball',
      location: 'Middle Middle',
      insights: includeInsights ? ['First pitch recommendation (no prior data)'] : undefined
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
  // 1.1 Full Count Analysis
  applyCountBasedScoring(pitchTypeScores, locationScores, currentCount);
  
  // 1.2 Pattern Recognition
  applyPatternRecognition(pitchTypeScores, locationScores, pitches);
  
  // 1.3 Apply handedness-based recommendations
  applyHandednessScoring(pitchTypeScores, locationScores, batterHandedness, pitcherHandedness);

  // Store rule-based scores
  const ruleBasedScores = {
    typeScores: { ...pitchTypeScores },
    locationScores: { ...locationScores }
  };

  // 2. DATA-DRIVEN SYSTEM
  // Pull insights from historical data if available
  const { typeScores: dataTypeScores, locationScores: dataLocationScores, insights, pitcherNames } = 
    getDataDrivenRecommendation({
      count: currentCount,
      batterHandedness,
      pitcherHandedness,
      previousPitches: pitches
    }, historicalPitchData);

  // 3. MERGE RECOMMENDATIONS
  // Combine rule-based and data-driven scores
  const mergedScores = mergeRecommendationScores(
    ruleBasedScores,
    { typeScores: dataTypeScores, locationScores: dataLocationScores },
    dataWeight
  );
  
  // Use the merged scores for final recommendation
  const bestPitchType = findHighestScoringKey(mergedScores.typeScores);
  const bestLocation = findHighestScoringKey(mergedScores.locationScores);

  return {
    type: bestPitchType,
    location: bestLocation,
    insights: includeInsights ? insights : undefined,
    pitcherNames
  };
};
