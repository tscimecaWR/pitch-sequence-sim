
import React from 'react';
import { PitchLocation } from '../types/pitch';
import { cn } from '@/lib/utils';

interface PitchZoneProps {
  selectedLocation?: PitchLocation;
  onSelectLocation: (location: PitchLocation) => void;
  className?: string;
}

const PitchZone: React.FC<PitchZoneProps> = ({ 
  selectedLocation, 
  onSelectLocation,
  className
}) => {
  // Full 5x5 grid layout
  const grid: Array<Array<PitchLocation | null>> = [
    ['Way High Inside', 'Way High', 'Way High', 'Way High', 'Way High Outside'],
    ['Way Inside', 'High Inside', 'High Middle', 'High Outside', 'Way Outside'],
    ['Way Inside', 'Middle Inside', 'Middle Middle', 'Middle Outside', 'Way Outside'],
    ['Way Inside', 'Low Inside', 'Low Middle', 'Low Outside', 'Way Outside'],
    ['Way Low Inside', 'Way Low', 'Way Low', 'Way Low', 'Way Low Outside'],
  ];

  const isStrikeZone = (location: PitchLocation): boolean => {
    const strikeZoneLocations: PitchLocation[] = [
      'High Inside', 'High Middle', 'High Outside',
      'Middle Inside', 'Middle Middle', 'Middle Outside',
      'Low Inside', 'Low Middle', 'Low Outside'
    ];
    return strikeZoneLocations.includes(location);
  };

  return (
    <div className={cn("w-full max-w-[300px] aspect-square", className)}>
      <div className="grid grid-cols-5 grid-rows-5 h-full w-full border-2 border-gray-300 rounded-md overflow-hidden">
        {grid.map((row, rowIndex) => (
          row.map((location, colIndex) => {
            if (!location) return null;
            
            const isStrike = isStrikeZone(location);
            
            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={cn(
                  "transition-all duration-300 border border-gray-200 relative",
                  "hover:bg-accent/20 focus:outline-none focus:ring-2 focus:ring-accent",
                  isStrike ? "bg-white/90" : "bg-gray-100/80",
                  selectedLocation === location 
                    ? "bg-accent/30 border-accent" 
                    : ""
                )}
                onClick={() => onSelectLocation(location)}
                aria-label={`Select ${location} zone`}
              >
                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-600 opacity-70">
                  {location.split(' ').map(word => word[0]).join('')}
                </span>
              </button>
            );
          })
        ))}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        <span className="inline-block w-3 h-3 bg-white/90 border border-gray-200 mr-1"></span> Strike Zone
        <span className="inline-block w-3 h-3 bg-gray-100/80 border border-gray-200 ml-3 mr-1"></span> Ball Zone
      </div>
    </div>
  );
};

export default PitchZone;
