
export type PitchType = 
  | 'Fastball'
  | 'Curveball'
  | 'Slider'
  | 'Changeup'
  | 'Cutter'
  | 'Sinker'
  | 'Splitter';

export type BatterHandedness = 'Right' | 'Left';
export type PitcherHandedness = 'Right' | 'Left';

export type PitchLocation = 
  // Strike zone (3x3 inner grid)
  | 'High Inside'
  | 'High Middle'
  | 'High Outside' 
  | 'Middle Inside'
  | 'Middle Middle'
  | 'Middle Outside'
  | 'Low Inside'
  | 'Low Middle'
  | 'Low Outside'
  // Ball zone (outer ring)
  | 'Way High Inside'
  | 'Way High'
  | 'Way High Outside'
  | 'Way Inside'
  | 'Way Outside'
  | 'Way Low Inside'
  | 'Way Low'
  | 'Way Low Outside';

export type PitchResult = 
  | 'Strike' 
  | 'Ball' 
  | 'Foul'
  | 'Hit' 
  | 'Out'
  | 'Home Run';

export interface Pitch {
  id: string;
  type: PitchType;
  location: PitchLocation;
  result: PitchResult;
  timestamp: number;
  count?: {
    before: {
      balls: number;
      strikes: number;
    };
    after: {
      balls: number;
      strikes: number;
    };
  };
  atBatResult?: string;
  batterHandedness?: BatterHandedness;
  pitcherHandedness?: PitcherHandedness;
}
