
import { PitchResult } from '../types/pitch';

export const getResultColor = (result: PitchResult): string => {
  const colors: Record<PitchResult, string> = {
    'Strike': 'bg-green-500',
    'Ball': 'bg-yellow-500',
    'Foul': 'bg-orange-400',
    'Hit': 'bg-red-500',
    'Out': 'bg-blue-500',
    'Home Run': 'bg-purple-500'
  };
  
  return colors[result];
};
