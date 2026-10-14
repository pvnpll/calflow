'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, User, Mail } from 'lucide-react';
import Link from 'next/link';
import { AuthShell, AuthError } from '@/components/auth/AuthShell';
import { AuthField, AuthPasswordField } from '@/components/auth/AuthFields';
import { getBrowserTimezone } from '@/lib/date';
import { getNextFromLocation } from '@/lib/redirect';

export default function SignupPage() {
  const router = useRouter();
  const [nextQuery, setNextQuery] = useState('');
  useEffect(() => {
    const next = getNextFromLocation();
    setNextQuery(next !== '/' ? `?next=${encodeURIComponent(next)}` : '');
  }, []);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const cleanName = name.trim().replace(/\s+/g, ' ');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: cleanName,
        },
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Seed the profile right away: the name (so the dashboard greets them by first name) and
    // their timezone (so server-side "today" is correct from their first action). Each is a separate
    // request so one failing can't lose the other. Without a session (email confirmation on) nothing
    // is saved yet — onboarding pre-fills the name from the sign-up metadata and TimezoneSync saves the zone.
    if (data.session) {
      const save = (payload: Record<string, string>) =>
        fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => {});
      await save({ name: cleanName });
      const timezone = getBrowserTimezone();
      if (timezone) await save({ timezone });
    }

    router.push(getNextFromLocation());
    router.refresh();
  };

  return (
    <AuthShell
      title="Create an account"
      description="Start tracking nutrition with AI"
      footer={
        <>
          Already have an account?{' '}
          <Link href={`/login${nextQuery}`} className="font-semibold text-primary hover:underline dark:text-white">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSignup} className="space-y-3.5 sm:space-y-5">
        {error && <AuthError message={error} />}

        <AuthField
          id="signup-name"
          name="name"
          label="Full name"
          type="text"
          placeholder="e.g. Alex Morgan"
          autoComplete="name"
          autoCapitalize="words"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<User className="h-[18px] w-[18px]" />}
        />

        <AuthField
          id="signup-email"
          name="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="h-[18px] w-[18px]" />}
        />

        <AuthPasswordField
          id="signup-password"
          name="password"
          label="Password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showStrength
          hint="Use 6+ characters with a mix of letters & numbers."
        />

        <Button
          type="submit"
          className="h-11 w-full rounded-2xl text-[15px] font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl active:scale-[0.98] sm:h-12 dark:bg-white dark:text-black dark:shadow-white/10 dark:hover:bg-white/90"
          disabled={loading}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthShell>
  );
}


