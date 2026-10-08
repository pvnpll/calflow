// Shared auth page shell — keeps login / signup / forgot / reset visually identical
// and aligned with the dashboard + profile Card system.
import Link from 'next/link';
import { UtensilsCrossed } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AuthShell({
  title,
  description,
  icon,
  children,
  footer,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-5">
      <Link href="/login" className="mx-auto flex items-center gap-2.5 transition-all active:scale-95" aria-label="CalFlow home">
        <span className="rounded-full bg-primary/10 p-2.5">
          <UtensilsCrossed className="h-5 w-5 text-primary" />
        </span>
        <span className="text-2xl font-bold tracking-tight">CalFlow</span>
      </Link>

      <Card className="shadow-sm bg-background/60 backdrop-blur-xl border-white/10 dark:border-white/5">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            {icon ? (
              <span className="rounded-full bg-primary/10 p-2">{icon}</span>
            ) : null}
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
        {footer ? (
          <div className="border-t px-6 py-4 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        ) : null}
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        AI-first personal nutrition tracking
      </p>
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-destructive/25 bg-destructive/[0.06] px-4 py-3 text-sm font-medium leading-relaxed text-destructive">
      {message}
    </div>
  );
}

export function AuthSuccess({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.07] px-4 py-3 text-sm font-medium leading-relaxed text-emerald-700 dark:text-emerald-300">
      {message}
    </div>
  );
}
