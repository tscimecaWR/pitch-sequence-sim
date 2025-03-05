import { PitchType, PitchLocation, Pitch, BatterHandedness, PitcherHandedness } from '../types/pitch';

// Helper function to find key with highest score
export function findHighestScoringKey<T extends string>(scores: Record<T, number>): T {
  return Object.entries(scores)
    .sort((a, b) => {
      // Ensure we're comparing numbers by converting to numbers and handling null/undefined
      const scoreA = a[1] === null || a[1] === undefined ? 0 : Number(a[1]);
      const scoreB = b[1] === null || b[1] === undefined ? 0 : Number(b[1]);
      return scoreB - scoreA;
    })
    .map(entry => entry[0] as T)[0];
}

// Full Count Analysis - Apply scoring based on count
export function applyCountBasedScoring(
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
export function applyPatternRecognition(
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
  const pitchEffectiveness: Record<PitchType, { success: number, total: number }> = {
    'Fastball': { success: 0, total: 0 },
    'Curveball': { success: 0, total: 0 },
    'Slider': { success: 0, total: 0 },
    'Changeup': { success: 0, total: 0 },
    'Cutter': { success: 0, total: 0 },
    'Sinker': { success: 0, total: 0 },
    'Splitter': { success: 0, total: 0 }
  };
  
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

// Apply handedness-based scoring adjustments
export function applyHandednessScoring(
  pitchTypeScores: Record<PitchType, number>,
  locationScores: Record<PitchLocation, number>,
  batterHandedness: BatterHandedness,
  pitcherHandedness: PitcherHandedness
) {
  // Handedness matchups
  const sameSide = batterHandedness === pitcherHandedness;
  
  if (sameSide) {
    // Same-side matchup (lefty vs lefty or righty vs righty)
    // Breaking balls away from batter are highly effective
    pitchTypeScores['Slider'] += 3;
    pitchTypeScores['Curveball'] += 2;
    
    // Outside pitches are more effective against same-side batters
    locationScores['Low Outside'] += 3;
    locationScores['Middle Outside'] += 2;
    locationScores['High Outside'] += 2;
    
    // Inside fastballs can be effective too
    pitchTypeScores['Fastball'] += 1;
    locationScores['High Inside'] += 1;
  } else {
    // Opposite-side matchup (lefty pitcher vs righty batter or righty pitcher vs lefty batter)
    if (pitcherHandedness === 'Left') {
      // Left-handed pitchers vs right-handed batters
      // Favor changeups, sinkers, and fastballs
      pitchTypeScores['Changeup'] += 3;
      pitchTypeScores['Sinker'] += 3;
      pitchTypeScores['Fastball'] += 2;
      pitchTypeScores['Splitter'] += 2;
      
      // Slightly penalize breaking balls that would break towards the batter
      pitchTypeScores['Slider'] -= 1;
      pitchTypeScores['Curveball'] -= 1;
      
      // Location preferences - low and away, or high and tight
      locationScores['Low Outside'] += 2;
      locationScores['High Inside'] += 2;
    } else {
      // Right-handed pitchers vs left-handed batters
      // Favor sliders and cutters that break away from batter
      pitchTypeScores['Slider'] += 3;
      pitchTypeScores['Cutter'] += 3;
      
      // Changeups can be effective too
      pitchTypeScores['Changeup'] += 2;
      
      // Inside-outside strategy 
      locationScores['Low Outside'] += 2;
      locationScores['High Inside'] += 2;
      locationScores['Middle Outside'] += 1;
    }
  }
  
  // Additional right-handed pitcher preferences
  if (pitcherHandedness === 'Right') {
    // Right-handed pitchers generally have good control with these pitches
    pitchTypeScores['Fastball'] += 1;
    pitchTypeScores['Curveball'] += 1;
  } else {
    // Left-handed pitcher preferences
    pitchTypeScores['Fastball'] += 1;
    pitchTypeScores['Changeup'] += 1;
  }
}
