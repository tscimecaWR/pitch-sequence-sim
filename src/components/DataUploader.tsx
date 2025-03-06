import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { HistoricalPitchData } from '@/utils/dataBasedRecommendation';
import { setHistoricalPitchData } from '@/utils/pitchRecommendation';
import { PitchType, PitchLocation, BatterHandedness, PitcherHandedness } from '@/types/pitch';
import { convertCoordinatesToLocation } from '@/utils/coordinateConversion';

const DataUploader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [recordCount, setRecordCount] = useState(0);

  const pitchTypeMap: Record<string, PitchType> = {
    '4-Seam Fastball': 'Fastball',
    'Curveball': 'Curveball',
    'Slider': 'Slider',
    'Changeup': 'Changeup',
    'Cutter': 'Cutter',
    'Sinker': 'Sinker',
    'Splitter': 'Splitter',
    'Fastball': 'Fastball',
    '2-Seam Fastball': 'Sinker'
  };

  const locationMap: Record<string, PitchLocation> = {
    'High & Inside': 'High Inside',
    'High & Middle': 'High Middle',
    'High & Outside': 'High Outside',
    'Middle & Inside': 'Middle Inside',
    'Middle': 'Middle Middle',
    'Middle & Outside': 'Middle Outside',
    'Low & Inside': 'Low Inside',
    'Low & Middle': 'Low Middle',
    'Low & Outside': 'Low Outside',
    'Way High & Inside': 'Way High Inside',
    'Way High': 'Way High',
    'Way High & Outside': 'Way High Outside',
    'Way Inside': 'Way Inside',
    'Way Outside': 'Way Outside',
    'Way Low & Inside': 'Way Low Inside',
    'Way Low': 'Way Low',
    'Way Low & Outside': 'Way Low Outside'
  };

  const resultMap: Record<string, 'Successful' | 'Unsuccessful'> = {
    'Strike': 'Successful',
    'Swinging Strike': 'Successful',
    'Called Strike': 'Successful',
    'Foul': 'Successful',
    'In Play - Out': 'Successful',
    'Ball': 'Unsuccessful',
    'Hit By Pitch': 'Unsuccessful',
    'In Play - Hit': 'Unsuccessful',
    'In Play - HR': 'Unsuccessful'
  };

  const pitchCallMap: Record<string, 'Successful' | 'Unsuccessful'> = {
    'StrikeCalled': 'Successful',
    'StrikeSwinging': 'Successful',
    'FoulBall': 'Successful',
    'InPlay': 'Successful',
    'Ball': 'Unsuccessful',
    'BallHBP': 'Unsuccessful',
    'InPlayHit': 'Unsuccessful',
    'InPlayHomeRun': 'Unsuccessful',
    'BallinDirt': 'Unsuccessful'
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setUploadStatus('idle');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvData = e.target?.result as string;
        const parsedData = parseCSV(csvData);
        
        if (parsedData.length > 0) {
          setHistoricalPitchData(parsedData);
          setRecordCount(parsedData.length);
          setUploadStatus('success');
          toast.success(`Successfully loaded ${parsedData.length} pitch records`, {
            description: 'The pitch recommendation system will now use this data.'
          });
        } else {
          setUploadStatus('error');
          toast.error('No valid data found in CSV file');
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
        setUploadStatus('error');
        toast.error('Failed to process CSV file', {
          description: error instanceof Error ? error.message : 'Unknown error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setIsLoading(false);
      setUploadStatus('error');
      toast.error('Failed to read file');
    };

    reader.readAsText(file);
  };

  const parseCSV = (csvText: string): HistoricalPitchData[] => {
    const lines = csvText.split('\n');
    if (lines.length < 2) throw new Error('CSV file must have a header row and at least one data row');

    const header = lines[0].split(',').map(h => h.trim());
    
    const requiredBaseColumns = ['Date'];
    
    const hasCountColumn = header.includes('Count');
    const hasBallsColumn = header.includes('Balls');
    const hasStrikesColumn = header.includes('Strikes');
    const hasCountInfo = hasCountColumn || (hasBallsColumn && hasStrikesColumn);
    
    if (!hasCountInfo) {
      throw new Error('Missing required column: Either "Count" or both "Balls" and "Strikes" must be present');
    }
    
    const hasPitchTypeColumn = header.includes('Pitch Type');
    const hasTaggedPitchTypeColumn = header.includes('TaggedPitchType');
    
    if (!hasPitchTypeColumn && !hasTaggedPitchTypeColumn) {
      throw new Error('Missing required column: Either "Pitch Type" or "TaggedPitchType" must be present');
    }
    
    const hasBatterStandsColumn = header.includes('Batter Stands');
    const hasBatterSideColumn = header.includes('BatterSide');
    
    if (!hasBatterStandsColumn && !hasBatterSideColumn) {
      throw new Error('Missing required column: Either "Batter Stands" or "BatterSide" must be present');
    }
    
    const hasPitcherThrowsColumn = header.includes('Pitcher Throws');
    const hasPitcherThrowsAltColumn = header.includes('PitcherThrows');
    
    if (!hasPitcherThrowsColumn && !hasPitcherThrowsAltColumn) {
      throw new Error('Missing required column: Either "Pitcher Throws" or "PitcherThrows" must be present');
    }
    
    const hasResultColumn = header.includes('Result');
    const hasPitchCallColumn = header.includes('PitchCall');
    
    if (!hasResultColumn && !hasPitchCallColumn) {
      throw new Error('Missing required column: Either "Result" or "PitchCall" must be present');
    }
    
    const hasLocationColumn = header.includes('Location');
    
    const hasPlateXColumn = header.includes('PlateX') || 
                           header.includes('plate_x') || 
                           header.includes('px');
                           
    const hasPlateLocSideColumn = header.includes('PlateLocSide');
    
    const hasPlateZColumn = header.includes('PlateZ') || 
                           header.includes('plate_z') || 
                           header.includes('pz');
                           
    const hasPlateLocHeightColumn = header.includes('PlateLocHeight');
    
    const hasHorizontalCoordinate = hasPlateXColumn || hasPlateLocSideColumn;
    const hasVerticalCoordinate = hasPlateZColumn || hasPlateLocHeightColumn;
    const hasCoordinateInfo = hasHorizontalCoordinate && hasVerticalCoordinate;
    
    if (!hasLocationColumn && !hasCoordinateInfo) {
      throw new Error('Missing required column: Either "Location" or coordinate columns (PlateX/plate_x/px/PlateLocSide and PlateZ/plate_z/pz/PlateLocHeight) must be present');
    }
    
    let coordinateSystem: 'statcast' | 'trackman' | 'hawkeye' | 'normalized' = 'statcast';
    if (hasCoordinateInfo) {
      if (header.includes('TaggedPitchType') || header.includes('SpinRate') || hasPlateLocSideColumn || hasPlateLocHeightColumn) {
        coordinateSystem = 'trackman';
      } else if (header.includes('Extension') || header.includes('RelHeight')) {
        coordinateSystem = 'hawkeye';
      }
    }
    
    const missingColumns = requiredBaseColumns.filter(col => !header.includes(col));
    
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    const columnIndices: Record<string, number> = {};
    header.forEach((column, index) => {
      columnIndices[column] = index;
    });

    const horizontalCoordColumn = header.includes('PlateX') ? 'PlateX' : 
                              header.includes('plate_x') ? 'plate_x' : 
                              header.includes('PlateLocSide') ? 'PlateLocSide' : 
                              header.includes('px') ? 'px' : '';
    
    const verticalCoordColumn = header.includes('PlateZ') ? 'PlateZ' : 
                              header.includes('plate_z') ? 'plate_z' : 
                              header.includes('PlateLocHeight') ? 'PlateLocHeight' : 
                              header.includes('pz') ? 'pz' : '';

    const data: HistoricalPitchData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      const values = line.split(',').map(v => v.trim());
      
      let balls = 0;
      let strikes = 0;
      
      if (hasCountColumn) {
        const countStr = values[columnIndices['Count']];
        const countParts = countStr.split('-').map(Number);
        if (countParts.length === 2) {
          balls = countParts[0];
          strikes = countParts[1];
        }
      } else if (hasBallsColumn && hasStrikesColumn) {
        balls = parseInt(values[columnIndices['Balls']], 10) || 0;
        strikes = parseInt(values[columnIndices['Strikes']], 10) || 0;
      }
      
      let batterStands = '';
      if (hasBatterStandsColumn) {
        batterStands = values[columnIndices['Batter Stands']];
      } else if (hasBatterSideColumn) {
        batterStands = values[columnIndices['BatterSide']];
      }
      
      let pitcherThrows = '';
      if (hasPitcherThrowsColumn) {
        pitcherThrows = values[columnIndices['Pitcher Throws']];
      } else if (hasPitcherThrowsAltColumn) {
        pitcherThrows = values[columnIndices['PitcherThrows']];
      }
      
      const batterHandedness = batterStands === 'R' ? 'Right' : 'Left';
      const pitcherHandedness = pitcherThrows === 'R' ? 'Right' : 'Left';
      
      let rawPitchType = '';
      
      if (hasPitchTypeColumn) {
        rawPitchType = values[columnIndices['Pitch Type']];
      } else if (hasTaggedPitchTypeColumn) {
        rawPitchType = values[columnIndices['TaggedPitchType']];
      }
      
      const pitchType = pitchTypeMap[rawPitchType] || 'Fastball';
      
      let location: PitchLocation = 'Middle Middle';
      
      if (hasLocationColumn) {
        const rawLocation = values[columnIndices['Location']];
        location = locationMap[rawLocation] || 'Middle Middle';
      } else if (hasCoordinateInfo && horizontalCoordColumn && verticalCoordColumn) {
        const plateX = parseFloat(values[columnIndices[horizontalCoordColumn]]);
        const plateZ = parseFloat(values[columnIndices[verticalCoordColumn]]);
        
        if (!isNaN(plateX) && !isNaN(plateZ)) {
          location = convertCoordinatesToLocation(
            plateX, 
            plateZ, 
            batterHandedness, 
            coordinateSystem
          );
        }
      }
      
      let result: 'Successful' | 'Unsuccessful' = 'Unsuccessful';
      
      if (hasResultColumn) {
        const rawResult = values[columnIndices['Result']];
        result = resultMap[rawResult] || 'Unsuccessful';
      } else if (hasPitchCallColumn) {
        const rawPitchCall = values[columnIndices['PitchCall']];
        result = pitchCallMap[rawPitchCall] || 'Unsuccessful';
      }

      const pitchRecord: HistoricalPitchData = {
        type: pitchType as PitchType,
        location: location as PitchLocation,
        count: { balls, strikes },
        batterHandedness: batterHandedness as BatterHandedness,
        pitcherHandedness: pitcherHandedness as PitcherHandedness,
        result,
        metadata: {
          date: values[columnIndices['Date']],
          pitcher: columnIndices['Pitcher'] !== undefined ? values[columnIndices['Pitcher']] : undefined,
          velocity: columnIndices['Pitch Velocity'] !== undefined ? parseFloat(values[columnIndices['Pitch Velocity']]) : undefined,
          spinRate: columnIndices['Spin Rate'] !== undefined ? parseFloat(values[columnIndices['Spin Rate']]) : undefined,
          horizontalBreak: columnIndices['Horizontal Break'] !== undefined ? parseFloat(values[columnIndices['Horizontal Break']]) : undefined,
          verticalBreak: columnIndices['Vertical Break'] !== undefined ? parseFloat(values[columnIndices['Vertical Break']]) : undefined,
        }
      };
      
      if (hasCoordinateInfo && horizontalCoordColumn && verticalCoordColumn) {
        pitchRecord.metadata = {
          ...pitchRecord.metadata,
          plateX: parseFloat(values[columnIndices[horizontalCoordColumn]]),
          plateZ: parseFloat(values[columnIndices[verticalCoordColumn]])
        };
      }
      
      data.push(pitchRecord);
    }

    return data;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Historical Pitch Data
        </CardTitle>
        <CardDescription>
          Upload CSV data to enhance pitch recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="csv-upload"
              className="cursor-pointer border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center transition-colors hover:border-muted-foreground/50"
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="font-medium">
                  {isLoading ? 'Processing...' : 'Click to upload CSV file'}
                </p>
                <p className="text-sm text-muted-foreground">
                  CSV must follow the template format
                </p>
              </div>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isLoading}
              />
            </label>
          </div>

          {uploadStatus === 'success' && (
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 text-sm">
              <p className="font-medium text-green-800 dark:text-green-400">
                Successfully loaded {recordCount} pitch records
              </p>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm">
              <p className="font-medium text-red-800 dark:text-red-400">
                Error processing CSV file. Please check the format and try again.
              </p>
            </div>
          )}

          <div className="flex justify-between items-center text-sm text-muted-foreground border-t pt-2">
            <span>Need the template?</span>
            <a
              href="https://docs.google.com/spreadsheets/d/1HoAL_4UZZB1-pa8fbaM0JuyjL21uadl98utT0tRrbiY/edit?gid=1930973159#gid=1930973159"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View CSV Template
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataUploader;
