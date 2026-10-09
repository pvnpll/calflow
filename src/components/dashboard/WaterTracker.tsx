'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplets, Plus } from 'lucide-react';
import { todayStr } from '@/lib/date';

interface WaterTrackerProps {
  initialConsumed: number; // in ml
  target: number; // in ml
}

export function WaterTracker({ initialConsumed = 0, target = 2500 }: WaterTrackerProps) {
  const [consumed, setConsumed] = useState(initialConsumed || 0);
  const [isAdding, setIsAdding] = useState(false);

  // Sync state if parent re-fetches
  useEffect(() => {
    if (typeof initialConsumed === 'number' && !isNaN(initialConsumed)) {
      setConsumed(initialConsumed);
    }
  }, [initialConsumed]);

  const safeTarget = (typeof target === 'number' && !isNaN(target) && target > 0) ? target : 2500;
  const safeConsumed = (typeof consumed === 'number' && !isNaN(consumed)) ? consumed : 0;
  const percentage = Math.min((safeConsumed / safeTarget) * 100, 100);

  const handleAddWater = async (amount: number) => {
    setIsAdding(true);
    // Optimistic update
    setConsumed(prev => (prev || 0) + amount);
    
    try {
      await fetch('/api/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount_ml: amount, date: todayStr() }),
      });
      // Optionally fetch again to confirm
    } catch (err) {
      console.error('Failed to add water', err);
      // Revert on failure
      setConsumed(prev => Math.max(0, (prev || 0) - amount));
    } finally {
      setIsAdding(false);
    }
  };

  const consumedLiters = ((safeConsumed || 0) / 1000).toFixed(1);
  const targetLiters = ((safeTarget || 2500) / 1000).toFixed(1);

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Droplets className="h-5 w-5 text-blue-500" />
        <h3 className="font-semibold">Hydration</h3>
      </div>
      
      <div className="flex justify-between items-end mb-4">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{consumedLiters}</span>
            <span className="text-muted-foreground">/ {targetLiters} L</span>
          </div>
        </div>
      </div>

      <div className="h-2 w-full rounded-full bg-muted overflow-hidden mb-6">
        <div 
          className="h-full bg-blue-500 transition-all duration-500 ease-out" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 rounded-full border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-blue-900 dark:hover:bg-blue-900/30"
          onClick={() => handleAddWater(250)}
          disabled={isAdding}
        >
          <Plus className="h-3 w-3 mr-1" />
          250ml
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 rounded-full border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-blue-900 dark:hover:bg-blue-900/30"
          onClick={() => handleAddWater(500)}
          disabled={isAdding}
        >
          <Plus className="h-3 w-3 mr-1" />
          500ml
        </Button>
      </div>
    </Card>
  );
}
