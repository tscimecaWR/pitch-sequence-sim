
import React from 'react';
import { PitchType } from '@/types/pitch';
import { PITCH_TYPES } from '@/utils/pitchUtils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PitchTypeSelectorProps {
  selectedType: PitchType;
  setSelectedType: (type: PitchType) => void;
}

const PitchTypeSelector: React.FC<PitchTypeSelectorProps> = ({
  selectedType,
  setSelectedType,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Pitch Type</label>
      <RadioGroup 
        value={selectedType} 
        onValueChange={(value) => setSelectedType(value as PitchType)} 
        className="grid grid-cols-3 gap-2"
      >
        {PITCH_TYPES.map((pitchType) => (
          <div key={pitchType} className="flex items-center space-x-2">
            <RadioGroupItem value={pitchType} id={`pitch-${pitchType}`} />
            <label 
              htmlFor={`pitch-${pitchType}`} 
              className="text-sm cursor-pointer"
            >
              {pitchType}
            </label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default PitchTypeSelector;
