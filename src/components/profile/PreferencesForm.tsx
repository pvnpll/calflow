'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/lib/context/ProfileContext';
import { SlidersHorizontal, Loader2, CheckCircle2, Leaf, UtensilsCrossed } from 'lucide-react';

export default function PreferencesForm() {
  const { profile, loading, refresh } = useProfile();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    diet: 'omnivore',
    preferred_meal_count: '3',
    allergies: '',
    preferences: '',
    foodsToAvoid: ''
  });

  // Pre-fill when profile arrives from context
  useEffect(() => {
    if (profile) {
      setFormData({
        diet: profile.diet || 'omnivore',
        preferred_meal_count: profile.preferred_meal_count ? String(profile.preferred_meal_count) : '3',
        allergies: Array.isArray(profile.allergies) ? profile.allergies.join(', ') : '',
        preferences: Array.isArray(profile.preferences) ? profile.preferences.join(', ') : '',
        foodsToAvoid: Array.isArray(profile.foods_to_avoid) ? profile.foods_to_avoid.join(', ') : ''
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      const splitAndTrim = (str: string) => str.split(',').map(s => s.trim()).filter(Boolean);

      const payload = {
        diet: formData.diet,
        preferred_meal_count: parseInt(formData.preferred_meal_count, 10) || 3,
        allergies: splitAndTrim(formData.allergies),
        preferences: splitAndTrim(formData.preferences),
        foodsToAvoid: splitAndTrim(formData.foodsToAvoid)
      };

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSuccess(true);
        refresh();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Could not save. Please try again.');
      }
    } catch (err) {
      console.error('Failed to save preferences:', err);
      setError('Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const dietOptions = [
    { value: 'omnivore', label: 'Omnivore' },
    { value: 'pescatarian', label: 'Pescatarian' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'keto', label: 'Keto' },
    { value: 'paleo', label: 'Paleo' },
  ];
  const allergyCount = formData.allergies.split(',').map(s => s.trim()).filter(Boolean).length;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-primary/10 p-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
          </span>
          <div>
            <CardTitle>Food Preferences</CardTitle>
            <CardDescription>Helps suggestions respect your diet.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Diet type</Label>
            <div className="flex flex-wrap gap-2">
              {dietOptions.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, diet: d.value })}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    formData.diet === d.value
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'bg-background text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Meals per day</Label>
              <Select value={formData.preferred_meal_count} onValueChange={(v) => setFormData({ ...formData, preferred_meal_count: v ?? '3' })}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 meals</SelectItem>
                  <SelectItem value="3">3 meals</SelectItem>
                  <SelectItem value="4">4 meals</SelectItem>
                  <SelectItem value="5">5 meals</SelectItem>
                  <SelectItem value="6">6 meals</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                Allergies
                {allergyCount > 0 && <Badge variant="destructive" className="text-[11px]">{allergyCount}</Badge>}
              </Label>
              <Input placeholder="e.g. peanuts, shellfish" value={formData.allergies} onChange={(e) => setFormData({ ...formData, allergies: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Leaf className="h-3.5 w-3.5 text-emerald-500" /> Foods you enjoy
            </Label>
            <Textarea rows={2} placeholder="e.g. spicy food, high protein" value={formData.preferences} onChange={(e) => setFormData({ ...formData, preferences: e.target.value })} className="resize-none" />
            <p className="text-xs text-muted-foreground">Separate items with commas</p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <UtensilsCrossed className="h-3.5 w-3.5 text-amber-500" /> Foods to avoid
            </Label>
            <Textarea rows={2} placeholder="e.g. dairy, gluten, high sugar" value={formData.foodsToAvoid} onChange={(e) => setFormData({ ...formData, foodsToAvoid: e.target.value })} className="resize-none" />
            <p className="text-xs text-muted-foreground">Separate items with commas</p>
          </div>

          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center">
            <Button type="submit" disabled={saving || loading} className="w-full sm:w-auto">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? 'Saving…' : 'Save Preferences'}
            </Button>
            {success && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Saved
              </span>
            )}
            {error && <span className="text-sm font-medium text-destructive">{error}</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
