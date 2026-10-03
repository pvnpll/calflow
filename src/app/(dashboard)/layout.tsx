'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import {
  Home,
  UtensilsCrossed,
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
    <div className="flex h-screen overflow-hidden bg-muted/20">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-background md:flex">
        <div className="flex h-16 items-center justify-between border-b px-6">
          <span className="text-xl font-bold tracking-tight">CalFlow</span>
          <ThemeToggle />
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors w-full ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </button>
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
        {/* Mobile Top Header */}
        <div className="flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
          <span className="text-lg font-bold tracking-tight">CalFlow</span>
          <ThemeToggle />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 z-50 flex h-16 w-full items-center justify-around border-t bg-background px-2 pb-safe md:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center justify-center space-y-1 rounded-md px-2 py-1 ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className={`h-6 w-6 ${isActive ? 'fill-primary/20' : ''}`} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
