import { Card } from '@/components/ui/card';
import { Scale, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface WeightCardProps {
  currentWeight: number; // in kg
  targetWeight?: number; // in kg
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number; // in kg
}

export function WeightCard({ currentWeight, targetWeight, trend, trendValue }: WeightCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-emerald-500" />
          <h3 className="font-semibold">Weight</h3>
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
            trend === 'down' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
            trend === 'up' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
            'bg-muted text-muted-foreground'
          }`}>
            {trend === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
            {trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
            {trend === 'stable' && <Minus className="h-3 w-3 mr-1" />}
            {trendValue ? `${Math.abs(trendValue)} kg` : 'Stable'}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold">{currentWeight.toFixed(1)}</span>
        <span className="text-muted-foreground">kg</span>
      </div>

      {targetWeight && (
        <div className="mt-2 text-sm text-muted-foreground">
          Target: {targetWeight.toFixed(1)} kg
        </div>
      )}
    </Card>
  );
}
