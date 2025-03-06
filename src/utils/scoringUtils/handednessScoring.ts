
import { PitchType, PitchLocation, BatterHandedness, PitcherHandedness } from '../../types/pitch';

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
