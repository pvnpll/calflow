// Shared auth page shell — keeps login / signup / forgot / reset visually identical
// and aligned with the dashboard + profile Card system.
import { UtensilsCrossed, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from 'cn';

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-2.5 sm:gap-4">
      <Card className="overflow-hidden rounded-3xl border-border/60 bg-card/80 shadow-2xl shadow-black/[0.04] backdrop-blur-xl dark:bg-zinc-950/80 dark:shadow-black/40 dark:ring-1 dark:ring-white/10">
        <CardHeader className="space-y-0 px-5 pb-1 pt-5 sm:px-8 sm:pt-8">
          {/* Single centered brand + title header — always the CalFlow logo */}
          <div className="flex flex-col items-center gap-2 text-center sm:gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20 ring-1 ring-white/20 sm:h-12 sm:w-12 dark:from-white dark:to-white/60 dark:shadow-white/10">
              <UtensilsCrossed className="h-4 w-4 text-primary-foreground sm:h-5 sm:w-5 dark:text-black" />
            </span>
            <div className="space-y-0.5">
              <CardTitle className="text-xl font-semibold leading-tight tracking-tight sm:text-[22px]">
                {title}
              </CardTitle>
              <CardDescription className="text-sm leading-snug sm:text-[15px]">
                {description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-3.5 sm:px-8 sm:pb-8 sm:pt-5">{children}</CardContent>
        {footer ? (
          <div className="border-t border-border/60 bg-muted/40 px-5 py-3.5 text-center text-[13px] text-muted-foreground sm:py-5 sm:text-[14px] dark:border-white/[0.06] dark:bg-white/[0.02]">
            {footer}
          </div>
        ) : null}
      </Card>

      <p className="hidden text-center text-xs font-medium tracking-wide text-muted-foreground/80 sm:block">
        AI-first personal nutrition tracking
      </p>
    </div>
  );
}

export function AuthError({ message, className }: { message: string; className?: string }) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2.5 rounded-2xl border border-destructive/20 bg-destructive/[0.06] px-4 py-3 text-sm font-medium leading-relaxed text-destructive dark:bg-destructive/10',
        className
      )}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function AuthSuccess({ message, className }: { message: string; className?: string }) {
  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-3 text-sm font-medium leading-relaxed text-emerald-700 dark:text-emerald-300',
        className
      )}
    >
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

