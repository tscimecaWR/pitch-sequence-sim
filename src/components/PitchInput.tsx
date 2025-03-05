
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pitch, PitchType, PitchLocation, PitchResult, BatterHandedness, PitcherHandedness } from '../types/pitch';
import { PITCH_TYPES, PITCH_LOCATIONS, PITCH_RESULTS, generateId } from '../utils/pitchUtils';
import PitchZone from './PitchZone';
import { AnimatePresence, motion } from 'framer-motion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User, HandMetal } from 'lucide-react';

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

  const toggleBatterHandedness = () => {
    setBatterHandedness(batterHandedness === 'Right' ? 'Left' : 'Right');
  };

  const togglePitcherHandedness = () => {
    setPitcherHandedness(pitcherHandedness === 'Right' ? 'Left' : 'Right');
  };

  return (
    <Card className="w-full max-w-md animate-fade-in shadow-custom bg-card/80 backdrop-blur-sm rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-medium">
          <span>Enter Pitch Data</span>
          <div className="flex gap-2 mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleBatterHandedness}
              className="flex items-center gap-2 flex-1"
            >
              <User size={16} />
              {batterHandedness === 'Right' ? 'Right handed batter' : 'Left handed batter'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={togglePitcherHandedness}
              className="flex items-center gap-2 flex-1"
            >
              <HandMetal size={16} />
              {pitcherHandedness === 'Right' ? 'Right handed pitcher' : 'Left handed pitcher'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
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
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Pitch Result</label>
          <Select value={result} onValueChange={(value) => setResult(value as PitchResult)}>
            <SelectTrigger className="rounded-lg">
              <SelectValue placeholder="Select result" />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              {PITCH_RESULTS.map((pitchResult) => (
                <SelectItem key={pitchResult} value={pitchResult}>
                  {pitchResult}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full transition-all duration-300 font-medium rounded-lg"
          onClick={handleSubmit} 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="inline-flex items-center">
              Processing
              <span className="ml-2 h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></span>
            </span>
          ) : (
            'Add Pitch'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PitchInput;
