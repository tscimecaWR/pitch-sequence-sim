
import { PitchType, PitchLocation, PitchResult } from '../types/pitch';

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

// Get coordinates for visualizing a pitch location on a 2D strike zone
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
