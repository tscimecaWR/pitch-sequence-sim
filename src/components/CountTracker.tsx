
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Circle, X } from 'lucide-react';

interface CountTrackerProps {
  balls: number;
  strikes: number;
}

const CountTracker: React.FC<CountTrackerProps> = ({ balls, strikes }) => {
  return (
    <Card className="w-full bg-card/80 backdrop-blur-sm animate-fade-in">
      <CardContent className="py-3">
        <div className="flex justify-center items-center gap-6">
          <div className="flex flex-col items-center">
            <h3 className="text-xs font-medium mb-1 text-muted-foreground">Balls</h3>
            <div className="flex gap-1.5">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={`ball-${i}`} 
                  className={cn(
                    "size-6 rounded-full flex items-center justify-center border-2",
                    i < balls 
                      ? "bg-green-500 border-green-600 text-white" 
                      : "bg-background border-muted text-muted-foreground"
                  )}
                >
                  {i < balls && <Circle className="size-3" fill="white" />}
                </div>
              ))}
            </div>
          </div>

          <div className="text-3xl font-bold text-primary">
            {balls}-{strikes}
          </div>

          <div className="flex flex-col items-center">
            <h3 className="text-xs font-medium mb-1 text-muted-foreground">Strikes</h3>
            <div className="flex gap-1.5">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={`strike-${i}`} 
                  className={cn(
                    "size-6 rounded-full flex items-center justify-center border-2",
                    i < strikes 
                      ? "bg-red-500 border-red-600 text-white" 
                      : "bg-background border-muted text-muted-foreground"
                  )}
                >
                  {i < strikes && <X className="size-3" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CountTracker;
