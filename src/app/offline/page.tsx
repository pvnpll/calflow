import Link from 'next/link';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';

export const metadata = {
  title: 'Offline | CalFlow',
};

export default function OfflinePage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <WifiOff className="h-10 w-10 text-muted-foreground" />
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight">You're offline</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        Your connection is unavailable right now. CalFlow will reconnect when you're back online.
      </p>
      
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className={buttonVariants({ variant: 'default' })}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Link>
      </div>
    </div>
  );
}
