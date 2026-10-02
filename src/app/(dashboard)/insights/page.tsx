'use client';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InsightCard from '@/components/insights/InsightCard';
import NutritionChart from '@/components/insights/NutritionChart';
import WeightChart from '@/components/insights/WeightChart';
import WaterChart from '@/components/insights/WaterChart';

export default function InsightsPage() {
  const [period, setPeriod] = useState('7');
  
  // Dummy data for charts until api is integrated
  const chartData = [
    { date: 'Mon', calories: 2100, protein: 120, carbs: 200, fat: 70, weight: 75.5, water: 2000 },
    { date: 'Tue', calories: 2300, protein: 140, carbs: 220, fat: 75, weight: 75.4, water: 2500 },
    { date: 'Wed', calories: 1900, protein: 110, carbs: 180, fat: 65, weight: 75.2, water: 1500 },
    { date: 'Thu', calories: 2500, protein: 160, carbs: 250, fat: 85, weight: 75.3, water: 2200 },
    { date: 'Fri', calories: 2200, protein: 130, carbs: 210, fat: 75, weight: 75.1, water: 3000 },
  ];

  return (
    <div className="container mx-auto p-4 max-w-5xl space-y-8 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Insights</h1>
        <Select value={period} onValueChange={(v) => setPeriod(v ?? '7')}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InsightCard title="Avg Calories" value="2,150" subtitle="kcal/day" />
        <InsightCard title="Avg Protein" value="135g" subtitle="per day" />
        <InsightCard title="Avg Water" value="2.1L" subtitle="per day" />
        <InsightCard title="Consistency" value="5/7" subtitle="days logged" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <NutritionChart 
          title="Calorie Trend" 
          data={chartData} 
          dataKey="calories" 
          color="#f97316" 
          targetValue={2000} 
        />
        
        <NutritionChart 
          title="Protein Trend" 
          data={chartData} 
          dataKey="protein" 
          color="#3b82f6" 
          targetValue={150} 
        />

        <WeightChart data={chartData} />
        
        <WaterChart data={chartData} targetValue={2500} />
      </div>

      <div className="p-6 bg-card border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Weekly Report Card</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex justify-between"><span>Average Calories:</span> <span className="font-medium">2150 kcal</span></li>
          <li className="flex justify-between"><span>Average Protein:</span> <span className="font-medium">135g</span></li>
          <li className="flex justify-between"><span>Weight Change:</span> <span className="font-medium text-green-500">-0.4 kg</span></li>
          <li className="flex justify-between"><span>Protein Target Met:</span> <span className="font-medium">3/7 days</span></li>
        </ul>
      </div>
    </div>
  );
}
