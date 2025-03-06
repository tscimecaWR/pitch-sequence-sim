
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Pitch, PitchType, PitchLocation, PitchResult, BatterHandedness, PitcherHandedness } from '@/types/pitch';
import { generateId } from '@/utils/pitchUtils';
import HandednessSelector from './HandednessSelector';
import PitchTypeSelector from './PitchTypeSelector';
import PitchLocationSelector from './PitchLocationSelector';
import PitchResultSelector from './PitchResultSelector';
import SubmitButton from './SubmitButton';

interface PitchInputProps {
  onAddPitch: (pitch: Pitch) => void;
  selectedType: PitchType;
  selectedLocation: PitchLocation;
  setSelectedType: (type: PitchType) => void;
  setSelectedLocation: (location: PitchLocation) => void;
  batterHandedness: BatterHandedness;
  setBatterHandedness: (handedness: BatterHandedness) => void;
  pitcherHandedness: PitcherHandedness;
  setPitcherHandedness: (handedness: PitcherHandedness) => void;
}

const PitchInput: React.FC<PitchInputProps> = ({
  onAddPitch,
  selectedType,
  selectedLocation,
  setSelectedType,
  setSelectedLocation,
  batterHandedness,
  setBatterHandedness,
  pitcherHandedness,
  setPitcherHandedness
}) => {
  const [result, setResult] = useState<PitchResult>('Strike');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    const newPitch: Pitch = {
      id: generateId(),
      type: selectedType,
      location: selectedLocation,
      result,
      timestamp: Date.now(),
      batterHandedness,
      pitcherHandedness
    };
    
    // Small delay for animation
    setTimeout(() => {
      onAddPitch(newPitch);
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <Card className="w-full max-w-md animate-fade-in shadow-custom bg-card/80 backdrop-blur-sm rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-medium">
          <span>Enter Pitch Data</span>
          <HandednessSelector
            batterHandedness={batterHandedness}
            setBatterHandedness={setBatterHandedness}
            pitcherHandedness={pitcherHandedness}
            setPitcherHandedness={setPitcherHandedness}
          />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <PitchTypeSelector
          selectedType={selectedType}
          setSelectedType={setSelectedType}
        />
        
        <PitchLocationSelector
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          batterHandedness={batterHandedness}
        />
        
        <PitchResultSelector
          result={result}
          setResult={setResult}
        />
      </CardContent>
      
      <CardFooter>
        <SubmitButton
          isSubmitting={isSubmitting}
          onClick={handleSubmit}
        />
      </CardFooter>
    </Card>
  );
};

export default PitchInput;
