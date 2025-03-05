
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { setHistoricalPitchData } from '../utils/pitchRecommendation';
import { importHistoricalData } from '../utils/dataBasedRecommendation';
import { toast } from 'sonner';
import { Upload, Info, Database } from 'lucide-react';

const DataUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dataStats, setDataStats] = useState<{ 
    totalRecords: number;
    timestamp: number;
  } | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setProgress(10);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        setProgress(40);
        
        // Simulate processing time for large files
        setTimeout(() => {
          setProgress(70);
          
          // Import the data
          const pitchData = importHistoricalData(jsonData);
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
        toast.error("Failed to import pitch data", {
          description: "The file format is invalid or corrupted",
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
    
    reader.readAsText(file);
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
                  <p className="text-xs text-muted-foreground">JSON format (.json)</p>
                </div>
                <input 
                  id="dropzone-file" 
                  type="file" 
                  className="hidden" 
                  accept=".json"
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
