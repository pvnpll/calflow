'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, LinkIcon } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { AuthShell } from '@/components/auth/AuthShell';
import { PublicSharedDashboard } from '@/components/sharing/PublicSharedDashboard';

type State = 'joining' | 'public' | 'invalid' | 'error';

/**
 * Landing for a share link. Signed-in: adds the owner to my friends and opens their dashboard.
 * Signed-out: shows the dashboard read-only, with a prompt to sign up (which returns here).
 */
export function JoinShare({ token, ownerName }: { token: string; ownerName: string | null }) {
  const router = useRouter();
  const [state, setState] = useState<State>('joining');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/friends', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        if (cancelled) return;

        if (res.status === 401) return setState('public');
        if (res.status === 404) return setState('invalid');
        if (!res.ok) return setState('error');

        const data = await res.json();
        // Their own link -> just their own dashboard.
        router.replace(data.status === 'self' ? '/dashboard' : `/dashboard?friend=${data.ownerId}`);
      } catch {
        if (!cancelled) setState('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, router]);

  if (state === 'public') return <PublicSharedDashboard token={token} />;

  if (state === 'joining') {
    return (
      <Backdrop>
        <AuthShell
          title={ownerName ? `${ownerName}'s dashboard` : 'Shared dashboard'}
          description={ownerName ? `Opening ${ownerName}'s dashboard…` : 'Opening shared dashboard…'}
          icon={<LinkIcon className="h-4 w-4 text-primary" />}
        >
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </AuthShell>
      </Backdrop>
    );
  }

  return (
    <Backdrop>
      <AuthShell
        title={state === 'invalid' ? 'This link no longer works' : 'Something went wrong'}
        description={
          state === 'invalid'
            ? 'The link is invalid, or the owner has stopped sharing their dashboard.'
            : 'We could not open this shared dashboard. Please try again.'
        }
        icon={<LinkIcon className="h-4 w-4 text-primary" />}
      >
        <div className="flex gap-2">
          {state === 'error' && (
            <Button variant="outline" className="flex-1" onClick={() => window.location.reload()}>
              Try again
            </Button>
          )}
          <Link href="/dashboard" className={buttonVariants({ className: 'flex-1' })}>
            Go to my dashboard
          </Link>
        </div>
      </AuthShell>
    </Backdrop>
  );
}

function Backdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-background p-4">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-muted/30" />
        <div className="absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primary/[0.07] blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
