import { Pitch, PitchType, PitchLocation, BatterHandedness, PitcherHandedness } from '../types/pitch';

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

// Sample data - would be replaced with actual dataset
const SAMPLE_DATA: HistoricalPitchData[] = [
  // This is placeholder data - would be replaced with your actual dataset
  {
    type: 'Fastball',
    location: 'High Inside',
    count: { balls: 0, strikes: 0 },
    batterHandedness: 'Right',
    pitcherHandedness: 'Right',
    result: 'Successful'
  },
  // More sample data would go here
];

// Central function to get data-driven pitch recommendations
export const getDataDrivenRecommendation = (
  currentSituation: {
    count: { balls: number; strikes: number };
    batterHandedness: BatterHandedness;
    pitcherHandedness: PitcherHandedness;
    previousPitches?: Pitch[];
  },
  historicalData: HistoricalPitchData[] = SAMPLE_DATA
): { 
  typeScores: Record<PitchType, number>;
  locationScores: Record<PitchLocation, number>;
  insights: string[];
  pitcherNames?: string[]; // Add pitcher names to the return type
} => {
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
  const pitcherNames: Set<string> = new Set();

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
  
  if (relevantData.length === 0) {
    insights.push("Not enough historical data for this exact situation");
    return { typeScores, locationScores, insights };
  }

  // Collect pitcher names from the data
  relevantData.forEach(pitch => {
    if (pitch.metadata?.pitcher) {
      pitcherNames.add(pitch.metadata.pitcher);
    }
  });

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
  
  // Analyze the data
  relevantData.forEach(pitch => {
    const isSuccess = pitch.result === 'Successful';
    
    // Count for pitch types
    typeCounts[pitch.type].total += 1;
    if (isSuccess) typeCounts[pitch.type].success += 1;
    
    // Count for locations
    locationCounts[pitch.location].total += 1;
    if (isSuccess) locationCounts[pitch.location].success += 1;
  });
  
  // Calculate scores based on success rates
  Object.entries(typeCounts).forEach(([type, data]) => {
    if (data.total >= 5) {  // Ensure enough data points
      const successRate = data.success / data.total;
      typeScores[type as PitchType] = Math.round(successRate * 10);
      
      // Add insight for top pitches
      if (successRate > 0.7) {
        insights.push(`${type} has a ${Math.round(successRate * 100)}% success rate in similar situations`);
      }
    }
  });
  
  Object.entries(locationCounts).forEach(([location, data]) => {
    if (data.total >= 5) {  // Ensure enough data points
      const successRate = data.success / data.total;
      locationScores[location as PitchLocation] = Math.round(successRate * 10);
    }
  });
  
  // Add insights about the data
  if (insights.length === 0 && relevantData.length > 0) {
    // Find best pitch type
    const bestType = Object.entries(typeCounts)
      .filter(([_, data]) => data.total >= 5)
      .sort(([_, dataA], [__, dataB]) => {
        const rateA = dataA.success / dataA.total;
        const rateB = dataB.success / dataB.total;
        return rateB - rateA;
      })[0];
      
    if (bestType) {
      const [type, data] = bestType;
      const successRate = data.success / data.total;
      insights.push(`${type} is historically the most effective pitch in this situation (${Math.round(successRate * 100)}% success)`);
    }
  }

  // Add pitcher names to insights if available
  if (pitcherNames.size > 0) {
    const pitcherNamesArray = Array.from(pitcherNames);
    return { typeScores, locationScores, insights, pitcherNames: pitcherNamesArray };
  }
  
  return { typeScores, locationScores, insights };
};

// Function to integrate data-driven recommendations with rule-based system
export const mergeRecommendationScores = (
  ruleBasedScores: { typeScores: Record<PitchType, number>, locationScores: Record<PitchLocation, number> },
  dataBasedScores: { typeScores: Record<PitchType, number>, locationScores: Record<PitchLocation, number> },
  dataWeight: number = 0.5  // Weight given to data-driven recommendations (0-1)
): { typeScores: Record<PitchType, number>, locationScores: Record<PitchLocation, number> } => {
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

// Helper function to upload/import historical pitch data
export const importHistoricalData = (jsonData: string): HistoricalPitchData[] => {
  try {
    const parsedData = JSON.parse(jsonData);
    // Validate the data format
    if (!Array.isArray(parsedData)) {
      throw new Error('Data must be an array of pitch records');
    }
    
    // Basic validation of each record
    const validatedData = parsedData.filter(record => {
      return (
        record.type && 
        record.location && 
        record.count && 
        record.batterHandedness && 
        record.pitcherHandedness && 
        record.result
      );
    });
    
    return validatedData;
  } catch (error) {
    console.error('Error parsing historical data:', error);
    return [];
  }
};
