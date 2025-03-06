
import { PitchType, PitchLocation } from '../../types/pitch';

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
