'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useProfile } from '@/lib/context/ProfileContext';
import {
  ACTIVITY_LABELS,
  DIET_LABELS,
  GOAL_LABELS,
  GOAL_RATE_LABELS,
  SEX_LABELS,
  enumLabel,
} from '@/lib/utils';
import {
  AlertTriangle,
  Beef,
  CheckCircle2,
  CircleSlash,
  Droplet,
  Flame,
  Leaf,
  Loader2,
  Nut,
  Pencil,
  RefreshCw,
  ShieldAlert,
  Target,
  UserRound,
  UtensilsCrossed,
  Wheat,
} from 'lucide-react';

/** Same Mifflin-St Jeor formula used by the Goals edit form. */
function calcTargets(profile: any) {
  if (!profile?.current_weight_kg || !profile?.height_cm || !profile?.age || !profile?.sex) {
    return null;
  }
  let bmr = 10 * profile.current_weight_kg + 6.25 * profile.height_cm - 5 * profile.age;
  bmr += profile.sex === 'male' ? 5 : -161;

  let multiplier = 1.2;
  switch (profile.activity_level) {
    case 'lightly_active': multiplier = 1.375; break;
    case 'moderately_active': multiplier = 1.55; break;
    case 'very_active': multiplier = 1.725; break;
    case 'extremely_active': multiplier = 1.9; break;
  }

  let tdee = bmr * multiplier;
  const goal = profile.goal;
  const rate = profile.goal_rate;
  if (goal === 'lose_weight') {
    tdee -= rate === 'slow' ? 250 : rate === 'fast' ? 750 : 500;
  } else if (goal === 'gain_weight' || goal === 'gain_muscle') {
    tdee += rate === 'slow' ? 250 : rate === 'fast' ? 750 : 500;
  }

  const calories = Math.round(tdee);
  return {
    calorieTarget: calories,
    proteinTarget: Math.round((calories * 0.3) / 4),
    carbohydrateTarget: Math.round((calories * 0.4) / 4),
    fatTarget: Math.round((calories * 0.3) / 9),
    fiberTarget: Math.round((calories / 1000) * 14),
    waterTargetMl: Math.round(profile.current_weight_kg * 35),
  };
}

function getMissingFields(profile: any): string[] {
  if (!profile) return ['Age', 'Sex', 'Height', 'Weight'];
  const missing: string[] = [];
  if (!profile.age) missing.push('Age');
  if (!profile.sex) missing.push('Sex');
  if (!profile.height_cm) missing.push('Height');
  if (!profile.current_weight_kg) missing.push('Weight');
  return missing;
}

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border bg-muted/30 px-3.5 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-base font-semibold tabular-nums">
        {value}
        {sub && <span className="ml-1 text-xs font-medium text-muted-foreground">{sub}</span>}
      </p>
    </div>
  );
}

function TargetTile({ icon, label, value, unit }: { icon: React.ReactNode; label: string; value: string; unit: string }) {
  return (
    <div className="rounded-xl border px-3.5 py-3">
      <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-lg font-bold tabular-nums">
        {value} <span className="text-xs font-medium text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}

function ChipList({ items, emptyText }: { items: unknown; emptyText: string }) {
  const list = Array.isArray(items) ? items.filter(Boolean) : [];
  if (list.length === 0) return <span className="text-sm text-muted-foreground">{emptyText}</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {list.map((item, i) => (
        <Badge key={`${item}-${i}`} variant="secondary" className="font-normal">{String(item)}</Badge>
      ))}
    </div>
  );
}

function PrefRow({ icon, label, items, emptyText }: { icon?: React.ReactNode; label: string; items: unknown; emptyText: string }) {
  return (
    <div className="rounded-xl border bg-muted/30 px-3.5 py-3">
      <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </p>
      <div className="mt-1.5">
        <ChipList items={items} emptyText={emptyText} />
      </div>
    </div>
  );
}

export default function ProfileOverview({ onEdit }: { onEdit: (section: 'personal' | 'goals' | 'preferences' | 'account') => void }) {
  const { profile, goals, loading, refreshSilent } = useProfile();
  const [recalculating, setRecalculating] = useState(false);
  const [recalcFlash, setRecalcFlash] = useState(false);
  const [recalcError, setRecalcError] = useState<string | null>(null);
  // Local copy of targets so recalculation updates only the tiles — no page reload.
  const [localGoals, setLocalGoals] = useState<any>(null);

  const missingFields = getMissingFields(profile);
  const canCalculate = missingFields.length === 0;

  const bmi = profile?.height_cm && profile?.current_weight_kg
    ? (profile.current_weight_kg / Math.pow(profile.height_cm / 100, 2)).toFixed(1)
    : null;

  const handleRecalculate = async () => {
    const targets = calcTargets(profile);
    if (!targets) return;
    setRecalculating(true);
    setRecalcError(null);
    try {
      const res = await fetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calorieTarget: targets.calorieTarget,
          proteinTarget: targets.proteinTarget,
          carbohydrateTarget: targets.carbohydrateTarget,
          fatTarget: targets.fatTarget,
          fiberTarget: targets.fiberTarget,
          waterTargetMl: targets.waterTargetMl,
        }),
      });
      if (!res.ok) throw new Error('recalc failed');
      const saved = await res.json();
      // Update only the target tiles in place — no context reload, no page flash.
      setLocalGoals({
        calorie_target: saved?.calorie_target ?? targets.calorieTarget,
        protein_target: saved?.protein_target ?? targets.proteinTarget,
        carbohydrate_target: saved?.carbohydrate_target ?? targets.carbohydrateTarget,
        fat_target: saved?.fat_target ?? targets.fatTarget,
        fiber_target: saved?.fiber_target ?? targets.fiberTarget,
        water_target_ml: saved?.water_target_ml ?? targets.waterTargetMl,
      });
      // Sync context silently in the background so edit forms stay fresh.
      refreshSilent();
      setRecalcFlash(true);
      setTimeout(() => setRecalcFlash(false), 2500);
    } catch {
      setRecalcError('Could not recalculate. Please try again.');
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) return null;

  // Prefer freshly recalculated values; fall back to context goals.
  const visibleGoals = localGoals ?? goals;

  const displayName = profile?.name || 'Your Profile';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="space-y-4">
      {/* Identity header */}
      <Card className="shadow-sm">
        <CardContent className="flex items-center gap-4 py-6">
          <Avatar className="h-14 w-14 shrink-0 self-center">
            <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">{initial}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 self-center">
            <h2 className="truncate text-xl font-bold tracking-tight">{displayName}</h2>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
              {profile?.age ? <span className="tabular-nums">{profile.age} yrs</span> : <span>Age not set</span>}
              <span aria-hidden>·</span>
              <span>{enumLabel(SEX_LABELS, profile?.sex)}</span>
              <span aria-hidden>·</span>
              <span>{enumLabel(GOAL_LABELS, profile?.goal, 'No goal yet')}</span>
            </p>
          </div>
          <Button onClick={() => onEdit('personal')} className="shrink-0 gap-1.5 self-center">
            <Pencil className="h-4 w-4" /> Edit profile
          </Button>
        </CardContent>
      </Card>

      {/* Personal / body metrics */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-primary/10 p-2">
              <UserRound className="h-4 w-4 text-primary" />
            </span>
            <div>
              <CardTitle className="text-base">Body Metrics</CardTitle>
              <CardDescription className="text-xs">Used to calculate your targets</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <StatTile label="Height" value={profile?.height_cm ? `${profile.height_cm} cm` : '—'} />
            <StatTile label="Weight" value={profile?.current_weight_kg ? `${profile.current_weight_kg} kg` : '—'} />
            <StatTile label="BMI" value={bmi ?? '—'} sub={bmi ? 'kg/m²' : undefined} />
            <StatTile label="Age" value={profile?.age ? `${profile.age} yrs` : '—'} />
            <StatTile label="Sex" value={enumLabel(SEX_LABELS, profile?.sex, '—')} />
            <StatTile label="Activity" value={enumLabel(ACTIVITY_LABELS, profile?.activity_level, '—')} />
          </div>
        </CardContent>
      </Card>

      {/* Goals + daily targets + recalculate */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-primary/10 p-2">
              <Target className="h-4 w-4 text-primary" />
            </span>
            <div>
              <CardTitle className="text-base">Goals & Daily Targets</CardTitle>
              <CardDescription className="text-xs">Your nutrition plan for today</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            <Badge className="gap-1">{enumLabel(GOAL_LABELS, profile?.goal, 'No goal set')}</Badge>
            {(profile?.goal === 'lose_weight' || profile?.goal === 'gain_weight' || profile?.goal === 'gain_muscle') && (
              <>
                {profile?.goal_weight_kg && (
                  <Badge variant="secondary" className="tabular-nums">→ {profile.goal_weight_kg} kg</Badge>
                )}
                <Badge variant="outline">{enumLabel(GOAL_RATE_LABELS, profile?.goal_rate, 'Moderate')}</Badge>
              </>
            )}
            <span className="min-w-2 flex-1" aria-hidden />
            {canCalculate ? (
              <span className="flex items-center gap-2">
                {recalcFlash && (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Updated
                  </span>
                )}
                <Button type="button" variant="outline" size="sm" onClick={handleRecalculate} disabled={recalculating}>
                  {recalculating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  {recalculating ? 'Recalculating…' : 'Recalculate targets'}
                </Button>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                Add {missingFields.join(', ')} to enable recalculation
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <TargetTile icon={<Flame className="h-3.5 w-3.5 text-orange-500" />} label="Calories" value={String(visibleGoals?.calorie_target ?? '—')} unit="kcal" />
            <TargetTile icon={<Beef className="h-3.5 w-3.5 text-rose-500" />} label="Protein" value={String(visibleGoals?.protein_target ?? '—')} unit="g" />
            <TargetTile icon={<Wheat className="h-3.5 w-3.5 text-amber-500" />} label="Carbs" value={String(visibleGoals?.carbohydrate_target ?? '—')} unit="g" />
            <TargetTile icon={<Nut className="h-3.5 w-3.5 text-violet-500" />} label="Fat" value={String(visibleGoals?.fat_target ?? '—')} unit="g" />
            <TargetTile icon={<Leaf className="h-3.5 w-3.5 text-emerald-500" />} label="Fiber" value={String(visibleGoals?.fiber_target ?? '—')} unit="g" />
            <TargetTile icon={<Droplet className="h-3.5 w-3.5 text-sky-500" />} label="Water" value={visibleGoals?.water_target_ml ? String(Math.round(visibleGoals.water_target_ml / 100) / 10) : '—'} unit="L" />
          </div>
          {recalcError && <p className="text-sm font-medium text-destructive">{recalcError}</p>}
        </CardContent>
      </Card>
      {/* Preferences */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-primary/10 p-2">
              <UtensilsCrossed className="h-4 w-4 text-primary" />
            </span>
            <div>
              <CardTitle className="text-base">Food Preferences</CardTitle>
              <CardDescription className="text-xs">Guides AI meal suggestions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <StatTile label="Diet" value={enumLabel(DIET_LABELS, profile?.diet, '—')} />
            <StatTile label="Meals / day" value={profile?.preferred_meal_count ? `${profile.preferred_meal_count}` : '—'} />
          </div>
          <PrefRow icon={<ShieldAlert className="h-3 w-3 text-rose-500" />} label="Allergies" items={profile?.allergies} emptyText="None listed" />
          <PrefRow icon={<Leaf className="h-3 w-3 text-emerald-500" />} label="Foods you enjoy" items={profile?.preferences} emptyText="Nothing listed yet" />
          <PrefRow icon={<CircleSlash className="h-3 w-3 text-amber-500" />} label="Foods to avoid" items={profile?.foods_to_avoid} emptyText="Nothing listed" />
        </CardContent>
      </Card>
    </div>
  );
}
