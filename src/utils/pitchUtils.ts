import { Pitch, PitchType, PitchLocation, PitchResult } from '../types/pitch';

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Enhanced recommendation logic using weighted scoring system
export const recommendNextPitch = (pitches: Pitch[]): { type: PitchType; location: PitchLocation } => {
  if (pitches.length === 0) {
    return {
      type: 'Fastball',
      location: 'Middle Middle'
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

  // 1. Full Count Analysis
  applyCountBasedScoring(pitchTypeScores, locationScores, currentCount);
  
  // 2. Pattern Recognition
  applyPatternRecognition(pitchTypeScores, locationScores, pitches);

  // Find best pitch type and location based on scores
  const bestPitchType = findHighestScoringKey(pitchTypeScores);
  const bestLocation = findHighestScoringKey(locationScores);

  return {
    type: bestPitchType,
    location: bestLocation
  };
};

// Helper function to find key with highest score
function findHighestScoringKey<T extends string>(scores: Record<T, number>): T {
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0] as T)[0];
}

// Full Count Analysis - Apply scoring based on count
function applyCountBasedScoring(
  pitchTypeScores: Record<PitchType, number>,
  locationScores: Record<PitchLocation, number>,
  count: { balls: number; strikes: number }
) {
  const { balls, strikes } = count;
  
  // Pitcher's counts (0-2, 1-2) - Be aggressive, aim for strikeouts
  if (strikes === 2 && balls < 2) {
    // Favor breaking pitches and "chase" pitches just outside the zone
    pitchTypeScores['Curveball'] += 3;
    pitchTypeScores['Slider'] += 3;
    pitchTypeScores['Changeup'] += 2;
    
    // Favor low pitches that induce chase swings
    locationScores['Low Outside'] += 3;
    locationScores['Low Inside'] += 2;
    locationScores['Way Low Outside'] += 2;
    locationScores['Way Low Inside'] += 2;
  }
  
  // Hitter's counts (3-0, 3-1) - Be conservative, aim for strikes
  else if (balls === 3 && strikes < 2) {
    // Favor fastballs and cutter, more control
    pitchTypeScores['Fastball'] += 4;
    pitchTypeScores['Cutter'] += 2;
    
    // Favor middle locations to get a strike
    locationScores['Middle Middle'] += 2;
    locationScores['High Middle'] += 1;
    locationScores['Low Middle'] += 1;
  }
  
  // Even counts (1-1, 2-2) - Mix it up
  else if (balls === strikes) {
    // Balanced approach
    pitchTypeScores['Fastball'] += 2;
    pitchTypeScores['Changeup'] += 2;
    pitchTypeScores['Slider'] += 2;
    
    // Favor corners
    locationScores['Low Outside'] += 2;
    locationScores['Low Inside'] += 2;
    locationScores['High Outside'] += 1;
    locationScores['High Inside'] += 1;
  }
  
  // First pitch (0-0) - Get ahead
  else if (balls === 0 && strikes === 0) {
    // First pitch strike is important
    pitchTypeScores['Fastball'] += 3;
    pitchTypeScores['Cutter'] += 2;
    
    // Aim for corners but still in zone
    locationScores['Low Outside'] += 2;
    locationScores['High Inside'] += 2;
  }
  
  // Behind in count but not extreme (1-0, 2-0, 2-1)
  else if (balls > strikes && balls < 3) {
    // Need strikes but can't be too predictable
    pitchTypeScores['Fastball'] += 2;
    pitchTypeScores['Sinker'] += 2;
    
    // More conservative locations
    locationScores['Middle Middle'] += 1;
    locationScores['Middle Inside'] += 1;
    locationScores['Middle Outside'] += 1;
  }
  
  // Ahead in count but not with 2 strikes (1-0, 2-0, 2-1)
  else if (strikes > balls && strikes < 2) {
    // Can be more creative
    pitchTypeScores['Changeup'] += 2;
    pitchTypeScores['Slider'] += 2;
    
    // Expand zone a bit
    locationScores['Low Outside'] += 2;
    locationScores['High Inside'] += 2;
    locationScores['Way Outside'] += 1;
  }
}

// Pattern Recognition - Analyze previous pitches for patterns
function applyPatternRecognition(
  pitchTypeScores: Record<PitchType, number>,
  locationScores: Record<PitchLocation, number>,
  pitches: Pitch[]
) {
  // Get most recent pitches (up to last 5)
  const recentPitches = pitches.slice(-5);
  
  // Track recent pitch types and locations
  const recentTypes: PitchType[] = recentPitches.map(p => p.type);
  const recentLocations: PitchLocation[] = recentPitches.map(p => p.location);
  
  // 1. Avoid repeating the same pitch type more than twice in a row
  if (recentPitches.length >= 2) {
    const lastType = recentTypes[recentTypes.length - 1];
    const secondLastType = recentTypes[recentTypes.length - 2];
    
    if (lastType === secondLastType) {
      // Penalize using the same pitch three times
      pitchTypeScores[lastType] -= 3;
    }
  }
  
  // 2. Avoid becoming predictable with locations
  if (recentPitches.length >= 3) {
    // Check if we're falling into a pattern with locations
    const locationCounts: Record<string, number> = {};
    recentLocations.forEach(loc => {
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });
    
    // Penalize overused locations
    Object.entries(locationCounts).forEach(([loc, count]) => {
      if (count >= 2) {
        locationScores[loc as PitchLocation] -= count;
      }
    });
  }
  
  // 3. Setup pitch strategy - recommend complementary pitch sequences
  if (recentPitches.length > 0) {
    const lastPitch = recentPitches[recentPitches.length - 1];
    
    // After fastball inside, breaking ball away is effective
    if (lastPitch.type === 'Fastball' && 
        (lastPitch.location === 'Middle Inside' || lastPitch.location === 'High Inside')) {
      pitchTypeScores['Slider'] += 2;
      pitchTypeScores['Changeup'] += 2;
      locationScores['Low Outside'] += 3;
      locationScores['Middle Outside'] += 2;
    }
    
    // After breaking ball low, high fastball is effective
    else if ((lastPitch.type === 'Curveball' || lastPitch.type === 'Slider') && 
             (lastPitch.location === 'Low Inside' || lastPitch.location === 'Low Outside')) {
      pitchTypeScores['Fastball'] += 3;
      locationScores['High Inside'] += 2;
      locationScores['High Middle'] += 2;
    }
    
    // After changeup, fastball is effective due to speed difference
    else if (lastPitch.type === 'Changeup') {
      pitchTypeScores['Fastball'] += 3;
      // Keep similar location to enhance speed deception
      locationScores[lastPitch.location] += 1;
    }
  }
  
  // 4. Analyze batter's success against different pitches
  const pitchEffectiveness: Record<PitchType, { success: number, total: number }> = {};
  
  // Initialize tracking for each pitch type
  PITCH_TYPES.forEach(type => {
    pitchEffectiveness[type] = { success: 0, total: 0 };
  });
  
  // Calculate success rate for each pitch type
  pitches.forEach(pitch => {
    const isSuccess = pitch.result === 'Strike' || pitch.result === 'Out';
    pitchEffectiveness[pitch.type].total += 1;
    if (isSuccess) {
      pitchEffectiveness[pitch.type].success += 1;
    }
  });
  
  // Boost scores for effective pitches
  Object.entries(pitchEffectiveness).forEach(([type, data]) => {
    if (data.total >= 2) { // Only consider pitches with enough data
      const successRate = data.success / data.total;
      // Boost pitch types that have been successful
      pitchTypeScores[type as PitchType] += Math.round(successRate * 4);
    }
  });
}

// Data for our visualization
export const getPitchZoneCoordinates = (location: PitchLocation): { x: number; y: number } => {
  const coordinates: Record<PitchLocation, { x: number; y: number }> = {
    // Strike zone (3x3 inner grid)
    'High Inside': { x: 25, y: 25 },
    'High Middle': { x: 50, y: 25 },
    'High Outside': { x: 75, y: 25 },
    'Middle Inside': { x: 25, y: 50 },
    'Middle Middle': { x: 50, y: 50 },
    'Middle Outside': { x: 75, y: 50 },
    'Low Inside': { x: 25, y: 75 },
    'Low Middle': { x: 50, y: 75 },
    'Low Outside': { x: 75, y: 75 },
    // Ball zone (outer ring)
    'Way High Inside': { x: 10, y: 10 },
    'Way High': { x: 50, y: 10 },
    'Way High Outside': { x: 90, y: 10 },
    'Way Inside': { x: 10, y: 50 },
    'Way Outside': { x: 90, y: 50 },
    'Way Low Inside': { x: 10, y: 90 },
    'Way Low': { x: 50, y: 90 },
    'Way Low Outside': { x: 90, y: 90 }
  };
  
  return coordinates[location];
};

export const getResultColor = (result: PitchResult): string => {
  const colors: Record<PitchResult, string> = {
    'Strike': 'bg-green-500',
    'Ball': 'bg-yellow-500',
    'Foul': 'bg-orange-400',
    'Hit': 'bg-red-500',
    'Out': 'bg-blue-500',
    'Home Run': 'bg-purple-500'
  };
  
  return colors[result];
};

export const PITCH_TYPES: PitchType[] = [
  'Fastball', 'Curveball', 'Slider', 'Changeup', 'Cutter', 
  'Sinker', 'Splitter'
];

export const PITCH_LOCATIONS: PitchLocation[] = [
  // Strike zone (3x3 inner grid)
  'High Inside', 'High Middle', 'High Outside',
  'Middle Inside', 'Middle Middle', 'Middle Outside',
  'Low Inside', 'Low Middle', 'Low Outside',
  // Ball zone (outer ring)
  'Way High Inside', 'Way High', 'Way High Outside',
  'Way Inside', 'Way Outside',
  'Way Low Inside', 'Way Low', 'Way Low Outside'
];

export const PITCH_RESULTS: PitchResult[] = [
  'Strike', 'Ball', 'Foul', 'Hit', 'Out', 'Home Run'
];
