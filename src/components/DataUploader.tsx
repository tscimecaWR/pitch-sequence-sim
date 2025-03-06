
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { HistoricalPitchData } from '@/utils/dataBasedRecommendation';
import { setHistoricalPitchData } from '@/utils/pitchRecommendation';
import { PitchType, PitchLocation, BatterHandedness, PitcherHandedness } from '@/types/pitch';

const DataUploader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [recordCount, setRecordCount] = useState(0);

  // Map CSV column names to our internal types
  const pitchTypeMap: Record<string, PitchType> = {
    'FF': 'Fastball',
    'CU': 'Curveball',
    'SL': 'Slider',
    'CH': 'Changeup',
    'FC': 'Cutter',
    'SI': 'Sinker',
    'FS': 'Splitter'
  };

  const locationMap: Record<string, PitchLocation> = {
    'HI': 'High Inside',
    'HM': 'High Middle',
    'HO': 'High Outside',
    'MI': 'Middle Inside',
    'MM': 'Middle Middle',
    'MO': 'Middle Outside',
    'LI': 'Low Inside',
    'LM': 'Low Middle',
    'LO': 'Low Outside',
    'WHI': 'Way High Inside',
    'WH': 'Way High',
    'WHO': 'Way High Outside',
    'WI': 'Way Inside',
    'WO': 'Way Outside',
    'WLI': 'Way Low Inside',
    'WL': 'Way Low',
    'WLO': 'Way Low Outside'
  };

  const resultMap: Record<string, 'Successful' | 'Unsuccessful'> = {
    'Strike': 'Successful',
    'SwingStrike': 'Successful',
    'Foul': 'Successful',
    'InPlay_Out': 'Successful',
    'Ball': 'Unsuccessful',
    'HBP': 'Unsuccessful',
    'InPlay_Hit': 'Unsuccessful',
    'InPlay_HR': 'Unsuccessful'
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
    
    // Validate required columns
    const requiredColumns = ['Date', 'PitchType', 'Location', 'Count', 'BatterSide', 'PitcherSide', 'Result'];
    const missingColumns = requiredColumns.filter(col => !header.includes(col));
    
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Map column indices
    const columnIndices: Record<string, number> = {};
    header.forEach((column, index) => {
      columnIndices[column] = index;
    });

    const data: HistoricalPitchData[] = [];

    // Parse data rows (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      const values = line.split(',').map(v => v.trim());
      
      // Parse count (format: "B-S" like "1-2")
      const countStr = values[columnIndices['Count']];
      const [balls, strikes] = countStr.split('-').map(Number);
      
      // Get pitcher and batter handedness
      const batterHandedness = values[columnIndices['BatterSide']] === 'R' ? 'Right' : 'Left';
      const pitcherHandedness = values[columnIndices['PitcherSide']] === 'R' ? 'Right' : 'Left';
      
      // Map pitch type from abbreviation to full name
      const rawPitchType = values[columnIndices['PitchType']];
      const pitchType = pitchTypeMap[rawPitchType] || 'Fastball';
      
      // Map location from abbreviation to full name
      const rawLocation = values[columnIndices['Location']];
      const location = locationMap[rawLocation] || 'Middle Middle';
      
      // Map outcome to success/failure
      const rawResult = values[columnIndices['Result']];
      const result = resultMap[rawResult] || 'Unsuccessful';

      // Create pitch record
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
          velocity: columnIndices['Velo'] !== undefined ? parseFloat(values[columnIndices['Velo']]) : undefined,
          spinRate: columnIndices['SpinRate'] !== undefined ? parseFloat(values[columnIndices['SpinRate']]) : undefined,
          horizontalBreak: columnIndices['HorzBreak'] !== undefined ? parseFloat(values[columnIndices['HorzBreak']]) : undefined,
          verticalBreak: columnIndices['VertBreak'] !== undefined ? parseFloat(values[columnIndices['VertBreak']]) : undefined,
        }
      };
      
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
              href="https://docs.google.com/spreadsheets/d/13EjHYv44jIW8Xqlfsg4wc-zsszhlWB0gVRfGal4mJ7g/edit?gid=1261395631#gid=1261395631"
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
