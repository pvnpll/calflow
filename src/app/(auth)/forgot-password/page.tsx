'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, Mail } from 'lucide-react';
import Link from 'next/link';
import { AuthShell, AuthError, AuthSuccess } from '@/components/auth/AuthShell';
import { AuthField } from '@/components/auth/AuthFields';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    const supabase = createClient();

    // We assume the reset url is origin/reset-password
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <AuthShell
      title="Reset password"
      description="We'll email you a reset link"
      footer={
        <>
          Remember your password?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline dark:text-white">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleReset} className="space-y-5">
        {error && <AuthError message={error} />}
        {success && <AuthSuccess message="Check your email for the reset link!" />}

        <AuthField
          id="forgot-email"
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
          hint="Enter the email you signed up with."
        />

        <Button
          type="submit"
          className="h-12 w-full rounded-2xl text-[15px] font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl active:scale-[0.98] dark:bg-white dark:text-black dark:shadow-white/10 dark:hover:bg-white/90"
          disabled={loading || success}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Sending link…' : success ? (
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Link sent
            </span>
          ) : (
            'Send reset link'
          )}
        </Button>
      </form>
    </AuthShell>
  );
}


