
import React, { useState } from 'react';
import PitchInput from '@/components/PitchInput';
import PitchHistory from '@/components/PitchHistory';
import PitchRecommendation from '@/components/PitchRecommendation';
import { Pitch, PitchType, PitchLocation } from '@/types/pitch';
import { toast } from 'sonner';

const Index = () => {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [selectedType, setSelectedType] = useState<PitchType>('Fastball');
  const [selectedLocation, setSelectedLocation] = useState<PitchLocation>('Middle Middle');

  const handleAddPitch = (pitch: Pitch) => {
    setPitches((prevPitches) => [...prevPitches, pitch]);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/50">
      <div className="container px-4 py-8 mx-auto">
        <header className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Pitch Sequence Simulator</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Input your pitch data to receive intelligent recommendations for your next pitch based on sequence analysis.
          </p>
        </header>
        
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
