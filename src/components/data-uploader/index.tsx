
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Database } from 'lucide-react';
import { toast } from 'sonner';
import { HistoricalPitchData } from '@/utils/dataBasedRecommendation';
import { setHistoricalPitchData, getHistoricalDataCount } from '@/utils/pitchRecommendation';
import { parseCSV } from './CSVParser';
import UploadArea from './UploadArea';
import StatusMessage from './StatusMessage';
import TemplateLink from './TemplateLink';

const DataUploader: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [recordCount, setRecordCount] = useState(0);

  // Check for existing data on component mount
  useEffect(() => {
    const existingCount = getHistoricalDataCount();
    if (existingCount > 0) {
      setRecordCount(existingCount);
      setUploadStatus('success');
    }
  }, []);

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
          
          // Enhanced toast message with more details
          toast.success(`Successfully loaded ${parsedData.length.toLocaleString()} pitch records`, {
            description: 'The recommendation system is now using your historical data.',
            duration: 5000,
          });
          
          // Log some sample data to help with debugging
          console.log('Sample data from upload:', parsedData.slice(0, 2));
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Historical Pitch Data
        </CardTitle>
        <CardDescription className="flex items-center gap-1">
          {recordCount > 0 ? (
            <>
              <Database className="h-3.5 w-3.5 text-primary" />
              <span>
                {recordCount.toLocaleString()} records loaded. Upload more data to enhance recommendations
              </span>
            </>
          ) : (
            'Upload CSV data to enhance pitch recommendations'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <UploadArea 
              isLoading={isLoading}
              onFileSelected={handleFileUpload}
            />
          </div>

          <StatusMessage 
            status={uploadStatus}
            recordCount={recordCount}
          />

          <TemplateLink />
        </div>
      </CardContent>
    </Card>
  );
};

export default DataUploader;
