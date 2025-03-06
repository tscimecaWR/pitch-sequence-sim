
import React from 'react';
import { PitchLocation, BatterHandedness } from '@/types/pitch';
import PitchZone from './PitchZone';
import { cn } from '@/lib/utils';
import { convertCoordinatesToLocation } from '@/utils/coordinateConversion';

interface PitchZoneWithCoordinatesProps {
  selectedLocation?: PitchLocation;
  onSelectLocation: (location: PitchLocation) => void;
  className?: string;
  batterHandedness: BatterHandedness;
  showCoordinateMarker?: boolean;
  xCoordinate?: number;
  yCoordinate?: number;
  coordinateSystem?: 'statcast' | 'trackman' | 'hawkeye' | 'normalized';
}

const PitchZoneWithCoordinates: React.FC<PitchZoneWithCoordinatesProps> = ({
  selectedLocation,
  onSelectLocation,
  className,
  batterHandedness = 'Right',
  showCoordinateMarker = false,
  xCoordinate = 0,
  yCoordinate = 0,
  coordinateSystem = 'statcast'
}) => {
  // Calculate the position of the marker as a percentage of the zone width/height
  const calculateMarkerPosition = () => {
    // Normalize the coordinates
    const normX = convertToPercent(xCoordinate, coordinateSystem, 'x');
    const normY = convertToPercent(yCoordinate, coordinateSystem, 'y');
    
    // Adjust for batter handedness if needed
    const adjustedX = batterHandedness === 'Left' ? 100 - normX : normX;
    
    return {
      left: `${adjustedX}%`,
      top: `${100 - normY}%` // Invert Y because SVG/CSS coordinates start from top
    };
  };
  
  // Convert the raw coordinate to a percentage (0-100%) based on the coordinate system
  const convertToPercent = (value: number, system: string, axis: 'x' | 'y') => {
    if (system === 'normalized') {
      return value * 100;
    }
    
    if (axis === 'x') {
      switch (system) {
        case 'statcast':
          // Statcast: x is -2.5 to 2.5 feet from center
          return ((value + 2.5) / 5) * 100;
        case 'trackman':
          // Trackman: x is -1.5 to 1.5 feet from center
          return ((value + 1.5) / 3) * 100;
        case 'hawkeye':
          // Hawkeye: similar to trackman but slight differences
          return ((value + 1.25) / 2.5) * 100;
        default:
          return 50; // Default to center
      }
    } else { // axis === 'y'
      switch (system) {
        case 'statcast':
          // Statcast: y is 0 to 5 feet from ground
          return (value / 5) * 100;
        case 'trackman':
          // Trackman: y is typically 1.5 to 4 feet
          return ((value - 1.5) / 2.5) * 100;
        case 'hawkeye':
          // Hawkeye: similar to trackman but slight differences
          return ((value - 1.75) / 2.25) * 100;
        default:
          return 50; // Default to center
      }
    }
  };
  
  // Get the derived location from coordinates
  const derivedLocation = showCoordinateMarker && xCoordinate !== undefined && yCoordinate !== undefined
    ? convertCoordinatesToLocation(xCoordinate, yCoordinate, batterHandedness, coordinateSystem)
    : undefined;
  
  const markerPosition = calculateMarkerPosition();
  
  return (
    <div className={cn("w-full max-w-[300px] aspect-square relative", className)}>
      <PitchZone
        selectedLocation={selectedLocation}
        onSelectLocation={onSelectLocation}
        className="w-full h-full"
        batterHandedness={batterHandedness}
      />
      
      {showCoordinateMarker && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Coordinate marker */}
          <div 
            className="absolute w-4 h-4 rounded-full bg-red-500 border-2 border-white transform -translate-x-1/2 -translate-y-1/2"
            style={{ 
              left: markerPosition.left, 
              top: markerPosition.top,
              boxShadow: '0 0 0 2px rgba(255, 0, 0, 0.3), 0 0 10px rgba(0,0,0,0.5)'
            }}
          />
          
          {/* Coordinate display */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center">
            Coordinates: ({xCoordinate.toFixed(2)}, {yCoordinate.toFixed(2)}) → {derivedLocation}
          </div>
        </div>
      )}
    </div>
  );
};

export default PitchZoneWithCoordinates;
