'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ProfileForm() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    sex: 'male',
    height_cm: '',
    current_weight_kg: '',
    activity_level: 'moderately_active'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setFormData({
              name: data.name || '',
              age: data.age ? String(data.age) : '',
              sex: data.sex || 'male',
              height_cm: data.height_cm ? String(data.height_cm) : '',
              current_weight_kg: data.current_weight_kg ? String(data.current_weight_kg) : '',
              activity_level: data.activity_level || 'moderately_active'
            });
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const payload: any = {
        name: formData.name,
        sex: formData.sex,
        activityLevel: formData.activity_level,
      };
      if (formData.age) payload.age = parseInt(formData.age, 10);
      if (formData.height_cm) payload.heightCm = parseFloat(formData.height_cm);
      if (formData.current_weight_kg) payload.currentWeightKg = parseFloat(formData.current_weight_kg);

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 border rounded-lg bg-card">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input 
            placeholder="Your name" 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
          />
        </div>
        <div className="space-y-2">
          <Label>Age</Label>
          <Input 
            type="number" 
            placeholder="25" 
            value={formData.age} 
            onChange={(e) => setFormData({ ...formData, age: e.target.value })} 
          />
        </div>
        
        <div className="space-y-2">
          <Label>Sex</Label>
          <Select value={formData.sex} onValueChange={(v) => setFormData({ ...formData, sex: v ?? 'male' })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Height (cm)</Label>
          <Input 
            type="number" 
            placeholder="175" 
            value={formData.height_cm} 
            onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })} 
          />
        </div>
        
        <div className="space-y-2">
          <Label>Current Weight (kg)</Label>
          <Input 
            type="number" 
            step="0.1" 
            placeholder="70" 
            value={formData.current_weight_kg} 
            onChange={(e) => setFormData({ ...formData, current_weight_kg: e.target.value })} 
          />
        </div>
        <div className="space-y-2">
          <Label>Activity Level</Label>
          <Select value={formData.activity_level} onValueChange={(v) => setFormData({ ...formData, activity_level: v ?? 'moderately_active' })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sedentary">Sedentary</SelectItem>
              <SelectItem value="lightly_active">Light</SelectItem>
              <SelectItem value="moderately_active">Moderate</SelectItem>
              <SelectItem value="very_active">Very Active</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={saving || loading}>
          {saving ? 'Saving...' : 'Save Personal Info'}
        </Button>
        {success && <span className="text-xs text-green-500 font-medium">Profile saved successfully!</span>}
      </div>
    </form>
  );
}
