'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplets, Plus } from 'lucide-react';

interface WaterTrackerProps {
  initialConsumed: number; // in ml
  target: number; // in ml
}

export function WaterTracker({ initialConsumed, target }: WaterTrackerProps) {
  const [consumed, setConsumed] = useState(initialConsumed);
  const [isAdding, setIsAdding] = useState(false);

  const percentage = Math.min((consumed / (target || 1)) * 100, 100);

  const handleAddWater = async (amount: number) => {
    setIsAdding(true);
    // Optimistic update
    setConsumed(prev => prev + amount);
    
    try {
      await fetch('/api/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, date: new Date().toISOString().split('T')[0] }),
      });
      // Optionally fetch again to confirm
    } catch (err) {
      console.error('Failed to add water', err);
      // Revert on failure
      setConsumed(prev => prev - amount);
    } finally {
      setIsAdding(false);
    }
  };

  const consumedLiters = (consumed / 1000).toFixed(1);
  const targetLiters = (target / 1000).toFixed(1);

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
