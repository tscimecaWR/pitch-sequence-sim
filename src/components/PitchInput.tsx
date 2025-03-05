
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pitch, PitchType, PitchLocation, PitchResult } from '../types/pitch';
import { PITCH_TYPES, PITCH_LOCATIONS, PITCH_RESULTS, generateId } from '../utils/pitchUtils';
import PitchZone from './PitchZone';
import { AnimatePresence, motion } from 'framer-motion';

interface PitchInputProps {
  onAddPitch: (pitch: Pitch) => void;
}

const PitchInput: React.FC<PitchInputProps> = ({ onAddPitch }) => {
  const [type, setType] = useState<PitchType>('Fastball');
  const [location, setLocation] = useState<PitchLocation>('Middle Middle');
  const [result, setResult] = useState<PitchResult>('Strike');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    const newPitch: Pitch = {
      id: generateId(),
      type,
      location,
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
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-medium">Enter Pitch Data</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Pitch Type</label>
          <Select value={type} onValueChange={(value) => setType(value as PitchType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select pitch type" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {PITCH_TYPES.map((pitchType) => (
                <SelectItem key={pitchType} value={pitchType}>
                  {pitchType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Pitch Location</label>
          <div className="flex justify-center pt-2">
            <PitchZone
              selectedLocation={location}
              onSelectLocation={setLocation}
              className="animate-scale-in"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Pitch Result</label>
          <Select value={result} onValueChange={(value) => setResult(value as PitchResult)}>
            <SelectTrigger>
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
      
      <CardFooter>
        <Button 
          className="w-full transition-all duration-300 font-medium"
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
