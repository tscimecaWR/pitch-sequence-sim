
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pitch, PitchType, PitchLocation, PitchResult } from '../types/pitch';
import { PITCH_TYPES, PITCH_LOCATIONS, PITCH_RESULTS, generateId } from '../utils/pitchUtils';
import PitchZone from './PitchZone';
import { AnimatePresence, motion } from 'framer-motion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PitchInputProps {
  onAddPitch: (pitch: Pitch) => void;
  selectedType: PitchType;
  selectedLocation: PitchLocation;
  setSelectedType: (type: PitchType) => void;
  setSelectedLocation: (location: PitchLocation) => void;
}

const PitchInput: React.FC<PitchInputProps> = ({ 
  onAddPitch, 
  selectedType, 
  selectedLocation, 
  setSelectedType, 
  setSelectedLocation 
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
      timestamp: Date.now()
    };
    
    // Small delay for animation
    setTimeout(() => {
      onAddPitch(newPitch);
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <Card className="w-full max-w-md animate-fade-in shadow-sm bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-1 pt-3">
        <CardTitle className="text-lg font-medium">Enter Pitch Data</CardTitle>
      </CardHeader>
      
      <CardContent className="py-2 space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium">Pitch Type</label>
          <RadioGroup 
            value={selectedType} 
            onValueChange={(value) => setSelectedType(value as PitchType)} 
            className="grid grid-cols-3 gap-1"
          >
            {PITCH_TYPES.map((pitchType) => (
              <div key={pitchType} className="flex items-center space-x-1">
                <RadioGroupItem value={pitchType} id={`pitch-${pitchType}`} className="size-3" />
                <label 
                  htmlFor={`pitch-${pitchType}`} 
                  className="text-xs cursor-pointer"
                >
                  {pitchType}
                </label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        <div className="space-y-1">
          <label className="text-xs font-medium">Pitch Location</label>
          <div className="flex justify-center pt-1">
            <PitchZone
              selectedLocation={selectedLocation}
              onSelectLocation={setSelectedLocation}
              className="animate-scale-in h-28 w-28"
            />
          </div>
        </div>
        
        <div className="space-y-1">
          <label className="text-xs font-medium">Pitch Result</label>
          <Select value={result} onValueChange={(value) => setResult(value as PitchResult)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select result" />
            </SelectTrigger>
            <SelectContent>
              {PITCH_RESULTS.map((pitchResult) => (
                <SelectItem key={pitchResult} value={pitchResult}>
                  {pitchResult}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      
      <CardFooter className="pt-1 pb-3">
        <Button 
          className="w-full transition-all duration-300 font-medium text-sm h-8"
          onClick={handleSubmit} 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="inline-flex items-center">
              Processing
              <span className="ml-2 h-3 w-3 rounded-full border-2 border-t-transparent border-white animate-spin"></span>
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
