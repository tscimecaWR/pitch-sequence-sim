
export type PitchType = 
  | 'Fastball'
  | 'Curveball'
  | 'Slider'
  | 'Changeup'
  | 'Cutter'
  | 'Sinker'
  | 'Splitter'
  | 'Knuckleball'
  | 'Eephus';

export type PitchLocation = 
  | 'High Inside'
  | 'High Middle'
  | 'High Outside' 
  | 'Middle Inside'
  | 'Middle Middle'
  | 'Middle Outside'
  | 'Low Inside'
  | 'Low Middle'
  | 'Low Outside';

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
}
