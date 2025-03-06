
import React from 'react';
import { Button } from '@/components/ui/button';
import { BatterHandedness, PitcherHandedness } from '@/types/pitch';

interface HandednessSelectorProps {
  batterHandedness: BatterHandedness;
  setBatterHandedness: (handedness: BatterHandedness) => void;
  pitcherHandedness: PitcherHandedness;
  setPitcherHandedness: (handedness: PitcherHandedness) => void;
}

const HandednessSelector: React.FC<HandednessSelectorProps> = ({
  batterHandedness,
  setBatterHandedness,
  pitcherHandedness,
  setPitcherHandedness,
}) => {
  const toggleBatterHandedness = () => {
    setBatterHandedness(batterHandedness === 'Right' ? 'Left' : 'Right');
  };

  const togglePitcherHandedness = () => {
    setPitcherHandedness(pitcherHandedness === 'Right' ? 'Left' : 'Right');
  };

  return (
    <div className="flex gap-2 mt-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={toggleBatterHandedness}
        className="flex items-center gap-2 flex-1"
      >
        <div className={`w-5 h-5 relative ${batterHandedness === 'Right' ? 'scale-x-[-1]' : ''}`}>
          <img 
            src="/lovable-uploads/86911cef-1571-4281-8a11-7f6be2d9a96e.png" 
            alt="Batter" 
            className="w-full h-full object-contain"
          />
        </div>
        {batterHandedness === 'Right' ? 'Right handed batter' : 'Left handed batter'}
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={togglePitcherHandedness}
        className="flex items-center gap-2 flex-1"
      >
        <div className={`w-5 h-5 relative ${pitcherHandedness === 'Right' ? 'scale-x-[-1]' : ''}`}>
          <img 
            src="/lovable-uploads/5192d19e-cf1d-411f-a5e2-c1046a34522d.png" 
            alt="Pitcher" 
            className="w-full h-full object-contain"
          />
        </div>
        {pitcherHandedness === 'Right' ? 'Right handed pitcher' : 'Left handed pitcher'}
      </Button>
    </div>
  );
};

export default HandednessSelector;
