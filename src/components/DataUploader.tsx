
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { setHistoricalPitchData } from '../utils/pitchRecommendation';
import { importHistoricalData } from '../utils/dataBasedRecommendation';
import { toast } from 'sonner';
import { Upload, Info, Database, Download } from 'lucide-react';

const DataUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dataStats, setDataStats] = useState<{ 
    totalRecords: number;
    timestamp: number;
  } | null>(null);

  const sampleCsvContent = `Date,Pitcher,PitchType,Velo,SpinRate,HorizBreak,VertBreak,PitchResult,Zone,Count,BatterSide,PitcherThrows
4/15/2023,John Smith,Fastball,93.2,2400,6.2,-12.1,Strike,Middle Middle,0-1,Right,Right
4/15/2023,John Smith,Slider,86.1,2700,-8.4,2.3,Ball,Low Outside,1-2,Left,Right
4/15/2023,John Smith,Changeup,84.5,1800,8.7,5.6,Hit,Middle Middle,2-1,Right,Right`;

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n');
    if (lines.length < 2) throw new Error('CSV must have headers and at least one data row');
    
    const headers = lines[0].split(',').map(h => h.trim());
    const requiredHeaders = ['Date', 'Pitcher', 'PitchType', 'Velo', 'SpinRate', 'HorizBreak', 'VertBreak', 'PitchResult', 'Zone', 'Count', 'BatterSide', 'PitcherThrows'];
    
    // Check if all required headers are present
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`CSV is missing required headers: ${missingHeaders.join(', ')}`);
    }
    
    // Parse each row
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      const values = line.split(',').map(v => v.trim());
      if (values.length !== headers.length) {
        console.warn(`Skipping row ${i}: incorrect number of values`);
        continue;
      }
      
      // Create an object for each row
      const rowData: Record<string, any> = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index];
      });
      
      // Parse the count (format: "1-2" to { balls: 1, strikes: 2 })
      const countParts = rowData.Count.split('-');
      const balls = parseInt(countParts[0], 10);
      const strikes = parseInt(countParts[1], 10);
      
      // Map PitchType to our application's type
      const pitchTypeMap: Record<string, string> = {
        'Fastball': 'Fastball',
        'Curveball': 'Curveball',
        'Slider': 'Slider',
        'Changeup': 'Changeup',
        'Cutter': 'Cutter',
        'Sinker': 'Sinker',
        'Splitter': 'Splitter',
        // Add any additional mappings needed
      };
      
      // Map PitchResult to our application's result format
      const resultMap: Record<string, string> = {
        'Strike': 'Successful',
        'Swinging Strike': 'Successful',
        'Called Strike': 'Successful',
        'Foul': 'Successful',
        'In Play Out': 'Successful',
        'Ball': 'Unsuccessful',
        'Hit': 'Unsuccessful',
        'Home Run': 'Unsuccessful',
        // Add any additional mappings needed
      };
      
      // Format the data to match HistoricalPitchData structure
      data.push({
        type: pitchTypeMap[rowData.PitchType] || rowData.PitchType,
        location: rowData.Zone,
        count: { 
          balls: balls, 
          strikes: strikes 
        },
        batterHandedness: rowData.BatterSide,
        pitcherHandedness: rowData.PitcherThrows,
        result: resultMap[rowData.PitchResult] || 'Unsuccessful',
        // Additional fields that might be useful
        metadata: {
          date: rowData.Date,
          pitcher: rowData.Pitcher,
          velocity: parseFloat(rowData.Velo),
          spinRate: parseInt(rowData.SpinRate, 10),
          horizontalBreak: parseFloat(rowData.HorizBreak),
          verticalBreak: parseFloat(rowData.VertBreak)
        }
      });
    }
    
    return data;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setProgress(10);

    const fileType = file.name.split('.').pop()?.toLowerCase();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const fileContent = e.target?.result as string;
        setProgress(40);
        
        // Simulate processing time for large files
        setTimeout(() => {
          setProgress(70);
          
          // Parse the file based on its type
          let pitchData;
          if (fileType === 'json') {
            pitchData = importHistoricalData(fileContent);
          } else if (fileType === 'csv') {
            pitchData = parseCSV(fileContent);
          } else {
            throw new Error('Unsupported file format');
          }
          
          setProgress(90);
          
          // Set the data for use in recommendations
          setHistoricalPitchData(pitchData);
          
          // Complete the upload
          setProgress(100);
          setDataStats({
            totalRecords: pitchData.length,
            timestamp: Date.now()
          });
          
          toast.success("Pitch data imported successfully", {
            description: `${pitchData.length} records loaded`,
            duration: 5000,
          });
          
          setIsUploading(false);
        }, 800);
      } catch (error) {
        console.error('Error processing file:', error);
        toast.error(`Failed to import pitch data: ${error instanceof Error ? error.message : 'Unknown error'}`, {
          description: "Please check the file format and try again",
          duration: 5000,
        });
        setIsUploading(false);
      }
    };
    
    reader.onerror = () => {
      toast.error("Failed to read file", {
        duration: 3000,
      });
      setIsUploading(false);
    };
    
    if (fileType === 'json' || fileType === 'csv') {
      reader.readAsText(file);
    } else {
      toast.error("Unsupported file format", {
        description: "Please upload a JSON or CSV file",
        duration: 3000,
      });
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full shadow-sm bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-medium flex items-center gap-2">
          <Database className="h-5 w-5" />
          Historical Pitch Data
        </CardTitle>
        <CardDescription>
          Upload historical pitch data to enhance recommendations
        </CardDescription>
        <a
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(sampleCsvContent)}`}
          download="sample_pitch_data.csv"
          className="text-sm text-muted-foreground hover:underline flex items-center gap-1 mt-1"
        >
          <Download className="h-4 w-4" />
          Download Sample CSV
        </a>
      </CardHeader>
      
      <CardContent>
        {isUploading ? (
          <div className="space-y-3">
            <div className="text-sm text-center">Processing data...</div>
            <Progress value={progress} className="h-2" />
          </div>
        ) : (
          <div className="space-y-4">
            {dataStats ? (
              <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Records loaded:</span>
                  <span className="text-sm">{dataStats.totalRecords.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last updated:</span>
                  <span className="text-sm">{new Date(dataStats.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center p-3 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-lg">
                <Info className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-sm">No historical pitch data loaded</span>
              </div>
            )}
            
            <div className="flex items-center justify-center w-full">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 border-muted-foreground/20 hover:bg-muted/50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="mb-1 text-sm text-muted-foreground">
                    <span className="font-medium">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">JSON or CSV format (.json, .csv)</p>
                </div>
                <input 
                  id="dropzone-file" 
                  type="file" 
                  className="hidden" 
                  accept=".json,.csv"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <div className="text-xs text-muted-foreground">
          The data improves recommendation accuracy
        </div>
      </CardFooter>
    </Card>
  );
};

export default DataUploader;
