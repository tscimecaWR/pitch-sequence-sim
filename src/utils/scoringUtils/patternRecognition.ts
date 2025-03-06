import { PitchType, PitchLocation, Pitch } from '../../types/pitch';

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
