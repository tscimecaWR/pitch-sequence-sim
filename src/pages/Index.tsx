import React, { useState, useEffect } from 'react';
import PitchInput from '../components/pitch-input';
import PitchHistory from '../components/PitchHistory';
import PitchRecommendation from '../components/PitchRecommendation';
import DataUploader from '../components/data-uploader';
import CountTracker from '../components/CountTracker';
import { Pitch, PitchType, PitchLocation, BatterHandedness, PitcherHandedness } from '../types/pitch';
import { cn } from '@/lib/utils';
import { setHistoricalPitchData } from '../utils/pitchRecommendation';
import { importHistoricalData, HistoricalPitchData, debugState } from '../utils/dataBasedRecommendation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BookOpenCheck, Info } from 'lucide-react';
import DebugHistoricalData from '../components/DebugHistoricalData';

const Index = () => {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [selectedType, setSelectedType] = useState<PitchType>('Fastball');
  const [selectedLocation, setSelectedLocation] = useState<PitchLocation>('Middle Middle');
  const [balls, setBalls] = useState<number>(0);
  const [strikes, setStrikes] = useState<number>(0);
  const [batterHandedness, setBatterHandedness] = useState<BatterHandedness>('Right');
  const [pitcherHandedness, setPitcherHandedness] = useState<PitcherHandedness>('Right');
  const [showDebug, setShowDebug] = useState(false);

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
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground py-4">
        <div className="container">
          <h1 className="text-2xl font-bold">Pitch Recommendation System</h1>
          <p className="text-sm mt-1 opacity-90">Make better pitching decisions with data-driven insights</p>
        </div>
      </header>
      
      <div className="container px-4 py-8 mx-auto">
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
            <div className="w-full">
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
            </div>
            
            <div className="w-full">
              <DataUploader />
            </div>
          </div>
          
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="w-full">
              <PitchRecommendation 
                pitches={pitches} 
                onLoadRecommendation={handleLoadRecommendation}
                batterHandedness={batterHandedness}
                pitcherHandedness={pitcherHandedness}
              />
            </div>
            <div className="w-full">
              <PitchHistory pitches={pitches} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mt-12 flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowDebug(!showDebug)}
          className="flex items-center gap-1.5 text-xs"
        >
          <Info size={14} className={cn(showDebug ? "text-yellow-500" : "text-muted-foreground")} />
          {showDebug ? "Hide Debug Data" : "Show Debug Data"}
        </Button>
      </div>
      
      {showDebug && (
        <div className="container mt-2 mb-12">
          <DebugHistoricalData 
            historicalData={debugState.historicalData}
            filteredData={debugState.relevantData}
            typeScores={debugState.typeScores}
            locationScores={debugState.locationScores}
            insights={debugState.insights}
            pitcherNames={debugState.pitcherNames}
            currentSituation={debugState.currentSituation}
          />
        </div>
      )}
      
      <div className="container mt-12">
        <div className="flex items-center gap-2">
          <BookOpenCheck size={18} className="text-primary" />
          <h2 className="text-xl font-medium">How It Works</h2>
        </div>
        <Separator className="my-3" />
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Our Pitch Recommendation System combines traditional baseball strategy with data-driven insights to suggest the most effective pitches in any game situation.
          </p>
          <div className="flex flex-col gap-2 mt-4">
            <div>
              <h3 className="text-base font-medium">1. Situation Analysis</h3>
              <p className="text-sm text-muted-foreground">The system analyzes the current count, batter/pitcher handedness, and previous pitches.</p>
            </div>
            <div>
              <h3 className="text-base font-medium">2. Rule-Based Strategy</h3>
              <p className="text-sm text-muted-foreground">Traditional baseball wisdom is applied, considering count, patterns, and matchups.</p>
            </div>
            <div>
              <h3 className="text-base font-medium">3. Data Integration</h3>
              <p className="text-sm text-muted-foreground">When available, historical pitch data is analyzed to find successful approaches in similar situations.</p>
            </div>
            <div>
              <h3 className="text-base font-medium">4. Optimal Recommendation</h3>
              <p className="text-sm text-muted-foreground">The system suggests the best pitch type and location, with insights explaining the recommendation.</p>
            </div>
          </div>
          <p className="mt-4">
            <a href="#" className="text-sm text-primary hover:underline">
              Learn more about how our recommendation system works
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
