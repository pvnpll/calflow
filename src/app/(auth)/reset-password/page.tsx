'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { AuthShell, AuthError } from '@/components/auth/AuthShell';
import { AuthPasswordField } from '@/components/auth/AuthFields';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <AuthShell
      title="Update password"
      description="Choose a new password"
    >
      <form onSubmit={handleUpdatePassword} className="space-y-3.5 sm:space-y-5">
        {error && <AuthError message={error} />}

        <AuthPasswordField
          id="reset-password"
          name="password"
          label="New password"
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
          {loading ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </AuthShell>
  );
}


