
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Pitch, PitchLocation, BatterHandedness } from '../types/pitch';
import { getResultColor, getPitchZoneCoordinates } from '../utils/pitchUtils';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface PitchHistoryProps {
  pitches: Pitch[];
}

const groupPitchesByAtBat = (pitches: Pitch[]) => {
  const groups: Pitch[][] = [];
  let currentGroup: Pitch[] = [];
  
  const chronologicalPitches = [...pitches];
  
  for (let i = 0; i < chronologicalPitches.length; i++) {
    const pitch = chronologicalPitches[i];
    
    const isPreviousPitchAtBatEnd = i > 0 && chronologicalPitches[i-1].atBatResult !== undefined;
    const isNewCount = pitch.count?.before.balls === 0 && pitch.count?.before.strikes === 0;
    
    if (i === 0 || isPreviousPitchAtBatEnd || isNewCount) {
      currentGroup = [pitch];
      groups.push(currentGroup);
    } else {
      currentGroup.push(pitch);
    }
  }
  
  return groups.reverse();
};

const getDisplayLocation = (location: PitchLocation, batterHandedness: BatterHandedness = 'Right'): string => {
  if (batterHandedness === 'Right') {
    return location;
  } else {
    return location
      .replace('Inside', 'TEMP')
      .replace('Outside', 'Inside')
      .replace('TEMP', 'Outside');
  }
};

const PitchHistory: React.FC<PitchHistoryProps> = ({ pitches }) => {
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

  const atBatGroups = groupPitchesByAtBat(pitches);

  return (
    <Card className="w-full h-[350px] shadow-sm bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-medium">Pitch History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px] pr-4">
          <div className="space-y-3">
            {atBatGroups.map((group, groupIndex) => {
              const lastPitch = group[group.length - 1];
              const atBatResult = lastPitch.atBatResult;
              const isLatestGroup = groupIndex === 0;
              
              // Reverse the pitches array to show most recent on top
              const reversedPitches = [...group].reverse();
              
              return (
                <Collapsible 
                  key={groupIndex} 
                  defaultOpen={isLatestGroup}
                  className={cn(
                    "rounded-lg border transition-all overflow-hidden",
                    isLatestGroup ? "border-accent/50 bg-accent/5" : "border-gray-200 bg-white/70"
                  )}
                >
                  <CollapsibleTrigger className="w-full p-3 flex justify-between items-center text-left">
                    <div className="flex flex-col">
                      <div className="font-medium">
                        At-bat #{atBatGroups.length - groupIndex}
                      </div>
                      {atBatResult && (
                        <span className="text-sm font-medium text-primary">
                          Result: {atBatResult}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {group.length} {group.length === 1 ? 'pitch' : 'pitches'}
                      </Badge>
                      <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="px-3 pb-3 space-y-3">
                      {reversedPitches.map((pitch, index) => {
                        const displayLocation = getDisplayLocation(pitch.location, pitch.batterHandedness);
                        const isLastPitchInAtBat = index === 0 && pitch.atBatResult;
                        
                        return (
                          <div 
                            key={pitch.id}
                            className={cn(
                              "p-3 rounded-lg border bg-white/80",
                              isLastPitchInAtBat ? "border-primary/20" : "border-gray-100"
                            )}
                          >
                            <div className="grid grid-cols-3 gap-4">
                              {/* Column 1: Pitch Type & Location */}
                              <div className="space-y-1">
                                <div className="font-medium">{pitch.type}</div>
                                <div className="text-sm text-muted-foreground">{displayLocation}</div>
                                
                                {pitch.result && (
                                  <div className={cn(
                                    "mt-2 px-2 py-1 text-xs font-medium rounded text-white inline-block",
                                    getResultColor(pitch.result)
                                  )}>
                                    {pitch.result}
                                  </div>
                                )}
                              </div>
                              
                              {/* Column 2: Count & Batter Info */}
                              <div className="space-y-1">
                                {pitch.count && (
                                  <div className="space-y-1">
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
                                
                                {pitch.batterHandedness && (
                                  <div className="mt-2 text-xs text-muted-foreground">
                                    Batter: {pitch.batterHandedness}-handed
                                  </div>
                                )}
                                
                                {pitch.atBatResult && (
                                  <div className="mt-2 text-sm font-medium text-primary">
                                    At-bat result: {pitch.atBatResult}
                                  </div>
                                )}
                              </div>
                              
                              {/* Column 3: Pitch Zone Visualization */}
                              <div className="flex justify-center items-start">
                                <div className="w-20 h-20 border border-gray-200 rounded grid grid-cols-3 grid-rows-3 overflow-hidden">
                                  {['High Inside', 'High Middle', 'High Outside',
                                    'Middle Inside', 'Middle Middle', 'Middle Outside',
                                    'Low Inside', 'Low Middle', 'Low Outside'].map((zone) => {
                                    const transformedZone = pitch.batterHandedness === 'Left' 
                                      ? zone
                                        .replace('Inside', 'TEMP')
                                        .replace('Outside', 'Inside')
                                        .replace('TEMP', 'Outside')
                                      : zone;
                                    
                                    const isActive = transformedZone === pitch.location;
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
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PitchHistory;
