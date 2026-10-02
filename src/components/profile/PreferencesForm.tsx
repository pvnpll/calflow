'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PreferencesForm() {
  return (
    <form className="space-y-6 p-4 border rounded-lg bg-card">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Diet Type</Label>
          <Select>
            <SelectTrigger><SelectValue placeholder="Select diet" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="omnivore">Omnivore</SelectItem>
              <SelectItem value="vegetarian">Vegetarian</SelectItem>
              <SelectItem value="vegan">Vegan</SelectItem>
              <SelectItem value="keto">Keto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Meals per day</Label>
          <Input type="number" placeholder="3" />
        </div>

        <div className="space-y-2">
          <Label>Allergies (comma separated)</Label>
          <Input placeholder="e.g. peanuts, shellfish" />
        </div>
      </div>
      
      <Button type="submit">Save Preferences</Button>
    </form>
  );
}
