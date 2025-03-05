
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pitch, PitchType, PitchLocation } from '../types/pitch';
import { recommendNextPitch } from '../utils/pitchUtils';
import PitchZone from './PitchZone';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Copy, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PitchRecommendationProps {
  pitches: Pitch[];
  onLoadRecommendation: (type: PitchType, location: PitchLocation) => void;
}

const PitchRecommendation: React.FC<PitchRecommendationProps> = ({ 
  pitches, 
  onLoadRecommendation 
}) => {
  const [recommendation, setRecommendation] = useState<{ type: PitchType; location: PitchLocation } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Get the current count for context
  const getCurrentCount = () => {
    if (pitches.length === 0) return { balls: 0, strikes: 0 };
    const lastPitch = pitches[pitches.length - 1];
    return lastPitch.count?.after || { balls: 0, strikes: 0 };
  };

  // Get recommendation context based on count
  const getRecommendationContext = () => {
    const count = getCurrentCount();
    const { balls, strikes } = count;
    
    if (strikes === 2) return "Strikeout count";
    if (balls === 3) return "Avoid walking the batter";
    if (balls === strikes) return "Even count";
    if (balls === 0 && strikes === 0) return "First pitch";
    if (balls > strikes) return "Behind in count";
    if (strikes > balls) return "Ahead in count";
    return "";
  };

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

  const handleCopyRecommendation = () => {
    if (recommendation) {
      onLoadRecommendation(recommendation.type, recommendation.location);
    }
  };

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

  const count = getCurrentCount();

  return (
    <Card className={cn(
      "w-full shadow-sm transition-all duration-300 overflow-hidden",
      isCalculating ? "bg-muted/80" : "bg-card/80 backdrop-blur-sm"
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-medium flex items-center justify-between">
          <span>{isCalculating ? 'Calculating...' : 'Next Pitch Recommendation'}</span>
          {!isCalculating && (
            <Badge variant="outline" className="ml-2">
              Count: {count.balls}-{count.strikes}
            </Badge>
          )}
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
            
            <div className="mt-4 flex flex-col gap-2 items-center">
              <div className="flex items-center gap-1.5 text-sm">
                <Info size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground font-medium">
                  {getRecommendationContext()}
                </span>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                Based on {Math.min(pitches.length, 5)} previous {pitches.length === 1 ? 'pitch' : 'pitches'}
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button 
                onClick={handleCopyRecommendation}
                className="flex items-center gap-2"
                variant="default"
              >
                <Copy size={16} />
                Use This Recommendation
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default PitchRecommendation;
