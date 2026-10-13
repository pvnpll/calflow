'use client';

import Link from 'next/link';
import { UtensilsCrossed } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import DashboardContent from '@/components/dashboard/DashboardContent';

/**
 * A shared dashboard for visitors without an account: read-only, with a top bar and a closing
 * card inviting them to sign up. Sign-up/login return to /s/<token>, where a signed-in visitor
 * is added to the owner's friends as usual.
 */
export function PublicSharedDashboard({ token }: { token: string }) {
  const next = `?next=${encodeURIComponent(`/s/${token}`)}`;

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 md:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2" aria-label="CalFlow home">
            <span className="rounded-full bg-primary/10 p-2">
              <UtensilsCrossed className="h-4 w-4 text-primary" />
            </span>
            <span className="text-lg font-bold tracking-tight">CalFlow</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href={`/login${next}`} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              Log in
            </Link>
            <Link href={`/signup${next}`} className={buttonVariants({ size: 'sm' })}>
              Sign up free
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 p-4 md:p-6 lg:p-8">
        <DashboardContent shareToken={token} />

        <section className="rounded-2xl border bg-primary/5 p-6 text-center shadow-sm md:p-8">
          <h2 className="text-xl font-bold tracking-tight">Start tracking your own calories</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            CalFlow is an AI-first nutrition tracker. Log meals by chatting, hit your daily targets, and share your progress with friends — just like this.
          </p>
          <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <Link href={`/signup${next}`} className={buttonVariants({ size: 'lg' })}>
              Create your free account
            </Link>
            <Link href={`/login${next}`} className={buttonVariants({ variant: 'outline', size: 'lg' })}>
              I already have an account
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
