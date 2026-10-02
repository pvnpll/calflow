'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import WeightChart from '@/components/insights/WeightChart';

export default function WeightPage() {
  const [weight, setWeight] = useState('');
  
  const dummyData = [
    { date: '2023-10-01', weight: 76.5 },
    { date: '2023-10-05', weight: 76.0 },
    { date: '2023-10-10', weight: 75.8 },
    { date: '2023-10-15', weight: 75.5 },
  ];

  return (
    <div className="container mx-auto p-4 max-w-3xl space-y-8 pb-24">
      <h1 className="text-2xl font-bold">Weight Tracker</h1>
      
      <div className="p-4 border rounded-lg bg-card flex gap-4 items-end">
        <div className="flex-1 space-y-2">
          <Label>Log Today's Weight (kg)</Label>
          <Input 
            type="number" 
            step="0.1" 
            value={weight} 
            onChange={(e) => setWeight(e.target.value)} 
            placeholder="e.g. 75.5" 
          />
        </div>
        <Button onClick={() => setWeight('')}>Log Weight</Button>
      </div>

      <WeightChart data={dummyData} />
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">History</h2>
        <div className="border rounded-lg overflow-hidden">
          {dummyData.map((record, i) => (
            <div key={i} className="flex justify-between p-4 border-b last:border-0 bg-card">
              <span className="text-muted-foreground">{record.date}</span>
              <span className="font-medium">{record.weight} kg</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
