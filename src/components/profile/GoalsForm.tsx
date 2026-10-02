'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function GoalsForm() {
  return (
    <form className="space-y-6 p-4 border rounded-lg bg-card">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Primary Goal</Label>
          <Select>
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
            <Input type="number" placeholder="2000" />
          </div>
          <div className="space-y-2">
            <Label>Protein (g)</Label>
            <Input type="number" placeholder="150" />
          </div>
          <div className="space-y-2">
            <Label>Carbs (g)</Label>
            <Input type="number" placeholder="200" />
          </div>
          <div className="space-y-2">
            <Label>Fat (g)</Label>
            <Input type="number" placeholder="65" />
          </div>
          <div className="space-y-2">
            <Label>Fiber (g)</Label>
            <Input type="number" placeholder="30" />
          </div>
          <div className="space-y-2">
            <Label>Water (L)</Label>
            <Input type="number" step="0.1" placeholder="2.5" />
          </div>
        </div>
      </div>
      
      <Button type="submit">Save Goals</Button>
    </form>
  );
}
