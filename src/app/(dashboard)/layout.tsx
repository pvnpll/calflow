'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import {
  Home,
  UtensilsCrossed,
  Utensils,
  BarChart3,
  MessageSquare,
  User as UserIcon,
  LogOut,
  Plug,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { ThemeToggle } from '@/components/shared/ThemeToggle';

const navItems = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Meals', href: '/meals', icon: UtensilsCrossed },
  { name: 'Insights', href: '/insights', icon: BarChart3 },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Connect', href: '/connect', icon: Plug },
  { name: 'Profile', href: '/profile', icon: UserIcon },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  const getSupabase = useCallback(() => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }, []);

  useEffect(() => {
    const supabase = getSupabase();

    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push('/login');
      } else {
        setUser(user);
      }
    };
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
          router.push('/login');
        } else if (session?.user) {
          setUser(session.user);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [getSupabase, router]);

  const handleLogout = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="relative flex min-h-[100dvh] bg-muted/20">
      {/* Subtle backdrop matching auth pages */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primary/[0.07] blur-3xl" />
        <div className="absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-primary/[0.05] blur-3xl" />
        <div className="absolute -bottom-40 -right-24 h-80 w-80 rounded-full bg-primary/[0.05] blur-3xl" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="sticky top-0 z-10 hidden h-[100dvh] w-64 flex-col border-r bg-background/60 backdrop-blur-md md:flex shrink-0">
        <div className="flex h-16 items-center justify-between border-b px-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-md">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">CalFlow</span>
          </div>
          <ThemeToggle />
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all active:scale-95 w-full ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t p-4">
          <div className="flex items-center gap-3 mb-4 px-2">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium truncate max-w-[130px]">
                {user?.user_metadata?.full_name || 'User'}
              </span>
              <span className="text-xs text-muted-foreground truncate max-w-[130px]">
                {user?.email}
              </span>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <main className="relative z-10 flex-1 flex flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 min-w-0">
        <div className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md md:hidden">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1 rounded-md">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight">CalFlow</span>
          </div>
          <ThemeToggle />
        </div>

        <div className="flex-1 relative flex flex-col">
          <div className={`mx-auto max-w-5xl w-full flex-1 flex flex-col ${pathname === '/chat' ? 'p-0' : 'p-4 md:p-6 lg:p-8'}`}>
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 z-50 flex h-[calc(4rem+env(safe-area-inset-bottom))] w-full items-center justify-around border-t bg-background/80 px-2 pb-safe backdrop-blur-md md:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 rounded-md px-1 py-1 transition-all active:scale-95 ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'fill-primary/20' : ''}`} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
