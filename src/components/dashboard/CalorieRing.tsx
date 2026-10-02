'use client';

import { useEffect, useState } from 'react';

interface CalorieRingProps {
  consumed: number;
  target: number;
}

export function CalorieRing({ consumed = 0, target = 2000 }: CalorieRingProps) {
  const [progress, setProgress] = useState(0);
  
  const safeConsumed = typeof consumed === 'number' && !isNaN(consumed) ? consumed : 0;
  const safeTarget = typeof target === 'number' && !isNaN(target) && target > 0 ? target : 2000;
  const percentage = Math.min((safeConsumed / safeTarget) * 100, 100);
  
  // SVG setup
  const size = 220;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  useEffect(() => {
    // Animate progress on load
    const timer = setTimeout(() => {
      setProgress(isNaN(percentage) ? 0 : percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background ring */}
      <svg className="absolute transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-orange-500 transition-all duration-1000 ease-out"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Calories</span>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-3xl font-bold">~{Math.round(safeConsumed).toLocaleString()}</span>
        </div>
        <span className="text-sm text-muted-foreground mt-1">
          / {Math.round(safeTarget).toLocaleString()} kcal
        </span>
      </div>
    </div>
  );
}
