
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
  // The strike zone is a 3x3 grid
  const zones: PitchLocation[] = [
    'High Inside', 'High Middle', 'High Outside',
    'Middle Inside', 'Middle Middle', 'Middle Outside',
    'Low Inside', 'Low Middle', 'Low Outside'
  ];

  return (
    <div className={cn("w-full max-w-[240px] aspect-square", className)}>
      <div className="grid grid-cols-3 grid-rows-3 h-full w-full border-2 border-gray-300 rounded-md overflow-hidden">
        {zones.map((zone) => (
          <button
            key={zone}
            className={cn(
              "transition-all duration-300 border border-gray-200 relative",
              "hover:bg-accent/20 focus:outline-none focus:ring-2 focus:ring-accent",
              selectedLocation === zone 
                ? "bg-accent/30 border-accent" 
                : "bg-white/80"
            )}
            onClick={() => onSelectLocation(zone)}
            aria-label={`Select ${zone} zone`}
          >
            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-600 opacity-70">
              {zone.split(' ').map(word => word[0]).join('')}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PitchZone;
