
import React from 'react';
import { Button } from '@/components/ui/button';

interface SubmitButtonProps {
  isSubmitting: boolean;
  onClick: () => void;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  isSubmitting,
  onClick,
}) => {
  return (
    <Button 
      className="w-full transition-all duration-300 font-medium rounded-lg"
      onClick={onClick} 
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <span className="inline-flex items-center">
          Processing
          <span className="ml-2 h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></span>
        </span>
      ) : (
        'Add Pitch'
      )}
    </Button>
  );
};

export default SubmitButton;
