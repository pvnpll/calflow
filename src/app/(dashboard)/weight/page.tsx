'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import WeightChart from '@/components/insights/WeightChart';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function WeightPage() {
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const fetchWeight = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/weight');
      if (res.ok) {
        const data = await res.json();
        // format data for chart: { date, weight }
        const formatted = (Array.isArray(data) ? data : []).map((item: any) => ({
          date: item.date,
          weight: Number(item.weight_kg ?? item.weight ?? 0),
          note: item.note || '',
        }));
        setHistory(formatted);
      }
    } catch (e) {
      console.error('Failed to fetch weight history', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeight();
  }, []);

  const handleLogWeight = async () => {
    if (!weight || isNaN(Number(weight))) return;
    try {
      setSubmitting(true);
      const res = await fetch('/api/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight_kg: parseFloat(weight),
          date: new Date().toISOString().split('T')[0],
          note: note || undefined,
        }),
      });
      if (res.ok) {
        setWeight('');
        setNote('');
        await fetchWeight();
      }
    } catch (e) {
      console.error('Failed to log weight', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl space-y-8 pb-24">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Weight Tracker</h1>
        <p className="text-sm text-muted-foreground">Monitor and track your body weight trend over time.</p>
      </div>
      
      <div className="p-4 border rounded-xl bg-card flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full space-y-2">
          <Label>Log Today's Weight (kg)</Label>
          <Input 
            type="number" 
            step="0.1" 
            value={weight} 
            onChange={(e) => setWeight(e.target.value)} 
            placeholder="e.g. 75.5" 
          />
        </div>
        <div className="flex-1 w-full space-y-2">
          <Label>Note (optional)</Label>
          <Input 
            type="text" 
            value={note} 
            onChange={(e) => setNote(e.target.value)} 
            placeholder="e.g. Morning fasted" 
          />
        </div>
        <Button onClick={handleLogWeight} disabled={submitting || !weight} className="w-full sm:w-auto">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Log Weight
        </Button>
      </div>

      {loading ? (
        <div className="h-[250px] border rounded-xl flex items-center justify-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading records...
        </div>
      ) : history.length > 0 ? (
        <WeightChart data={history} />
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No weight entries logged yet. Log your first weight entry above!
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">History</h2>
        {history.length > 0 ? (
          <div className="border rounded-xl overflow-hidden divide-y bg-card">
            {history.slice().reverse().map((record, i) => (
              <div key={i} className="flex justify-between items-center p-4">
                <div>
                  <span className="font-medium text-sm block">{record.date}</span>
                  {record.note && <span className="text-xs text-muted-foreground">{record.note}</span>}
                </div>
                <span className="font-bold text-base">{record.weight.toFixed(1)} kg</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No history records found.</div>
        )}
      </div>
    </div>
  );
}
