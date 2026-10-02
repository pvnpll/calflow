'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ProfileForm() {
  return (
    <form className="space-y-6 p-4 border rounded-lg bg-card">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input placeholder="Your name" />
        </div>
        <div className="space-y-2">
          <Label>Age</Label>
          <Input type="number" placeholder="25" />
        </div>
        
        <div className="space-y-2">
          <Label>Sex</Label>
          <Select>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Height (cm)</Label>
          <Input type="number" placeholder="175" />
        </div>
        
        <div className="space-y-2">
          <Label>Current Weight (kg)</Label>
          <Input type="number" step="0.1" placeholder="70" />
        </div>
        <div className="space-y-2">
          <Label>Activity Level</Label>
          <Select>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sedentary">Sedentary</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="active">Very Active</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button type="submit">Save Personal Info</Button>
    </form>
  );
}
