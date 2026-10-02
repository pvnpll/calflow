'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PreferencesForm() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    diet: 'omnivore',
    preferred_meal_count: '3',
    allergies: ''
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
              diet: data.diet || 'omnivore',
              preferred_meal_count: data.preferred_meal_count ? String(data.preferred_meal_count) : '3',
              allergies: Array.isArray(data.allergies) ? data.allergies.join(', ') : ''
            });
          }
        }
      } catch (err) {
        console.error('Failed to load preferences:', err);
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
      const allergiesArr = formData.allergies
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const payload = {
        diet: formData.diet,
        preferred_meal_count: parseInt(formData.preferred_meal_count, 10) || 3,
        allergies: allergiesArr
      };

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 border rounded-lg bg-card">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Diet Type</Label>
          <Select value={formData.diet} onValueChange={(v) => setFormData({ ...formData, diet: v ?? 'omnivore' })}>
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
          <Input 
            type="number" 
            placeholder="3" 
            value={formData.preferred_meal_count}
            onChange={(e) => setFormData({ ...formData, preferred_meal_count: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Allergies (comma separated)</Label>
          <Input 
            placeholder="e.g. peanuts, shellfish" 
            value={formData.allergies}
            onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={saving || loading}>
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
        {success && <span className="text-xs text-green-500 font-medium">Preferences saved successfully!</span>}
      </div>
    </form>
  );
}
