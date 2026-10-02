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
  const [recalcFlash, setRecalcFlash] = useState(false);

  // Profile data needed for calculation
  const [profileData, setProfileData] = useState<any>(null);

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [goalsRes, profileRes] = await Promise.all([
          fetch('/api/goals'),
          fetch('/api/profile')
        ]);

        let goalUpdates: any = {};
        let profileUpdates: any = {};

        if (goalsRes.ok) {
          const data = await goalsRes.json();
          if (data) {
            goalUpdates = {
              calorieTarget: data.calorie_target ? String(data.calorie_target) : '2000',
              proteinTarget: data.protein_target ? String(data.protein_target) : '150',
              carbohydrateTarget: data.carbohydrate_target ? String(data.carbohydrate_target) : '200',
              fatTarget: data.fat_target ? String(data.fat_target) : '65',
              fiberTarget: data.fiber_target ? String(data.fiber_target) : '30',
              waterTargetL: data.water_target_ml ? String(data.water_target_ml / 1000) : '2.5'
            };
          }
        }

        if (profileRes.ok) {
          const profile = await profileRes.json();
          setProfileData(profile);
          if (profile) {
            profileUpdates = {
              primaryGoal: profile.goal || 'maintain_weight',
              goalWeightKg: profile.goal_weight_kg ? String(profile.goal_weight_kg) : '',
              goalRate: profile.goal_rate || 'moderate',
            };
          }
        }

        setFormData(prev => ({ ...prev, ...goalUpdates, ...profileUpdates }));
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Returns which profile fields are missing for BMR calculation
  const getMissingFields = (profile: any): string[] => {
    if (!profile) return ['age', 'sex', 'height', 'weight'];
    const missing: string[] = [];
    if (!profile.age) missing.push('age');
    if (!profile.sex) missing.push('sex');
    if (!profile.height_cm) missing.push('height');
    if (!profile.current_weight_kg) missing.push('current weight');
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
    // Use latest profileData from closure; goal is passed explicitly
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
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save goals:', err);
    } finally {
      setSaving(false);
    }
  };

  const activityLabel: Record<string, string> = {
    sedentary: 'Sedentary',
    lightly_active: 'Lightly Active',
    moderately_active: 'Moderately Active',
    very_active: 'Very Active',
    extremely_active: 'Extremely Active',
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 border rounded-lg bg-card">
      <div className="space-y-6">
        {/* Goal & Rate selectors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>What is your primary goal?</Label>
            <Select value={formData.primaryGoal} onValueChange={updateGoal}>
              <SelectTrigger><SelectValue placeholder="Select goal" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="lose_weight">Lose Weight</SelectItem>
                <SelectItem value="maintain_weight">Maintain Weight</SelectItem>
                <SelectItem value="gain_weight">Gain Weight</SelectItem>
                <SelectItem value="gain_muscle">Gain Muscle</SelectItem>
                <SelectItem value="general_health">General Health</SelectItem>
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
                <Label>Desired Rate</Label>
                <Select value={formData.goalRate} onValueChange={updateRate}>
                  <SelectTrigger><SelectValue placeholder="Select rate" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slow">Slow (~0.25 kg/week)</SelectItem>
                    <SelectItem value="moderate">Moderate (~0.5 kg/week)</SelectItem>
                    <SelectItem value="fast">Fast (~0.75 kg/week)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>

        {/* Recalculate banner */}
        <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
          {canCalculate ? (
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Based on: </span>
                {profileData.current_weight_kg} kg &middot; {profileData.height_cm} cm &middot; {profileData.age} yrs &middot;{' '}
                {activityLabel[profileData.activity_level] ?? profileData.activity_level ?? 'Sedentary'}
              </div>
              <div className="flex items-center gap-3">
                {recalcFlash && (
                  <span className="text-xs text-emerald-500 font-medium">
                    ✓ Targets updated
                  </span>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyCalculation()}
                >
                  ↻ Recalculate from profile
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              <span className="font-semibold">Profile incomplete — targets cannot be auto-calculated.</span>{' '}
              Go to the <span className="underline">Personal Info</span> tab and fill in:{' '}
              <span className="font-medium">{missingFields.join(', ')}</span>.
              You can still set targets manually below.
            </p>
          )}
        </div>

        {/* Manual target inputs */}
        <div className="pt-2 border-t space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-lg font-semibold">Daily Nutrition Targets</Label>
            <span className="text-xs text-muted-foreground">Edit manually or recalculate above</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Calories (kcal)</Label>
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
      </div>

      <div className="flex items-center gap-4 pt-4 border-t">
        <Button type="submit" disabled={saving || loading}>
          {saving ? 'Saving...' : 'Save Goals & Targets'}
        </Button>
        {success && <span className="text-sm text-green-500 font-medium">Goals saved successfully!</span>}
      </div>
    </form>
  );
}
