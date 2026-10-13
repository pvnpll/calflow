// Shared auth form primitives — icon inputs, password toggle, strength meter.
'use client';

import { useMemo, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from 'cn';

const FIELD_INPUT =
  'h-12 rounded-2xl border-border/70 bg-muted/40 pl-11 text-[15px] shadow-sm transition-all placeholder:text-muted-foreground/70 hover:border-border hover:bg-muted/60 focus-visible:border-primary/50 focus-visible:bg-background focus-visible:ring-4 focus-visible:ring-primary/10 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20 dark:hover:bg-white/[0.06] dark:focus-visible:border-white/30 dark:focus-visible:bg-white/[0.05] dark:focus-visible:ring-white/10';

export function AuthField({
  id,
  label,
  icon,
  hint,
  inputClassName,
  ...props
}: React.ComponentProps<'input'> & {
  id: string;
  label: string;
  icon: React.ReactNode;
  hint?: string;
  inputClassName?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-[14px] font-semibold tracking-tight">
        {label}
      </Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70">
          {icon}
        </span>
        <Input id={id} {...props} className={cn(FIELD_INPUT, inputClassName)} />
      </div>
      {hint ? <p className="text-[13px] leading-snug text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function AuthPasswordField({
  id,
  label,
  placeholder = 'Enter your password',
  value,
  hint,
  autoComplete = 'current-password',
  showStrength = false,
  ...props
}: Omit<React.ComponentProps<'input'>, 'type'> & {
  id: string;
  label: string;
  value: string;
  hint?: string;
  showStrength?: boolean;
}) {
  const [show, setShow] = useState(false);

  const strength = useMemo(() => {
    if (!showStrength || !value) return null;
    let score = 0;
    if (value.length >= 6) score += 1;
    if (value.length >= 10) score += 1;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    if (score <= 2) return { label: 'Weak', width: 'w-1/4', bar: 'bg-red-500' };
    if (score === 3) return { label: 'Okay', width: 'w-2/4', bar: 'bg-amber-500' };
    if (score === 4) return { label: 'Good', width: 'w-3/4', bar: 'bg-emerald-500' };
    return { label: 'Strong', width: 'w-full', bar: 'bg-emerald-500' };
  }, [value, showStrength]);

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-[14px] font-semibold tracking-tight">
        {label}
      </Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="m7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </span>
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          {...props}
          className={cn(FIELD_INPUT, 'pr-11')}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-white/10"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
        </button>
      </div>
      {showStrength ? (
        value ? (
          <div className="flex items-center gap-2.5 pt-0.5">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted dark:bg-white/10">
              <div className={cn('h-full rounded-full transition-all duration-300', strength?.width, strength?.bar)} />
            </div>
            <span className="w-14 text-right text-xs font-medium text-muted-foreground">
              {strength?.label}
            </span>
          </div>
        ) : (
          <p className="text-[13px] leading-snug text-muted-foreground">
            {hint ?? 'Use 6+ characters with a mix of letters & numbers.'}
          </p>
        )
      ) : hint ? (
        <p className="text-[13px] leading-snug text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
