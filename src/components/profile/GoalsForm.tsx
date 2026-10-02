'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function GoalsForm() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    primaryGoal: 'maintain_weight',
    calorieTarget: '2000',
    proteinTarget: '150',
    carbohydrateTarget: '200',
    fatTarget: '65',
    fiberTarget: '30',
    waterTargetL: '2.5'
  });

  useEffect(() => {
    const fetchGoals = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/goals');
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setFormData({
              primaryGoal: 'maintain_weight',
              calorieTarget: data.calorie_target ? String(data.calorie_target) : '2000',
              proteinTarget: data.protein_target ? String(data.protein_target) : '150',
              carbohydrateTarget: data.carbohydrate_target ? String(data.carbohydrate_target) : '200',
              fatTarget: data.fat_target ? String(data.fat_target) : '65',
              fiberTarget: data.fiber_target ? String(data.fiber_target) : '30',
              waterTargetL: data.water_target_ml ? String(data.water_target_ml / 1000) : '2.5'
            });
          }
        }
      } catch (err) {
        console.error('Failed to load goals:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const payload: any = {
        calorieTarget: parseFloat(formData.calorieTarget) || 2000,
        proteinTarget: parseFloat(formData.proteinTarget) || 150,
        carbohydrateTarget: parseFloat(formData.carbohydrateTarget) || 200,
        fatTarget: parseFloat(formData.fatTarget) || 65,
        fiberTarget: parseFloat(formData.fiberTarget) || 30,
        waterTargetMl: (parseFloat(formData.waterTargetL) || 2.5) * 1000,
      };

      const res = await fetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save goals:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 border rounded-lg bg-card">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Primary Goal</Label>
          <Select value={formData.primaryGoal} onValueChange={(v) => setFormData({ ...formData, primaryGoal: v ?? 'maintain_weight' })}>
            <SelectTrigger><SelectValue placeholder="Select goal" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="lose_weight">Lose Weight</SelectItem>
              <SelectItem value="maintain_weight">Maintain Weight</SelectItem>
              <SelectItem value="gain_muscle">Gain Muscle</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-2">
            <Label>Daily Calories (kcal)</Label>
            <Input 
              type="number" 
              placeholder="2000" 
              value={formData.calorieTarget} 
              onChange={(e) => setFormData({ ...formData, calorieTarget: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <Label>Protein (g)</Label>
            <Input 
              type="number" 
              placeholder="150" 
              value={formData.proteinTarget} 
              onChange={(e) => setFormData({ ...formData, proteinTarget: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <Label>Carbs (g)</Label>
            <Input 
              type="number" 
              placeholder="200" 
              value={formData.carbohydrateTarget} 
              onChange={(e) => setFormData({ ...formData, carbohydrateTarget: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <Label>Fat (g)</Label>
            <Input 
              type="number" 
              placeholder="65" 
              value={formData.fatTarget} 
              onChange={(e) => setFormData({ ...formData, fatTarget: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <Label>Fiber (g)</Label>
            <Input 
              type="number" 
              placeholder="30" 
              value={formData.fiberTarget} 
              onChange={(e) => setFormData({ ...formData, fiberTarget: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <Label>Water (L)</Label>
            <Input 
              type="number" 
              step="0.1" 
              placeholder="2.5" 
              value={formData.waterTargetL} 
              onChange={(e) => setFormData({ ...formData, waterTargetL: e.target.value })} 
            />
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={saving || loading}>
          {saving ? 'Saving...' : 'Save Goals'}
        </Button>
        {success && <span className="text-xs text-green-500 font-medium">Goals saved successfully!</span>}
      </div>
    </form>
  );
}
