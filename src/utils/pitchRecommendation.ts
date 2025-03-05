
import { Pitch, PitchType, PitchLocation, BatterHandedness, PitcherHandedness } from '../types/pitch';
import { 
  applyCountBasedScoring, 
  applyPatternRecognition, 
  applyHandednessScoring, 
  findHighestScoringKey 
} from './pitchScoring';

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

  // Get handedness information from the last pitch
  const batterHandedness = lastPitch.batterHandedness || 'Right';
  const pitcherHandedness = lastPitch.pitcherHandedness || 'Right';

  // 1. Full Count Analysis
  applyCountBasedScoring(pitchTypeScores, locationScores, currentCount);
  
  // 2. Pattern Recognition
  applyPatternRecognition(pitchTypeScores, locationScores, pitches);
  
  // 3. NEW: Apply handedness-based recommendations
  applyHandednessScoring(pitchTypeScores, locationScores, batterHandedness, pitcherHandedness);

  // Find best pitch type and location based on scores
  const bestPitchType = findHighestScoringKey(pitchTypeScores);
  const bestLocation = findHighestScoringKey(locationScores);

  return {
    type: bestPitchType,
    location: bestLocation
  };
};
