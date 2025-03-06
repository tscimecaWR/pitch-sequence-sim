
import React from 'react';
import { PitchResult } from '@/types/pitch';
import { PITCH_RESULTS } from '@/utils/pitchUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PitchResultSelectorProps {
  result: PitchResult;
  setResult: (result: PitchResult) => void;
}

const PitchResultSelector: React.FC<PitchResultSelectorProps> = ({
  result,
  setResult,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Pitch Result</label>
      <Select value={result} onValueChange={(value) => setResult(value as PitchResult)}>
        <SelectTrigger className="rounded-lg">
          <SelectValue placeholder="Select result" />
        </SelectTrigger>
        <SelectContent className="rounded-lg">
          {PITCH_RESULTS.map((pitchResult) => (
            <SelectItem key={pitchResult} value={pitchResult}>
              {pitchResult}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PitchResultSelector;
