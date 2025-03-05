
import { Pitch, PitchType, PitchLocation, PitchResult } from '../types/pitch';

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Basic recommendation logic based on previous pitches
export const recommendNextPitch = (pitches: Pitch[]): { type: PitchType; location: PitchLocation } => {
  if (pitches.length === 0) {
    return {
      type: 'Fastball',
      location: 'Middle Middle'
    };
  }

  const lastPitch = pitches[pitches.length - 1];
  
  // Simple logic: Change speeds and locations based on previous pitch
  // In a real application, this would be more sophisticated
  
  // If last pitch was a strike, try same location with different pitch
  if (lastPitch.result === 'Strike' || lastPitch.result === 'Foul') {
    let newType: PitchType;
    
    // Change pitch type
    switch (lastPitch.type) {
      case 'Fastball':
        newType = 'Changeup';
        break;
      case 'Changeup':
        newType = 'Slider';
        break;
      case 'Slider':
        newType = 'Curveball';
        break;
      case 'Curveball':
        newType = 'Fastball';
        break;
      default:
        newType = 'Fastball';
    }
    
    return {
      type: newType,
      location: lastPitch.location
    };
  }
  
  // If last pitch was a ball, try different location with same pitch
  else if (lastPitch.result === 'Ball') {
    let newLocation: PitchLocation;
    
    // Adjust location to be more in the zone
    switch (lastPitch.location) {
      case 'High Inside':
        newLocation = 'High Middle';
        break;
      case 'High Outside':
        newLocation = 'High Middle';
        break;
      case 'Low Inside':
        newLocation = 'Low Middle';
        break;
      case 'Low Outside':
        newLocation = 'Low Middle';
        break;
      case 'Middle Inside':
        newLocation = 'Middle Middle';
        break;
      case 'Middle Outside':
        newLocation = 'Middle Middle';
        break;
      default:
        newLocation = 'Middle Middle';
    }
    
    return {
      type: lastPitch.type,
      location: newLocation
    };
  }
  
  // If batter made contact, change both pitch type and location
  else {
    // Logic for when batter made contact
    const pitchTypes: PitchType[] = ['Fastball', 'Curveball', 'Slider', 'Changeup'];
    const locations: PitchLocation[] = ['Low Outside', 'High Inside', 'Low Inside', 'High Outside'];
    
    // Don't use the same pitch that was hit
    const availablePitches = pitchTypes.filter(type => type !== lastPitch.type);
    const availableLocations = locations.filter(loc => loc !== lastPitch.location);
    
    const randomPitchIndex = Math.floor(Math.random() * availablePitches.length);
    const randomLocationIndex = Math.floor(Math.random() * availableLocations.length);
    
    return {
      type: availablePitches[randomPitchIndex],
      location: availableLocations[randomLocationIndex]
    };
  }
};

// Data for our visualization
export const getPitchZoneCoordinates = (location: PitchLocation): { x: number; y: number } => {
  const coordinates: Record<PitchLocation, { x: number; y: number }> = {
    'High Inside': { x: 25, y: 25 },
    'High Middle': { x: 50, y: 25 },
    'High Outside': { x: 75, y: 25 },
    'Middle Inside': { x: 25, y: 50 },
    'Middle Middle': { x: 50, y: 50 },
    'Middle Outside': { x: 75, y: 50 },
    'Low Inside': { x: 25, y: 75 },
    'Low Middle': { x: 50, y: 75 },
    'Low Outside': { x: 75, y: 75 }
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
  'Sinker', 'Splitter', 'Knuckleball', 'Eephus'
];

export const PITCH_LOCATIONS: PitchLocation[] = [
  'High Inside', 'High Middle', 'High Outside',
  'Middle Inside', 'Middle Middle', 'Middle Outside',
  'Low Inside', 'Low Middle', 'Low Outside'
];

export const PITCH_RESULTS: PitchResult[] = [
  'Strike', 'Ball', 'Foul', 'Hit', 'Out', 'Home Run'
];
