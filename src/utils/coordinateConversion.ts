
import { PitchLocation } from '@/types/pitch';

// Define the strike zone dimensions (normalized)
// The typical strike zone is represented as a 2D space where:
// x: 0 = inside edge, x: 1 = outside edge
// y: 0 = bottom of zone, y: 1 = top of zone
export interface PitchCoordinate {
  x: number;  // horizontal position (0-1 normalized)
  y: number;  // vertical position (0-1 normalized)
}

/**
 * Coordinate Systems Units:
 * 
 * Statcast format (default):
 *   - Horizontal (x): -2.5 to 2.5 feet from center of plate
 *   - Vertical (z): 0 to 5 feet from ground
 * 
 * Trackman format:
 *   - Horizontal (x): -1.5 to 1.5 feet from center
 *   - Vertical (z): Typically 1.5 to 4 feet
 * 
 * Hawkeye format:
 *   - Horizontal (x): -1.25 to 1.25 feet from center
 *   - Vertical (z): Typically 1.75 to 4 feet
 * 
 * PlateLocSide/PlateLocHeight:
 *   - Uses feet units for both horizontal and vertical measurements
 *   - Handled similar to Trackman format
 * 
 * Normalized format:
 *   - Both axes: 0 to 1 (already normalized)
 */

// Expanded coordinate boundaries to include "way" zones
const ZONE_BOUNDARIES = {
  x: [0, 0.2, 0.4, 0.6, 0.8, 1.0],  // inside -> outside divisions
  y: [0, 0.2, 0.4, 0.6, 0.8, 1.0],  // bottom -> top divisions
};

// Map region indices to location names
const ZONE_NAMES: Record<string, PitchLocation> = {
  // Strike zone (3x3 inner grid)
  '1-1': 'Low Inside',
  '1-2': 'Low Middle',
  '1-3': 'Low Outside',
  '2-1': 'Middle Inside',
  '2-2': 'Middle Middle',
  '2-3': 'Middle Outside',
  '3-1': 'High Inside',
  '3-2': 'High Middle',
  '3-3': 'High Outside',
  
  // Ball zone (edges and corners)
  '0-0': 'Way Low Inside',
  '0-1': 'Way Low Inside',
  '0-2': 'Way Low',
  '0-3': 'Way Low',
  '0-4': 'Way Low Outside',
  
  '1-0': 'Way Low Inside',
  '1-4': 'Way Low Outside',
  
  '2-0': 'Way Inside',
  '2-4': 'Way Outside',
  
  '3-0': 'Way High Inside',
  '3-4': 'Way High Outside',
  
  '4-0': 'Way High Inside',
  '4-1': 'Way High Inside',
  '4-2': 'Way High',
  '4-3': 'Way High',
  '4-4': 'Way High Outside',
};

/**
 * Converts raw pitch coordinates to normalized coordinates (0-1 range)
 * Different pitch tracking systems use different coordinate ranges, so
 * we need to normalize them to our 0-1 scale
 */
export function normalizeCoordinates(
  x: number, 
  y: number, 
  system: 'statcast' | 'trackman' | 'hawkeye' | 'normalized' = 'statcast'
): PitchCoordinate {
  switch (system) {
    case 'statcast':
      // Statcast: x is -2.5 to 2.5 feet from center, y is 0 to 5 feet from ground
      // Convert x from -2.5 to 2.5 range to 0-1 (where 0 is inside, 1 is outside)
      // For right-handed batters, negative x is inside; for left-handed, positive x is inside
      // We'll assume right-handed batter and flip later if needed
      return {
        x: (x + 2.5) / 5,
        y: y / 5
      };
    
    case 'trackman':
      // Trackman: x is -1.5 to 1.5 feet from center, y is typically 1.5 to 4 feet
      // Also handles PlateLocSide/PlateLocHeight columns which use feet units
      return {
        x: (x + 1.5) / 3,
        y: (y - 1.5) / 2.5
      };
    
    case 'hawkeye':
      // Hawkeye: similar to trackman but slight differences
      return {
        x: (x + 1.25) / 2.5,
        y: (y - 1.75) / 2.25
      };
    
    case 'normalized':
    default:
      // Already normalized to 0-1
      return { x, y };
  }
}

/**
 * For left-handed batters, we need to flip the inside/outside interpretation
 * since inside for a left-handed batter is on the opposite side as for a right-handed batter
 */
export function adjustForBatterHandedness(
  coord: PitchCoordinate, 
  batterHandedness: 'Right' | 'Left'
): PitchCoordinate {
  if (batterHandedness === 'Right') {
    return coord;
  } else {
    // For left-handed batters, flip the x-coordinate
    return {
      x: 1 - coord.x,
      y: coord.y
    };
  }
}

/**
 * Convert normalized coordinates to a pitch location zone
 */
export function coordinatesToZone(coord: PitchCoordinate): PitchLocation {
  // Find the column (x) and row (y) indices
  let xIndex = 0;
  let yIndex = 0;
  
  for (let i = 1; i < ZONE_BOUNDARIES.x.length; i++) {
    if (coord.x <= ZONE_BOUNDARIES.x[i]) {
      xIndex = i-1;
      break;
    }
  }
  
  for (let i = 1; i < ZONE_BOUNDARIES.y.length; i++) {
    if (coord.y <= ZONE_BOUNDARIES.y[i]) {
      yIndex = i-1;
      break;
    }
  }
  
  // Get zone based on indices
  const zoneKey = `${yIndex}-${xIndex}`;
  return ZONE_NAMES[zoneKey] || 'Middle Middle'; // Default to middle if not found
}

/**
 * Main function to convert raw pitch coordinates to a pitch location zone
 */
export function convertCoordinatesToLocation(
  x: number,
  y: number,
  batterHandedness: 'Right' | 'Left' = 'Right',
  coordinateSystem: 'statcast' | 'trackman' | 'hawkeye' | 'normalized' = 'statcast'
): PitchLocation {
  // Step 1: Normalize the coordinates to 0-1 range
  const normalized = normalizeCoordinates(x, y, coordinateSystem);
  
  // Step 2: Adjust for batter handedness
  const adjusted = adjustForBatterHandedness(normalized, batterHandedness);
  
  // Step 3: Convert to zone
  return coordinatesToZone(adjusted);
}
