
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Pitch } from '../types/pitch';
import { getResultColor, getPitchZoneCoordinates } from '../utils/pitchUtils';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface PitchHistoryProps {
  pitches: Pitch[];
}

const PitchHistory: React.FC<PitchHistoryProps> = ({ pitches }) => {
  // If no pitches, show a placeholder
  if (pitches.length === 0) {
    return (
      <Card className="w-full h-[350px] shadow-sm bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-medium">Pitch History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No pitches recorded yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[350px] shadow-sm bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-medium">Pitch History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px] pr-4">
          <div className="space-y-3">
            {pitches.slice().reverse().map((pitch, index) => {
              const isLatest = index === 0;
              
              return (
                <div 
                  key={pitch.id}
                  className={cn(
                    "p-3 rounded-lg border transition-all",
                    isLatest ? "border-accent/50 bg-accent/5 animate-scale-in" : "border-gray-200 bg-white/70"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="font-medium">{pitch.type}</div>
                      <div className="text-sm text-muted-foreground">{pitch.location}</div>
                      
                      {/* Count display */}
                      {pitch.count && (
                        <div className="space-y-1 mt-1">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">Count before:</span>
                            <Badge variant="outline" className="text-xs">
                              {pitch.count.before.balls}-{pitch.count.before.strikes}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">Count after:</span>
                            <Badge variant="outline" className="text-xs">
                              {pitch.count.after.balls}-{pitch.count.after.strikes}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className={cn(
                      "px-2 py-1 text-xs font-medium rounded text-white",
                      getResultColor(pitch.result)
                    )}>
                      {pitch.result}
                    </div>
                  </div>
                  
                  {/* At-bat result display */}
                  {pitch.atBatResult && (
                    <div className="mt-2 text-sm font-medium text-primary">
                      At-bat result: {pitch.atBatResult}
                    </div>
                  )}
                  
                  {/* Mini pitch zone visualization */}
                  <div className="mt-3 w-20 h-20 border border-gray-200 rounded grid grid-cols-3 grid-rows-3 overflow-hidden mx-auto">
                    {['High Inside', 'High Middle', 'High Outside',
                      'Middle Inside', 'Middle Middle', 'Middle Outside',
                      'Low Inside', 'Low Middle', 'Low Outside'].map((zone) => {
                      const isActive = zone === pitch.location;
                      return (
                        <div 
                          key={zone} 
                          className={cn(
                            "border border-gray-100",
                            isActive ? getResultColor(pitch.result) : "bg-white/50"
                          )}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PitchHistory;
