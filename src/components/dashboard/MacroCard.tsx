'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface MacroCardProps {
  name: string;
  consumed: number;
  target: number;
  colorClass: string;
  unit?: string;
}

export function MacroCard({ name, consumed, target, colorClass, unit = 'g' }: MacroCardProps) {
  const [progress, setProgress] = useState(0);
  const percentage = Math.min((consumed / (target || 1)) * 100, 100);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <Card className="p-4 flex flex-col justify-between h-full">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium text-muted-foreground">{name}</h4>
        <span className="text-xs font-medium">{Math.round(percentage)}%</span>
      </div>
      
      <div className="mb-3">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">~{Math.round(consumed)}</span>
          <span className="text-sm text-muted-foreground">/ {Math.round(target)}{unit}</span>
        </div>
      </div>
      
      <div className={`h-1.5 w-full rounded-full bg-muted overflow-hidden`}>
        <div 
          className={`h-full ${colorClass} transition-all duration-1000 ease-out`} 
          style={{ width: `${progress}%` }}
        />
      </div>
    </Card>
  );
}
