
import React from 'react';

interface StatusMessageProps {
  status: 'idle' | 'success' | 'error';
  recordCount: number;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ status, recordCount }) => {
  if (status === 'idle') return null;

  if (status === 'success') {
    return (
      <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 text-sm">
        <p className="font-medium text-green-800 dark:text-green-400">
          Successfully loaded {recordCount} pitch records
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm">
        <p className="font-medium text-red-800 dark:text-red-400">
          Error processing CSV file. Please check the format and try again.
        </p>
      </div>
    );
  }

  return null;
};

export default StatusMessage;
