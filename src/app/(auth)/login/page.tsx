'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { AuthShell, AuthError } from '@/components/auth/AuthShell';
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
  const [showPassword, setShowPassword] = useState(false);
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
      icon={<LogIn className="h-4 w-4 text-primary" />}
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link href={`/signup${nextQuery}`}className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleLogin} className="space-y-4">
        {error && <AuthError message={error} />}

        <div className="space-y-2">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="login-password">Password</Label>
          <div className="relative">
            <Input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {/* Forgot password sits under the field, right-aligned —
              out of the label row so it never crowds the label on narrow screens */}
          <div className="flex justify-end pt-1">
            <Link
              href="/forgot-password"
              className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-primary hover:underline relative z-50 cursor-pointer"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthShell>
  );
}

