'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { AuthShell, AuthError, AuthSuccess } from '@/components/auth/AuthShell';

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
      redirectTo: `${window.location.origin}/reset-password`,
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
      icon={<KeyRound className="h-4 w-4 text-primary" />}
      footer={
        <>
          Remember your password?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleReset} className="space-y-4">
        {error && <AuthError message={error} />}
        {success && <AuthSuccess message="Check your email for the reset link!" />}

        <div className="space-y-2">
          <Label htmlFor="forgot-email">Email</Label>
          <Input
            id="forgot-email"
            type="email"
            placeholder="m@example.com"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading || success}>
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

