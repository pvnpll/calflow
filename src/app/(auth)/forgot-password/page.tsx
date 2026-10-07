'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils } from 'lucide-react';
import Link from 'next/link';

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
    <div className="flex flex-col space-y-6 w-full sm:w-[400px] mx-auto">
      <div className="flex flex-col space-y-2 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <Utensils className="h-6 w-6 text-primary" />
          </div>
          <span className="text-2xl font-bold tracking-tight">CalFlow</span>
        </div>
      </div>
      
      <Card className="border-border shadow-md">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-semibold">Reset password</CardTitle>
          <CardDescription>
            Enter your email address and we will send you a password reset link
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleReset}>
          <CardContent className="space-y-4">
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-sm text-red-600 dark:text-red-400 rounded-md font-medium">{error}</div>}
            {success && <div className="p-3 bg-green-500/10 border border-green-500/20 text-sm text-green-600 dark:text-green-400 rounded-md font-medium">Check your email for the reset link!</div>}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button type="submit" className="w-full" disabled={loading || success}>
              {loading ? 'Sending link...' : 'Send reset link'}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Remember your password?{' '}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
