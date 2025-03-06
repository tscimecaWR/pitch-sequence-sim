
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Code2, Database, BugIcon } from 'lucide-react';

interface DebugHistoricalDataProps {
  historicalData: any[];
  filteredData?: any[];
  typeScores?: Record<string, number>;
  locationScores?: Record<string, number>;
  insights?: string[];
  pitcherNames?: string[];
  currentSituation?: any;
}

const DebugHistoricalData: React.FC<DebugHistoricalDataProps> = ({
  historicalData,
  filteredData = [],
  typeScores = {},
  locationScores = {},
  insights = [],
  pitcherNames = [],
  currentSituation = {}
}) => {
  return (
    <Card className="w-full shadow-sm bg-card/80 backdrop-blur-sm border-dashed border-yellow-500/50 mt-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-medium flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
          <BugIcon size={18} />
          Debug: Historical Data Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs">
        <div className="space-y-4">
          {/* Data Summary */}
          <div className="flex flex-col gap-1">
            <div className="font-medium flex items-center gap-1.5">
              <Database size={14} className="text-muted-foreground" />
              Data Summary:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
              <Badge variant="outline" className="justify-start font-normal">
                Total Records: {historicalData.length}
              </Badge>
              <Badge variant="outline" className="justify-start font-normal">
                Filtered Records: {filteredData.length}
              </Badge>
              <Badge variant="outline" className="justify-start font-normal">
                Pitchers: {pitcherNames.length}
              </Badge>
              <Badge variant="outline" className="justify-start font-normal">
                Insights: {insights.length}
              </Badge>
            </div>
          </div>

          {/* Current Situation */}
          {currentSituation && Object.keys(currentSituation).length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="font-medium">Current Situation:</div>
              <div className="bg-muted p-2 rounded-md overflow-x-auto">
                <pre className="text-[10px]">{JSON.stringify(currentSituation, null, 2)}</pre>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type Scores */}
            <div className="flex flex-col gap-1">
              <div className="font-medium">Pitch Type Scores:</div>
              <div className="bg-muted p-2 rounded-md overflow-x-auto h-[150px]">
                <pre className="text-[10px]">{JSON.stringify(typeScores, null, 2)}</pre>
              </div>
            </div>

            {/* Location Scores */}
            <div className="flex flex-col gap-1">
              <div className="font-medium">Location Scores:</div>
              <div className="bg-muted p-2 rounded-md overflow-x-auto h-[150px]">
                <pre className="text-[10px]">{JSON.stringify(locationScores, null, 2)}</pre>
              </div>
            </div>
          </div>

          {/* Insights */}
          {insights.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="font-medium">Generated Insights:</div>
              <div className="bg-muted p-2 rounded-md">
                <ul className="list-disc pl-4 space-y-1">
                  {insights.map((insight, index) => (
                    <li key={index} className="text-[10px]">{insight}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Sample of filtered data */}
          {filteredData.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="font-medium">Sample of Filtered Data ({Math.min(3, filteredData.length)} of {filteredData.length}):</div>
              <div className="bg-muted p-2 rounded-md overflow-x-auto max-h-[200px]">
                <pre className="text-[10px]">{JSON.stringify(filteredData.slice(0, 3), null, 2)}</pre>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Code2 size={12} />
            This debug panel shows internal state from the historical data analysis system
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugHistoricalData;
