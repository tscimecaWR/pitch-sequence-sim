
import React from 'react';
import { PitchLocation, BatterHandedness } from '@/types/pitch';
import PitchZone from '@/components/PitchZone';

interface PitchLocationSelectorProps {
  selectedLocation: PitchLocation;
  setSelectedLocation: (location: PitchLocation) => void;
  batterHandedness: BatterHandedness;
}

const PitchLocationSelector: React.FC<PitchLocationSelectorProps> = ({
  selectedLocation,
  setSelectedLocation,
  batterHandedness,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Pitch Location</label>
      <div className="flex justify-center pt-2">
        <PitchZone
          selectedLocation={selectedLocation}
          onSelectLocation={setSelectedLocation}
          className="animate-scale-in rounded-lg overflow-hidden shadow-custom"
          batterHandedness={batterHandedness}
        />
      </div>
    </div>
  );
};

export default PitchLocationSelector;
