
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
    // Get a location more in the strike zone
    const strikeZoneLocations: PitchLocation[] = [
      'High Inside', 'High Middle', 'High Outside',
      'Middle Inside', 'Middle Middle', 'Middle Outside',
      'Low Inside', 'Low Middle', 'Low Outside'
    ];
    
    // If the last pitch was outside the strike zone, move to a nearby strike zone location
    if (!strikeZoneLocations.includes(lastPitch.location)) {
      let newLocation: PitchLocation;
      
      switch (lastPitch.location) {
        case 'Way High Inside':
          newLocation = 'High Inside';
          break;
        case 'Way High':
          newLocation = 'High Middle';
          break;
        case 'Way High Outside':
          newLocation = 'High Outside';
          break;
        case 'Way Inside':
          newLocation = 'Middle Inside';
          break;
        case 'Way Outside':
          newLocation = 'Middle Outside';
          break;
        case 'Way Low Inside':
          newLocation = 'Low Inside';
          break;
        case 'Way Low':
          newLocation = 'Low Middle';
          break;
        case 'Way Low Outside':
          newLocation = 'Low Outside';
          break;
        default:
          newLocation = 'Middle Middle';
      }
      
      return {
        type: lastPitch.type,
        location: newLocation
      };
    } else {
      // If already in strike zone, aim for the middle
      return {
        type: lastPitch.type,
        location: 'Middle Middle'
      };
    }
  }
  
  // If batter made contact, change both pitch type and location
  else {
    // Logic for when batter made contact
    const pitchTypes: PitchType[] = ['Fastball', 'Curveball', 'Slider', 'Changeup'];
    
    // For contact, try to move to a tougher location to hit
    const toughLocations: PitchLocation[] = [
      'High Inside', 'Low Inside', 'Low Outside', 'High Outside',
      'Way Inside', 'Way Outside', 'Way High', 'Way Low'
    ];
    
    // Don't use the same pitch that was hit
    const availablePitches = pitchTypes.filter(type => type !== lastPitch.type);
    const availableLocations = toughLocations.filter(loc => loc !== lastPitch.location);
    
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
