
import React from 'react';
import { Upload } from 'lucide-react';

interface UploadAreaProps {
  isLoading: boolean;
  onFileSelected: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const UploadArea: React.FC<UploadAreaProps> = ({ isLoading, onFileSelected }) => {
  return (
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
        onChange={onFileSelected}
        disabled={isLoading}
      />
    </label>
  );
};

export default UploadArea;
