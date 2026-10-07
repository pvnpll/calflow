'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Scale, TrendingDown, TrendingUp, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BodyAndHealthProps {
  weight: {
    current: number;
    trend: 'up' | 'down' | 'stable';
    trendValue: number;
    targetWeight?: number;
  };
  weightHistory: any[];
  onWeightLogged: () => void;
}

export function BodyAndHealth({ weight, weightHistory, onWeightLogged }: BodyAndHealthProps) {
  const [isLogging, setIsLogging] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Format chart data
  const chartData = [...weightHistory]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30) // Last 30 entries
    .map(w => ({
      date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: Number(w.weight_kg)
    }));

  // Min/Max for chart domain
  const minWeight = chartData.length ? Math.min(...chartData.map(d => d.weight)) : 0;
  const maxWeight = chartData.length ? Math.max(...chartData.map(d => d.weight)) : 0;

  const handleLogWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) return;
    
    setSaving(true);
    try {
      const res = await fetch('/api/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight_kg: parseFloat(newWeight),
          date: new Date().toISOString().split('T')[0]
        })
      });
      if (res.ok) {
        setIsLogging(false);
        setNewWeight('');
        onWeightLogged();
      }
    } catch (err) {
      console.error('Failed to log weight', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-5 flex flex-col h-full bg-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          Body & Health
        </h3>
      </div>

      {/* Current Weight Section */}
      <div className="mb-4">
        <div className="text-sm text-muted-foreground mb-1">Weight</div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{weight.current > 0 ? weight.current.toFixed(1) : '--'}</span>
          <span className="text-muted-foreground">kg</span>
        </div>
        
        {weight.trendValue > 0 && (
          <div className={`mt-1 flex items-center text-sm font-medium ${
            weight.trend === 'down' ? 'text-emerald-500' :
            weight.trend === 'up' ? 'text-rose-500' :
            'text-muted-foreground'
          }`}>
            {weight.trend === 'down' && <TrendingDown className="h-4 w-4 mr-1" />}
            {weight.trend === 'up' && <TrendingUp className="h-4 w-4 mr-1" />}
            {weight.trend === 'stable' && <Minus className="h-4 w-4 mr-1" />}
            {weight.trendValue} kg recent trend
          </div>
        )}
      </div>

      {/* Chart Section */}
      <div className="h-[150px] w-full mt-2 mb-4 -ml-4">
        {mounted && (chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <XAxis dataKey="date" hide />
              <YAxis domain={[Math.floor(minWeight - 2), Math.ceil(maxWeight + 2)]} hide />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
                itemStyle={{ color: 'var(--foreground)' }}
                labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '4px' }}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="var(--primary)" 
                strokeWidth={3}
                dot={{ r: 3, fill: "var(--primary)" }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground bg-muted/20 rounded-md border border-dashed ml-4">
            Not enough data for chart
          </div>
        ))}
      </div>

      {/* Log Weight Button */}
      <div className="mb-6">
        <Dialog open={isLogging} onOpenChange={setIsLogging}>
          <DialogTrigger render={
            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Log weight
            </Button>
          } />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Weight</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleLogWeight} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input 
                  type="number" 
                  step="0.1" 
                  placeholder="e.g. 70.5" 
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border-t pt-4 space-y-3 flex-grow">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Goal Weight</span>
          <span className="font-medium">{weight.targetWeight ? `${weight.targetWeight} kg` : '--'}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Waist</span>
          <span className="font-medium">--</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Body Fat</span>
          <span className="font-medium">--</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <Button variant="link" className="px-0 h-auto text-sm text-muted-foreground">
          View health history →
        </Button>
      </div>
    </Card>
  );
}