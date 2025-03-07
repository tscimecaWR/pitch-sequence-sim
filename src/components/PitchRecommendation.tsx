
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pitch, PitchType, PitchLocation, BatterHandedness, PitcherHandedness } from '../types/pitch';
import { recommendNextPitch } from '../utils/pitchRecommendation';
import PitchZone from './PitchZone';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Copy, Info, LineChart, User, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PitchRecommendationProps {
  pitches: Pitch[];
  onLoadRecommendation: (type: PitchType, location: PitchLocation) => void;
  batterHandedness: BatterHandedness;
  pitcherHandedness: PitcherHandedness;
}

const PitchRecommendation: React.FC<PitchRecommendationProps> = ({ 
  pitches, 
  onLoadRecommendation,
  batterHandedness,
  pitcherHandedness
}) => {
  const [recommendation, setRecommendation] = useState<{ 
    type: PitchType; 
    location: PitchLocation;
    insights?: string[];
    pitcherNames?: string[];
    debugInfo?: any;
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const getCurrentCount = () => {
    if (pitches.length === 0) return { balls: 0, strikes: 0 };
    const lastPitch = pitches[pitches.length - 1];
    return lastPitch.count?.after || { balls: 0, strikes: 0 };
  };

  const getRecommendationContext = () => {
    const count = getCurrentCount();
    const { balls, strikes } = count;
    
    const handednessMatchup = batterHandedness === pitcherHandedness 
      ? `Same-side matchup (${pitcherHandedness}-handed pitcher vs ${batterHandedness}-handed batter)`
      : `Opposite-side matchup (${pitcherHandedness}-handed pitcher vs ${batterHandedness}-handed batter)`;
    
    if (strikes === 2) return `Strikeout count - ${handednessMatchup}`;
    if (balls === 3) return `Avoid walking the batter - ${handednessMatchup}`;
    if (balls === strikes) return `Even count - ${handednessMatchup}`;
    if (balls === 0 && strikes === 0) return `First pitch - ${handednessMatchup}`;
    if (balls > strikes) return `Behind in count - ${handednessMatchup}`;
    if (strikes > balls) return `Ahead in count - ${handednessMatchup}`;
    return handednessMatchup;
  };

  useEffect(() => {
    if (pitches.length > 0) {
      setIsCalculating(true);
      
      const timer = setTimeout(() => {
        const updatedPitches = [...pitches];
        if (updatedPitches.length > 0) {
          const lastIndex = updatedPitches.length - 1;
          updatedPitches[lastIndex] = {
            ...updatedPitches[lastIndex],
            batterHandedness,
            pitcherHandedness
          };
        }
        
        // Add debugging info to recommendation
        const result = recommendNextPitch(updatedPitches, { 
          includeInsights: true,
          includeDebugInfo: true
        });
        
        console.log('Recommendation result:', result);
        setRecommendation(result);
        setIsCalculating(false);
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setRecommendation(null);
    }
  }, [pitches, batterHandedness, pitcherHandedness]);

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
          <span className="flex items-center gap-2">
            {!isCalculating && <LineChart size={18} className="text-primary" />}
            {isCalculating ? 'Calculating...' : 'Next Pitch Recommendation'}
          </span>
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
                batterHandedness={batterHandedness}
              />
            </div>
            
            <div className="mt-4 flex flex-col gap-2 items-center">
              <div className="flex items-center gap-1.5 text-sm">
                <Info size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground font-medium">
                  {getRecommendationContext()}
                </span>
              </div>
              
              {recommendation.pitcherNames && recommendation.pitcherNames.length > 0 ? (
                <div className="w-full mt-2 p-2 bg-blue-500/10 rounded-lg">
                  <div className="text-sm font-medium mb-1 flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <User size={14} />
                    {recommendation.pitcherNames.length === 1 
                      ? 'Pitcher Used This Approach:' 
                      : 'Pitchers Used This Approach:'}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {recommendation.pitcherNames.slice(0, 5).map((name, idx) => (
                      <Badge key={idx} variant="outline" className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                        {name}
                      </Badge>
                    ))}
                    {recommendation.pitcherNames.length > 5 && (
                      <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                        +{recommendation.pitcherNames.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full mt-2 p-2 bg-amber-500/10 rounded-lg">
                  <div className="text-sm flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <AlertTriangle size={14} />
                    <span>No matching historical data found for this situation</span>
                  </div>
                </div>
              )}
              
              {recommendation.insights && recommendation.insights.length > 0 && (
                <div className="w-full mt-2">
                  <div 
                    className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-primary/10 transition-colors"
                    onClick={() => setShowInsights(!showInsights)}
                  >
                    <div className="text-sm font-medium flex items-center gap-1">
                      <LineChart size={14} className="text-primary" />
                      Data-Driven Insights
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      {showInsights ? <EyeOff size={14} /> : <Eye size={14} />}
                    </Button>
                  </div>
                  
                  {showInsights && (
                    <div className="p-3 bg-primary/5 rounded-lg mt-1">
                      <ul className="space-y-1">
                        {recommendation.insights.map((insight, index) => (
                          <li key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                            <span className="inline-block rounded-full h-1.5 w-1.5 bg-primary mt-1.5 flex-shrink-0" />
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {process.env.NODE_ENV === 'development' && recommendation.debugInfo && (
                <div className="w-full mt-2">
                  <div 
                    className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-orange-500/10 transition-colors"
                    onClick={() => setShowDebug(!showDebug)}
                  >
                    <div className="text-sm font-medium flex items-center gap-1 text-orange-600 dark:text-orange-400">
                      <AlertTriangle size={14} />
                      Debug Information
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      {showDebug ? <EyeOff size={14} /> : <Eye size={14} />}
                    </Button>
                  </div>
                  
                  {showDebug && (
                    <div className="p-3 bg-orange-500/5 rounded-lg mt-1 text-xs font-mono overflow-auto max-h-[200px]">
                      <pre>{JSON.stringify(recommendation.debugInfo, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}
              
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
