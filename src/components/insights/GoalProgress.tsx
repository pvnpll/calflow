'use client';

import { Card } from '@/components/ui/card';
import { Target, TrendingDown, TrendingUp } from 'lucide-react';

interface GoalProgressProps {
  goal: string;
  currentWeight: number;
  goalWeight?: number;
  weightTrend: number;
  estimatedMaintenance: number;
  averageIntake: number;
}

export function GoalProgress({
  goal,
  currentWeight,
  goalWeight,
  weightTrend,
  estimatedMaintenance,
  averageIntake
}: GoalProgressProps) {
  const isLoss = goal === 'lose_weight';
  const isGain = goal === 'gain_weight' || goal === 'gain_muscle';
  
  const deficit = estimatedMaintenance - averageIntake;
  const isSurplus = deficit < 0;

  return (
    <Card className="p-5 flex flex-col h-full bg-card">
      <div className="flex items-center gap-2 mb-4 text-primary">
        <Target className="h-5 w-5" />
        <h3 className="font-semibold text-lg">Goal Progress</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            {goal.replace('_', ' ')}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{currentWeight.toFixed(1)}</span>
            {goalWeight && (
              <>
                <span className="text-muted-foreground">/ {goalWeight.toFixed(1)} kg</span>
              </>
            )}
          </div>
          <div className={`text-sm mt-1 flex items-center font-medium ${
            isLoss ? 'text-emerald-500' : isGain ? 'text-blue-500' : 'text-muted-foreground'
          }`}>
            {isLoss && <TrendingDown className="h-4 w-4 mr-1" />}
            {isGain && <TrendingUp className="h-4 w-4 mr-1" />}
            {weightTrend > 0 ? `${weightTrend.toFixed(2)} kg/week` : 'Stable'}
          </div>
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current intake</span>
            <span className="font-medium">{Math.round(averageIntake)} kcal</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Maintenance</span>
            <span className="font-medium">{Math.round(estimatedMaintenance)} kcal</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Estimated {isSurplus ? 'surplus' : 'deficit'}</span>
            <span className="font-medium">{Math.abs(Math.round(deficit))} kcal</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
