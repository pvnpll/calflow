'use client';

import { Card } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface EnergyBalanceProps {
  maintenance: number;
  averageIntake: number;
  weightTrend: number;
}

export function EnergyBalance({ maintenance, averageIntake, weightTrend }: EnergyBalanceProps) {
  const deficit = maintenance - averageIntake;
  const isSurplus = deficit < 0;
  const value = Math.abs(Math.round(deficit));

  // Calculate observed maintenance
  // 1 kg weight change ~ 7700 kcal over a week (approx 1100 kcal per day for 1 kg/week)
  // If weight is dropping (trend < 0), they are in a deficit.
  // Observed Maintenance = Average Intake + Daily Deficit
  // Daily Deficit = (Weight loss in kg / 7) * 7700 = Weight loss in kg * 1100
  let observedMaintenance = null;
  if (weightTrend !== 0 && Math.abs(weightTrend) > 0.05) {
    const dailyEnergyDifference = -(weightTrend * 1100); 
    observedMaintenance = Math.round(averageIntake + dailyEnergyDifference);
  }

  return (
    <Card className="p-5 flex flex-col h-full bg-card">
      <div className="flex items-center gap-2 mb-4 text-amber-500">
        <Activity className="h-5 w-5" />
        <h3 className="font-semibold text-lg text-foreground">Energy Balance</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Est. Maintenance</span>
          <span className="font-medium">{Math.round(maintenance)} kcal</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Average intake</span>
          <span className="font-medium">{Math.round(averageIntake)} kcal</span>
        </div>
        
        {observedMaintenance && (
          <div className="flex justify-between items-center text-sm bg-muted/30 -mx-5 px-5 py-2 border-y">
            <span className="text-muted-foreground">Observed Maintenance</span>
            <span className="font-medium text-primary">~{observedMaintenance} kcal</span>
          </div>
        )}
        
        <div className="pt-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">
              {isSurplus ? 'Surplus' : 'Deficit'}
            </span>
            <span className={`text-lg font-bold ${
              isSurplus ? 'text-blue-500' : 'text-emerald-500'
            }`}>
              {value} kcal
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
