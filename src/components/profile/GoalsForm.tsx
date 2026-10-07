'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/lib/context/ProfileContext';
import { ACTIVITY_LABELS, coerceEnum, enumLabel } from '@/lib/utils';
import { Target, RefreshCw, CheckCircle2, Loader2, AlertTriangle, Flame, Beef, Wheat, Droplet, Nut } from 'lucide-react';

export default function GoalsForm() {
  const { profile: profileData, goals, loading, refresh } = useProfile();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recalcFlash, setRecalcFlash] = useState(false);

  const GOAL_VALUES = ['lose_weight', 'maintain_weight', 'gain_weight', 'gain_muscle', 'general_health'];
  const RATE_VALUES = ['slow', 'moderate', 'fast'];

  const GOAL_ITEMS = [
    { value: 'lose_weight', label: 'Lose Weight' },
    { value: 'maintain_weight', label: 'Maintain Weight' },
    { value: 'gain_weight', label: 'Gain Weight' },
    { value: 'gain_muscle', label: 'Gain Muscle' },
    { value: 'general_health', label: 'General Health' },
  ];
  const RATE_ITEMS = [
    { value: 'slow', label: 'Slow (~0.25 kg/week)' },
    { value: 'moderate', label: 'Moderate (~0.5 kg/week)' },
    { value: 'fast', label: 'Fast (~0.75 kg/week)' },
  ];

  const [formData, setFormData] = useState({
    primaryGoal: 'maintain_weight',
    goalWeightKg: '',
    goalRate: 'moderate',
    calorieTarget: '2000',
    proteinTarget: '150',
    carbohydrateTarget: '200',
    fatTarget: '65',
    fiberTarget: '30',
    waterTargetL: '2.5'
  });

  // Pre-fill from context data when it arrives
  useEffect(() => {
    const goalUpdates: any = goals ? {
      calorieTarget: goals.calorie_target ? String(goals.calorie_target) : '2000',
      proteinTarget: goals.protein_target ? String(goals.protein_target) : '150',
      carbohydrateTarget: goals.carbohydrate_target ? String(goals.carbohydrate_target) : '200',
      fatTarget: goals.fat_target ? String(goals.fat_target) : '65',
      fiberTarget: goals.fiber_target ? String(goals.fiber_target) : '30',
      waterTargetL: goals.water_target_ml ? String(goals.water_target_ml / 1000) : '2.5',
    } : {};

    const profileUpdates: any = profileData ? {
      primaryGoal: coerceEnum(profileData.goal, GOAL_VALUES, 'maintain_weight'),
      goalWeightKg: profileData.goal_weight_kg ? String(profileData.goal_weight_kg) : '',
      goalRate: coerceEnum(profileData.goal_rate, RATE_VALUES, 'moderate'),
    } : {};

    if (goals || profileData) {
      setFormData(prev => ({ ...prev, ...goalUpdates, ...profileUpdates }));
    }
  }, [goals, profileData]);

  // Returns which profile fields are missing for BMR calculation
  const getMissingFields = (profile: any): string[] => {
    if (!profile) return ['Age', 'Sex', 'Height', 'Weight'];
    const missing: string[] = [];
    if (!profile.age) missing.push('Age');
    if (!profile.sex) missing.push('Sex');
    if (!profile.height_cm) missing.push('Height');
    if (!profile.current_weight_kg) missing.push('Weight');
    return missing;
  };

  const missingFields = getMissingFields(profileData);
  const canCalculate = missingFields.length === 0;

  const calculateTargets = (goal: string, rate: string, profile: any) => {
    if (!profile?.current_weight_kg || !profile?.height_cm || !profile?.age || !profile?.sex) {
      return null;
    }

    let bmr = 10 * profile.current_weight_kg + 6.25 * profile.height_cm - 5 * profile.age;
    bmr += (profile.sex === 'male') ? 5 : -161;

    let multiplier = 1.2;
    switch (profile.activity_level) {
      case 'lightly_active': multiplier = 1.375; break;
      case 'moderately_active': multiplier = 1.55; break;
      case 'very_active': multiplier = 1.725; break;
      case 'extremely_active': multiplier = 1.9; break;
    }

    let tdee = bmr * multiplier;

    if (goal === 'lose_weight') {
      const deficit = rate === 'slow' ? 250 : rate === 'fast' ? 750 : 500;
      tdee -= deficit;
    } else if (goal === 'gain_weight' || goal === 'gain_muscle') {
      const surplus = rate === 'slow' ? 250 : rate === 'fast' ? 750 : 500;
      tdee += surplus;
    }

    const calories = Math.round(tdee);
    return {
      calorieTarget: String(calories),
      proteinTarget: String(Math.round((calories * 0.3) / 4)),
      carbohydrateTarget: String(Math.round((calories * 0.4) / 4)),
      fatTarget: String(Math.round((calories * 0.3) / 9)),
      fiberTarget: String(Math.round((calories / 1000) * 14)),
      waterTargetL: ((profile.current_weight_kg * 35) / 1000).toFixed(1)
    };
  };

  const applyCalculation = (goal?: string, rate?: string) => {
    const g = goal ?? formData.primaryGoal;
    const r = rate ?? formData.goalRate;
    const targets = calculateTargets(g, r, profileData);
    if (targets) {
      setFormData(prev => ({ ...prev, ...targets }));
      setRecalcFlash(true);
      setTimeout(() => setRecalcFlash(false), 2500);
    }
  };

  const updateGoal = (goal: string | null) => {
    const validGoal = goal ?? 'maintain_weight';
    setFormData(prev => ({ ...prev, primaryGoal: validGoal }));
    applyCalculation(validGoal, formData.goalRate);
  };

  const updateRate = (rate: string | null) => {
    const validRate = rate ?? 'moderate';
    setFormData(prev => ({ ...prev, goalRate: validRate }));
    applyCalculation(formData.primaryGoal, validRate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      const goalsPayload = {
        calorieTarget: parseFloat(formData.calorieTarget) || 2000,
        proteinTarget: parseFloat(formData.proteinTarget) || 150,
        carbohydrateTarget: parseFloat(formData.carbohydrateTarget) || 200,
        fatTarget: parseFloat(formData.fatTarget) || 65,
        fiberTarget: parseFloat(formData.fiberTarget) || 30,
        waterTargetMl: (parseFloat(formData.waterTargetL) || 2.5) * 1000,
      };

      const profilePayload = {
        goal: formData.primaryGoal,
        goalWeightKg: formData.goalWeightKg ? parseFloat(formData.goalWeightKg) : null,
        goalRate: formData.goalRate
      };

      const [goalsRes, profileRes] = await Promise.all([
        fetch('/api/goals', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(goalsPayload)
        }),
        fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profilePayload)
        })
      ]);

      if (goalsRes.ok && profileRes.ok) {
        setSuccess(true);
        refresh();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Could not save goals. Please try again.');
      }
    } catch (err) {
      console.error('Failed to save goals:', err);
      setError('Could not save goals. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const activityDisplay = enumLabel(ACTIVITY_LABELS, profileData?.activity_level, 'Not set');

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-primary/10 p-2">
            <Target className="h-4 w-4 text-primary" />
          </span>
          <div>
            <CardTitle>Goals &amp; Targets</CardTitle>
            <CardDescription>Set your goal and daily nutrition numbers.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Primary goal</Label>
              <Select value={formData.primaryGoal} onValueChange={(v) => updateGoal(coerceEnum(v, GOAL_VALUES, 'maintain_weight'))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_ITEMS.map((g) => (
                    <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          {(formData.primaryGoal === 'lose_weight' || formData.primaryGoal === 'gain_weight' || formData.primaryGoal === 'gain_muscle') && (
            <>
              <div className="space-y-2">
                <Label>Goal Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 68"
                  value={formData.goalWeightKg}
                  onChange={(e) => setFormData({ ...formData, goalWeightKg: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Desired rate</Label>
                <Select value={formData.goalRate} onValueChange={(v) => updateRate(coerceEnum(v, RATE_VALUES, 'moderate'))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select rate" />
                  </SelectTrigger>
                  <SelectContent>
                    {RATE_ITEMS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>

        {/* Recalculate banner */}
        <div className="rounded-xl border bg-muted/30 p-4">
          {canCalculate ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Based on:</span>
                <Badge variant="secondary" className="tabular-nums">{profileData.current_weight_kg} kg</Badge>
                <Badge variant="secondary" className="tabular-nums">{profileData.height_cm} cm</Badge>
                <Badge variant="secondary" className="tabular-nums">{profileData.age} yrs</Badge>
                <Badge variant="secondary">{activityDisplay}</Badge>
              </div>
              <div className="flex items-center gap-3">
                {recalcFlash && (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Updated
                  </span>
                )}
                <Button type="button" variant="outline" size="sm" onClick={() => applyCalculation()} className="w-full sm:w-auto">
                  <RefreshCw className="h-3.5 w-3.5" /> Recalculate
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-sm leading-relaxed text-amber-700 dark:text-amber-300">
                <span className="font-semibold">Profile incomplete — auto-calc is off.</span>{' '}
                Fill in <span className="font-medium">{missingFields.join(', ')}</span> under Personal Info.
              </p>
            </div>
          )}
        </div>

        {/* Manual target inputs */}
        <div className="space-y-4 border-t pt-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold">Daily Nutrition Targets</h3>
            <span className="text-xs text-muted-foreground">Edit manually or recalculate above</span>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Flame className="h-3.5 w-3.5 text-orange-500" /> Calories</Label>
              <Input type="number" min={800} max={10000} placeholder="2000" value={formData.calorieTarget} onChange={(e) => setFormData({ ...formData, calorieTarget: e.target.value })} className="tabular-nums" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Beef className="h-3.5 w-3.5 text-rose-500" /> Protein (g)</Label>
              <Input type="number" min={0} max={600} placeholder="150" value={formData.proteinTarget} onChange={(e) => setFormData({ ...formData, proteinTarget: e.target.value })} className="tabular-nums" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Wheat className="h-3.5 w-3.5 text-amber-500" /> Carbs (g)</Label>
              <Input type="number" min={0} max={1000} placeholder="200" value={formData.carbohydrateTarget} onChange={(e) => setFormData({ ...formData, carbohydrateTarget: e.target.value })} className="tabular-nums" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Nut className="h-3.5 w-3.5 text-violet-500" /> Fat (g)</Label>
              <Input type="number" min={0} max={500} placeholder="65" value={formData.fatTarget} onChange={(e) => setFormData({ ...formData, fatTarget: e.target.value })} className="tabular-nums" />
            </div>
            <div className="space-y-2">
              <Label>Fiber (g)</Label>
              <Input type="number" min={0} max={150} placeholder="30" value={formData.fiberTarget} onChange={(e) => setFormData({ ...formData, fiberTarget: e.target.value })} className="tabular-nums" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Droplet className="h-3.5 w-3.5 text-sky-500" /> Water (L)</Label>
              <Input type="number" step="0.1" min={0} max={12} placeholder="2.5" value={formData.waterTargetL} onChange={(e) => setFormData({ ...formData, waterTargetL: e.target.value })} className="tabular-nums" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center">
          <Button type="submit" disabled={saving || loading} className="w-full sm:w-auto">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'Saving…' : 'Save Goals & Targets'}
          </Button>
          {success && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" /> Goals saved
            </span>
          )}
          {error && <span className="text-sm font-medium text-destructive">{error}</span>}
        </div>
        </form>
      </CardContent>
    </Card>
  );
}
