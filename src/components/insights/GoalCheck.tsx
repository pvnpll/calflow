'use client';

import { Card } from '@/components/ui/card';
import { Info } from 'lucide-react';

interface GoalCheckProps {
  goal: string;
  weightTrend: number;
  goalRate: string;
}

export function GoalCheck({ goal, weightTrend, goalRate }: GoalCheckProps) {
  let message = "Your current intake appears to be producing the expected weight trend. Continue tracking consistently.";
  let title = "On track";
  let color = "text-emerald-500";

  const targetTrend = goalRate === 'slow' ? 0.25 : goalRate === 'fast' ? 0.75 : 0.5;

  if (goal === 'lose_weight') {
    if (weightTrend < 0 && Math.abs(weightTrend) > targetTrend + 0.2) {
      title = "Losing faster than expected";
      message = `Your recent weight trend (-${Math.abs(weightTrend).toFixed(2)} kg/week) is faster than your target rate. You might want to slightly increase your intake if you feel fatigued.`;
      color = "text-amber-500";
    } else if (weightTrend > 0) {
      title = "Weight is increasing";
      message = "Your weight trend is increasing instead of decreasing. Make sure you are accurately tracking all meals and maintaining a calorie deficit.";
      color = "text-rose-500";
    } else if (Math.abs(weightTrend) < targetTrend - 0.2 && Math.abs(weightTrend) !== 0) {
      title = "Losing slower than expected";
      message = `Your recent weight trend (-${Math.abs(weightTrend).toFixed(2)} kg/week) is slower than your target. Consider slightly reducing your intake.`;
      color = "text-blue-500";
    }
  } else if (goal === 'gain_weight' || goal === 'gain_muscle') {
    if (weightTrend > targetTrend + 0.2) {
      title = "Gaining faster than expected";
      message = `Your recent weight trend (+${weightTrend.toFixed(2)} kg/week) is faster than your target rate. You might be gaining more fat than muscle.`;
      color = "text-amber-500";
    } else if (weightTrend < 0) {
      title = "Weight is decreasing";
      message = "Your weight trend is decreasing. You need to increase your daily caloric intake to achieve a surplus.";
      color = "text-rose-500";
    }
  }

  return (
    <Card className="p-5 bg-card">
      <div className="flex items-center gap-2 mb-3">
        <Info className={`h-5 w-5 ${color}`} />
        <h3 className="font-semibold text-lg">Goal Check</h3>
      </div>
      <h4 className={`font-medium mb-1 ${color}`}>{title}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {message}
      </p>
    </Card>
  );
}
