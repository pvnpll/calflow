'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils } from 'lucide-react';

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

    router.push('/login');
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
          <CardTitle className="text-xl font-semibold">Update password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdatePassword}>
          <CardContent className="space-y-4">
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-sm text-red-600 dark:text-red-400 rounded-md font-medium">{error}</div>}
            
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Updating...' : 'Update password'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
