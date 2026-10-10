'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, LinkIcon } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { AuthShell } from '@/components/auth/AuthShell';

type State = 'joining' | 'invalid' | 'error';

/**
 * Landing for a share link. Signed-in: adds the owner to my friends and opens their dashboard.
 * Signed-out: sends them through login/signup and back here (/login?next=/s/<token>).
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

        if (res.status === 401) {
          router.replace(`/login?next=${encodeURIComponent(`/s/${token}`)}`);
          return;
        }
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

  if (state === 'joining') {
    return (
      <AuthShell
        title={ownerName ? `${ownerName}'s dashboard` : 'Shared dashboard'}
        description={ownerName ? `Adding ${ownerName} to your friends…` : 'Opening shared dashboard…'}
        icon={<LinkIcon className="h-4 w-4 text-primary" />}
      >
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AuthShell>
    );
  }

  return (
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
  );
}
