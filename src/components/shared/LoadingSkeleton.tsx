import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="flex justify-center py-6">
        <Skeleton className="h-48 w-48 rounded-full" />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4 space-y-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-2 w-full" />
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-12 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </Card>
        <Card className="p-4 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </Card>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <Card className="p-4 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-2 w-full" />
    </Card>
  );
}

/** Title + subtitle row used by most pages. */
function PageHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-72 max-w-full" />
    </div>
  );
}

// Route-level fallbacks (loading.tsx): shown instantly on navigation, before the page's own data loads.
// Layouts mirror each page's first paint so the swap doesn't jump.

export function MealsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <PageHeaderSkeleton />
        <Skeleton className="h-8 w-44 shrink-0" />
      </div>
      <div className="space-y-8">
        {[0, 1].map((s) => (
          <div key={s} className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function InsightsSkeleton() {
  return (
    <div className="container mx-auto max-w-5xl space-y-8 p-4 pb-24">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-[130px]" />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <Skeleton className="h-72 w-full rounded-xl" />
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="relative flex min-h-full w-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b p-3 md:p-4">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-7 w-20" />
      </div>
      <div className="flex flex-1 flex-col space-y-6 p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <Skeleton className="h-16 w-3/4 max-w-md rounded-xl" />
        </div>
      </div>
      <div className="mt-auto shrink-0 border-t p-4 md:p-6">
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

/** Generic stacked-cards page: Profile, Connect, Weight. */
export function CardsPageSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      {[0, 1].map((i) => (
        <Card key={i} className="space-y-4 p-5">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64 max-w-full" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((j) => (
              <Skeleton key={j} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
