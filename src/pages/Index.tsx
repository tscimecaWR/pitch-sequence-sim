import React, { useState } from 'react';
import PitchInput from '@/components/PitchInput';
import PitchHistory from '@/components/PitchHistory';
import PitchRecommendation from '@/components/PitchRecommendation';
import CountTracker from '@/components/CountTracker';
import DataUploader from '@/components/DataUploader';
import { Pitch, PitchType, PitchLocation, BatterHandedness, PitcherHandedness } from '@/types/pitch';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const Index = () => {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [selectedType, setSelectedType] = useState<PitchType>('Fastball');
  const [selectedLocation, setSelectedLocation] = useState<PitchLocation>('Middle Middle');
  const [balls, setBalls] = useState<number>(0);
  const [strikes, setStrikes] = useState<number>(0);
  const [batterHandedness, setBatterHandedness] = useState<BatterHandedness>('Right');
  const [pitcherHandedness, setPitcherHandedness] = useState<PitcherHandedness>('Right');

  const handleAddPitch = (pitch: Pitch) => {
    const pitchWithCount = {
      ...pitch,
      count: {
        before: {
          balls,
          strikes,
        },
        after: {
          balls,
          strikes,
        }
      }
    };
    
    let newBalls = balls;
    let newStrikes = strikes;
    let atBatResult: string | undefined;
    
    if (pitch.result === 'Ball') {
      newBalls = Math.min(balls + 1, 4);
      setBalls(newBalls);
      pitchWithCount.count.after.balls = newBalls;
    } else if (pitch.result === 'Strike' || pitch.result === 'Foul') {
      if (pitch.result === 'Foul' && strikes === 2) {
      } else {
        newStrikes = Math.min(strikes + 1, 3);
        setStrikes(newStrikes);
        pitchWithCount.count.after.strikes = newStrikes;
      }
    }
    
    if (balls === 3 && pitch.result === 'Ball') {
      atBatResult = "Walk";
      toast.info("Walk!", { description: "Batter takes first base on balls" });
      resetCount();
    } else if (strikes === 2 && (pitch.result === 'Strike')) {
      atBatResult = "Strikeout";
      toast.info("Strikeout!", { description: "Batter struck out" });
      resetCount();
    } else if (pitch.result === 'Hit') {
      atBatResult = "Hit";
      resetCount();
    } else if (pitch.result === 'Out') {
      atBatResult = "Out";
      resetCount();
    } else if (pitch.result === 'Home Run') {
      atBatResult = "Home Run";
      resetCount();
    }
    
    if (atBatResult) {
      pitchWithCount.atBatResult = atBatResult;
    }
    
    setPitches((prevPitches) => [...prevPitches, pitchWithCount]);
    
    toast.success("Pitch added successfully", {
      description: `${pitch.type} - ${pitch.location} - ${pitch.result}`,
      duration: 3000,
    });
  };

  const handleLoadRecommendation = (type: PitchType, location: PitchLocation) => {
    setSelectedType(type);
    setSelectedLocation(location);
    toast.info("Recommendation loaded", {
      description: `${type} - ${location}`,
      duration: 2000,
    });
  };
  
  const resetCount = () => {
    setBalls(0);
    setStrikes(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/50">
      <div className="container px-4 py-8 mx-auto">
        <header className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Pitch Sequence Simulator</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Input your pitch data to receive intelligent recommendations for your next pitch based on sequence analysis.
          </p>
        </header>
        
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-medium">Current Count</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetCount} 
              className="text-muted-foreground"
            >
              <RefreshCw className="mr-1 size-4" />
              Reset Count
            </Button>
          </div>
          <CountTracker balls={balls} strikes={strikes} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="space-y-6 animate-slide-up w-full" style={{ animationDelay: '100ms' }}>
            <PitchInput 
              onAddPitch={handleAddPitch} 
              selectedType={selectedType}
              selectedLocation={selectedLocation}
              setSelectedType={setSelectedType}
              setSelectedLocation={setSelectedLocation}
              batterHandedness={batterHandedness}
              setBatterHandedness={setBatterHandedness}
              pitcherHandedness={pitcherHandedness}
              setPitcherHandedness={setPitcherHandedness}
            />
            
            <DataUploader />
          </div>
          
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <PitchRecommendation 
              pitches={pitches} 
              onLoadRecommendation={handleLoadRecommendation}
              batterHandedness={batterHandedness}
              pitcherHandedness={pitcherHandedness}
            />
            <PitchHistory pitches={pitches} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
