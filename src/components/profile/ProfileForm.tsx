'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/lib/context/ProfileContext';
import { ACTIVITY_LABELS, SEX_LABELS, coerceEnum } from '@/lib/utils';
import { Loader2, CheckCircle2, UserRound } from 'lucide-react';

const SEX_VALUES = ['male', 'female'];
const SEX_ITEMS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];
const ACTIVITY_VALUES = ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'];
const ACTIVITY_ITEMS = [
  { value: 'sedentary', label: 'Sedentary (desk job)' },
  { value: 'lightly_active', label: 'Lightly Active (1–2 days/wk)' },
  { value: 'moderately_active', label: 'Moderately Active (3–4 days/wk)' },
  { value: 'very_active', label: 'Very Active (5+ days/wk)' },
  { value: 'extremely_active', label: 'Athlete / Physical job' },
];

export default function ProfileForm() {
  const { profile, loading, refresh } = useProfile();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    sex: 'male',
    height_cm: '',
    current_weight_kg: '',
    activity_level: 'moderately_active'
  });

  // Pre-fill form when profile data arrives from context
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        age: profile.age ? String(profile.age) : '',
        sex: coerceEnum(profile.sex, SEX_VALUES, 'male'),
        height_cm: profile.height_cm ? String(profile.height_cm) : '',
        current_weight_kg: profile.current_weight_kg ? String(profile.current_weight_kg) : '',
        activity_level: coerceEnum(profile.activity_level, ACTIVITY_VALUES, 'moderately_active')
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);
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
        refresh(); // Update context so GoalsForm recalculates
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Could not save. Please try again.');
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError('Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-primary/10 p-2">
            <UserRound className="h-4 w-4 text-primary" />
          </span>
          <div>
            <CardTitle>Personal Info</CardTitle>
            <CardDescription>Used to calculate your calories, macros and water targets.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pf-name">Name</Label>
              <Input
                id="pf-name"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-age">Age</Label>
              <Input
                id="pf-age"
                type="number"
                min={10}
                max={120}
                placeholder="25"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Sex</Label>
              <Select value={formData.sex} onValueChange={(v) => setFormData({ ...formData, sex: coerceEnum(v, SEX_VALUES, 'male') })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {SEX_ITEMS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-height">Height (cm)</Label>
              <Input
                id="pf-height"
                type="number"
                min={100}
                max={250}
                placeholder="175"
                value={formData.height_cm}
                onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pf-weight">Current Weight (kg)</Label>
              <Input
                id="pf-weight"
                type="number"
                step="0.1"
                min={25}
                max={400}
                placeholder="70"
                value={formData.current_weight_kg}
                onChange={(e) => setFormData({ ...formData, current_weight_kg: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Activity level</Label>
              <Select value={formData.activity_level} onValueChange={(v) => setFormData({ ...formData, activity_level: coerceEnum(v, ACTIVITY_VALUES, 'moderately_active') })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_ITEMS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center">
            <Button type="submit" disabled={saving || loading} className="w-full sm:w-auto">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? 'Saving…' : 'Save Personal Info'}
            </Button>
            {success && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Saved successfully
              </span>
            )}
            {error && <span className="text-sm font-medium text-destructive">{error}</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
