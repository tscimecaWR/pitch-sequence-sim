
import React, { useState } from 'react';
import PitchInput from '@/components/PitchInput';
import PitchHistory from '@/components/PitchHistory';
import PitchRecommendation from '@/components/PitchRecommendation';
import CountTracker from '@/components/CountTracker';
import { Pitch, PitchType, PitchLocation } from '@/types/pitch';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const Index = () => {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [selectedType, setSelectedType] = useState<PitchType>('Fastball');
  const [selectedLocation, setSelectedLocation] = useState<PitchLocation>('Middle Middle');
  const [balls, setBalls] = useState<number>(0);
  const [strikes, setStrikes] = useState<number>(0);

  const handleAddPitch = (pitch: Pitch) => {
    setPitches((prevPitches) => [...prevPitches, pitch]);
    
    // Update the count based on the pitch result
    if (pitch.result === 'Ball') {
      setBalls(prev => Math.min(prev + 1, 4));
    } else if (pitch.result === 'Strike' || pitch.result === 'Foul') {
      // In baseball, foul balls can only count as strikes until there are 2 strikes
      if (pitch.result === 'Foul' && strikes === 2) {
        // Do nothing, foul with 2 strikes doesn't add a strike
      } else {
        setStrikes(prev => Math.min(prev + 1, 3));
      }
    }
    
    // Check if the at-bat is over
    if (balls === 3 && pitch.result === 'Ball') {
      toast.info("Walk!", { description: "Batter takes first base on balls" });
      resetCount();
    } else if (strikes === 2 && (pitch.result === 'Strike')) {
      toast.info("Strikeout!", { description: "Batter struck out" });
      resetCount();
    } else if (pitch.result === 'Hit' || pitch.result === 'Out' || pitch.result === 'Home Run') {
      // At-bat ends on these results too
      resetCount();
    }
    
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
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <PitchInput 
              onAddPitch={handleAddPitch} 
              selectedType={selectedType}
              selectedLocation={selectedLocation}
              setSelectedType={setSelectedType}
              setSelectedLocation={setSelectedLocation}
            />
          </div>
          
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <PitchRecommendation 
              pitches={pitches} 
              onLoadRecommendation={handleLoadRecommendation}
            />
            <PitchHistory pitches={pitches} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
