
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pitch, PitchType, PitchLocation } from '../types/pitch';
import { recommendNextPitch } from '../utils/pitchUtils';
import PitchZone from './PitchZone';
import { cn } from '@/lib/utils';

interface PitchRecommendationProps {
  pitches: Pitch[];
}

const PitchRecommendation: React.FC<PitchRecommendationProps> = ({ pitches }) => {
  const [recommendation, setRecommendation] = useState<{ type: PitchType; location: PitchLocation } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    // Only recalculate if we have pitches
    if (pitches.length > 0) {
      setIsCalculating(true);
      
      // Add a small delay to simulate calculation and create a nice animation effect
      const timer = setTimeout(() => {
        setRecommendation(recommendNextPitch(pitches));
        setIsCalculating(false);
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setRecommendation(null);
    }
  }, [pitches]);

  if (pitches.length === 0) {
    return (
      <Card className="w-full shadow-sm bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-medium">Next Pitch Recommendation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[150px] flex items-center justify-center text-muted-foreground">
            Add a pitch to get a recommendation
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "w-full shadow-sm transition-all duration-300 overflow-hidden",
      isCalculating ? "bg-muted/80" : "bg-card/80 backdrop-blur-sm"
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-medium">
          {isCalculating ? 'Calculating...' : 'Next Pitch Recommendation'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isCalculating ? (
          <div className="h-[200px] flex items-center justify-center">
            <div className="h-12 w-12 rounded-full border-4 border-t-transparent border-primary animate-spin"></div>
          </div>
        ) : recommendation ? (
          <div className="animate-fade-in">
            <div className="mb-4 flex justify-center">
              <div className="px-4 py-2 bg-accent/10 rounded-full text-xl font-medium text-accent-foreground">
                {recommendation.type}
              </div>
            </div>
            
            <div className="flex justify-center">
              <PitchZone
                selectedLocation={recommendation.location}
                onSelectLocation={() => {}}
                className="pointer-events-none"
              />
            </div>
            
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Based on {pitches.length} previous {pitches.length === 1 ? 'pitch' : 'pitches'}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default PitchRecommendation;
