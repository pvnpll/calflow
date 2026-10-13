'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Mail } from 'lucide-react';
import Link from 'next/link';
import { AuthShell, AuthError } from '@/components/auth/AuthShell';
import { AuthField, AuthPasswordField } from '@/components/auth/AuthFields';
import { getNextFromLocation } from '@/lib/redirect';

export default function LoginPage() {
  const router = useRouter();
  // Keep ?next= when hopping between sign in and sign up (e.g. someone opening a share link).
  const [nextQuery, setNextQuery] = useState('');
  useEffect(() => {
    const next = getNextFromLocation();
    setNextQuery(next !== '/' ? `?next=${encodeURIComponent(next)}` : '');
  }, []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(getNextFromLocation());
    router.refresh();
  };

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue tracking"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link href={`/signup${nextQuery}`} className="font-semibold text-primary hover:underline dark:text-white">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleLogin} className="space-y-5">
        {error && <AuthError message={error} />}

        <AuthField
          id="login-email"
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

        <div className="space-y-2">
          <AuthPasswordField
            id="login-password"
            name="password"
            label="Password"
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {/* Forgot password sits under the field, right-aligned —
              out of the label row so it never crowds the label on narrow screens */}
          <div className="flex justify-end pt-0.5">
            <Link
              href="/forgot-password"
              className="text-[13px] font-semibold text-muted-foreground transition-colors hover:text-primary hover:underline dark:hover:text-white"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          className="h-12 w-full rounded-2xl text-[15px] font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl active:scale-[0.98] dark:bg-white dark:text-black dark:shadow-white/10 dark:hover:bg-white/90"
          disabled={loading}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthShell>
  );
}


