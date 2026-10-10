'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { calculateTargets } from '@/lib/nutrition-targets';
import { isOnboardingComplete } from '@/lib/onboarding';
import { GOAL_RATE_LABELS } from '@/lib/utils';

const SEX_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Sedentary', hint: 'Desk job, little or no exercise' },
  { value: 'lightly_active', label: 'Lightly active', hint: 'Exercise 1–2 days a week' },
  { value: 'moderately_active', label: 'Moderately active', hint: 'Exercise 3–4 days a week' },
  { value: 'very_active', label: 'Very active', hint: 'Hard exercise 5+ days a week' },
  { value: 'extremely_active', label: 'Athlete / physical job', hint: 'Training twice a day or heavy manual work' },
];

const GOAL_OPTIONS = [
  { value: 'lose_weight', label: 'Lose weight', hint: 'Reduce body fat with a calorie deficit' },
  { value: 'maintain_weight', label: 'Maintain weight', hint: 'Stay at your current weight' },
  { value: 'gain_weight', label: 'Gain weight', hint: 'Build up with a calorie surplus' },
  { value: 'gain_muscle', label: 'Gain muscle', hint: 'Lean gain with higher protein' },
  { value: 'general_health', label: 'General health', hint: 'Eat well, no weight target' },
];

const HAS_RATE = ['lose_weight', 'gain_weight', 'gain_muscle'];
const STEPS = ['About you', 'Body & lifestyle', 'Your goal'];

interface FormState {
  name: string;
  age: string;
  sex: string;
  height: string;
  weight: string;
  activity: string;
  goal: string;
  goalWeight: string;
  rate: string;
}

/**
 * Numeric entry as a plain text input (digits, and one dot when `decimal`).
 * type="number" shows a spinner on focus and attracts password-manager overlays, which
 * shifts the field's contents; this avoids both.
 */
function NumberField({
  id,
  value,
  onChange,
  placeholder,
  decimal = false,
  maxLength = 5,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  decimal?: boolean;
  maxLength?: number;
}) {
  const clean = (raw: string) => {
    if (!decimal) return raw.replace(/\D/g, '');
    const s = raw.replace(/[^0-9.]/g, '');
    const [int, ...rest] = s.split('.');
    return rest.length ? `${int}.${rest.join('')}` : int;
  };
  return (
    <Input
      id={id}
      type="text"
      inputMode={decimal ? 'decimal' : 'numeric'}
      autoComplete="off"
      maxLength={maxLength}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(clean(e.target.value))}
      data-lpignore="true"
      data-1p-ignore
      data-bwignore="true"
      data-form-type="other"
    />
  );
}

function ChoiceButton({
  selected,
  onClick,
  label,
  hint,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`w-full rounded-xl border px-4 py-3 text-left transition-all active:scale-[0.99] ${
        selected ? 'border-primary bg-primary/10' : 'hover:bg-muted/60'
      }`}
    >
      <span className={`block text-sm font-semibold ${selected ? 'text-primary' : ''}`}>{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>}
    </button>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    name: '',
    age: '',
    sex: '',
    height: '',
    weight: '',
    activity: '',
    goal: '',
    goalWeight: '',
    rate: 'moderate',
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setError(null);
  };

  // Pre-fill from whatever exists (sign-up name, partial profile). Already onboarded -> straight to the app.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [{ data: { user } }, res] = await Promise.all([
          createClient().auth.getUser(),
          fetch('/api/profile'),
        ]);
        const profile = res.ok ? await res.json() : null;
        if (cancelled) return;
        if (isOnboardingComplete(profile)) {
          router.replace('/dashboard');
          return;
        }
        setForm((f) => ({
          ...f,
          name: profile?.name || (user?.user_metadata?.full_name as string) || '',
          age: profile?.age ? String(profile.age) : '',
          sex: profile?.sex || '',
          height: profile?.height_cm ? String(profile.height_cm) : '',
          weight: profile?.current_weight_kg ? String(profile.current_weight_kg) : '',
          activity: profile?.activity_level || '',
          goal: profile?.goal || '',
          goalWeight: profile?.goal_weight_kg ? String(profile.goal_weight_kg) : '',
          rate: profile?.goal_rate || 'moderate',
        }));
      } catch {
        // start with an empty form
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const age = Number(form.age);
  const height = Number(form.height);
  const weight = Number(form.weight);
  const goalWeight = form.goalWeight ? Number(form.goalWeight) : null;
  const hasRate = HAS_RATE.includes(form.goal);

  /** Returns an error message for the step, or null if it's valid. */
  const validate = (s: number): string | null => {
    if (s === 0) {
      if (!form.name.trim()) return 'Please tell us your name.';
      if (!Number.isInteger(age) || age < 13 || age > 120) return 'Enter an age between 13 and 120.';
      if (!form.sex) return 'Please select your sex — it is used in the calorie calculation.';
    }
    if (s === 1) {
      if (!(height >= 100 && height <= 250)) return 'Enter your height in cm (100–250).';
      if (!(weight >= 25 && weight <= 400)) return 'Enter your weight in kg (25–400).';
      if (!form.activity) return 'Please choose your activity level.';
    }
    if (s === 2) {
      if (!form.goal) return 'Please choose a goal.';
      if (goalWeight !== null) {
        if (!(goalWeight >= 25 && goalWeight <= 400)) return 'Enter a goal weight in kg (25–400).';
        if (form.goal === 'lose_weight' && goalWeight >= weight) return 'Your goal weight should be below your current weight.';
        if ((form.goal === 'gain_weight' || form.goal === 'gain_muscle') && goalWeight <= weight) {
          return 'Your goal weight should be above your current weight.';
        }
      }
    }
    return null;
  };

  const next = () => {
    const problem = validate(step);
    if (problem) return setError(problem);
    setStep((s) => s + 1);
  };

  const targets = useMemo(() => {
    if (!form.goal || !form.sex || !form.activity || !age || !height || !weight) return null;
    return calculateTargets(
      { age, sex: form.sex, height_cm: height, current_weight_kg: weight, activity_level: form.activity },
      form.goal,
      form.rate,
    );
  }, [form.goal, form.sex, form.activity, form.rate, age, height, weight]);

  const finish = async () => {
    const problem = validate(0) || validate(1) || validate(2);
    if (problem) return setError(problem);
    if (!targets) return setError('Could not calculate your targets — please check your details.');

    setSaving(true);
    setError(null);
    try {
      // Targets first, profile last: the profile is what marks onboarding complete, so a failure
      // in between leaves the user in onboarding rather than in the app without goals.
      const goalsRes = await fetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targets),
      });
      if (!goalsRes.ok) throw new Error('goals');

      const profileRes = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim().replace(/\s+/g, ' '),
          age,
          sex: form.sex,
          heightCm: height,
          currentWeightKg: weight, // also logs today's entry in the weight trend
          activityLevel: form.activity,
          goal: form.goal,
          goalRate: form.rate,
          ...(goalWeight !== null ? { goalWeightKg: goalWeight } : {}),
        }),
      });
      if (!profileRes.ok) throw new Error('profile');

      router.replace('/dashboard');
      router.refresh();
    } catch {
      setError('Something went wrong while saving. Please try again.');
      setSaving(false);
    }
  };

  const signOut = async () => {
    await createClient().auth.signOut();
    router.push('/login');
  };

  if (!ready) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isLast = step === STEPS.length - 1;

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="mx-auto flex items-center gap-2.5">
        <span className="rounded-full bg-primary/10 p-2.5">
          <UtensilsCrossed className="h-5 w-5 text-primary" />
        </span>
        <span className="text-2xl font-bold tracking-tight">CalFlow</span>
      </div>

      <Card className="shadow-sm bg-background/60 backdrop-blur-xl border-white/10 dark:border-white/5">
        <CardHeader className="pb-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Step {step + 1} of {STEPS.length}
          </p>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1}>
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
          <CardTitle className="pt-3 text-lg">
            {step === 0 && `Welcome${form.name.trim() ? `, ${form.name.trim().split(' ')[0]}` : ''}! Let's set up your profile`}
            {step === 1 && 'Your body & lifestyle'}
            {step === 2 && 'What is your goal?'}
          </CardTitle>
          <CardDescription>
            {step === 0 && 'A few basics so CalFlow can personalise your targets.'}
            {step === 1 && 'Used to estimate how many calories your body uses each day.'}
            {step === 2 && "We'll set your daily calorie, macro and water targets from this."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ob-name">Name</Label>
                <Input id="ob-name" autoComplete="name" placeholder="Your name" value={form.name} onChange={(e) => set('name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ob-age">Age</Label>
                <NumberField id="ob-age" maxLength={3} placeholder="25" value={form.age} onChange={(v) => set('age', v)} />
              </div>
              <div className="space-y-2">
                <Label>Sex</Label>
                <div className="grid grid-cols-2 gap-2">
                  {SEX_OPTIONS.map((o) => (
                    <ChoiceButton key={o.value} selected={form.sex === o.value} onClick={() => set('sex', o.value)} label={o.label} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ob-height">Height (cm)</Label>
                  <NumberField id="ob-height" decimal placeholder="175" value={form.height} onChange={(v) => set('height', v)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ob-weight">Current weight (kg)</Label>
                  <NumberField id="ob-weight" decimal placeholder="70" value={form.weight} onChange={(v) => set('weight', v)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Activity level</Label>
                <div className="space-y-2">
                  {ACTIVITY_OPTIONS.map((o) => (
                    <ChoiceButton key={o.value} selected={form.activity === o.value} onClick={() => set('activity', o.value)} label={o.label} hint={o.hint} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-2">
                {GOAL_OPTIONS.map((o) => (
                  <ChoiceButton key={o.value} selected={form.goal === o.value} onClick={() => set('goal', o.value)} label={o.label} hint={o.hint} />
                ))}
              </div>

              {hasRate && (
                <div className="space-y-4 border-t pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="ob-goal-weight">Goal weight (kg) <span className="font-normal text-muted-foreground">— optional</span></Label>
                    <NumberField id="ob-goal-weight" decimal placeholder={form.goal === 'lose_weight' ? 'e.g. 65' : 'e.g. 75'} value={form.goalWeight} onChange={(v) => set('goalWeight', v)} />
                  </div>
                  <div className="space-y-2">
                    <Label>How fast?</Label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {Object.entries(GOAL_RATE_LABELS).map(([value, label]) => (
                        <ChoiceButton key={value} selected={form.rate === value} onClick={() => set('rate', value)} label={label.split(' (')[0]} hint={label.match(/\((.*)\)/)?.[1]} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {age < 18 && (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Your daily targets are calculated with adult formulas; for under-18s please check with a doctor or dietitian.
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/25 bg-destructive/[0.06] px-4 py-3 text-sm font-medium leading-relaxed text-destructive">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-t pt-4">
            {step > 0 ? (
              <Button type="button" variant="ghost" onClick={() => { setError(null); setStep((s) => s - 1); }} disabled={saving}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            ) : (
              <span />
            )}
            {isLast ? (
              <Button type="button" onClick={finish} disabled={saving || !targets}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {saving ? 'Setting up…' : 'Finish setup'}
              </Button>
            ) : (
              <Button type="button" onClick={next}>
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <button type="button" onClick={signOut} className="text-center text-xs text-muted-foreground hover:text-foreground">
        Sign out
      </button>
    </div>
  );
}
