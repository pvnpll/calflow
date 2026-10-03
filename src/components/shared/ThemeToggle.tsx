'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={`h-9 w-9 p-0 rounded-lg transition-colors border ${className || ''}`}
        aria-label="Toggle theme"
      >
        <div className="h-4 w-4" />
      </Button>
    );
  }

  const currentTheme = theme === 'system' ? resolvedTheme : theme;
  const toggleTheme = () => {
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className={`h-9 w-9 p-0 rounded-lg transition-colors border ${className || ''}`}
      aria-label="Toggle theme"
      title={currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {currentTheme === 'dark' ? (
        <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700 transition-transform hover:-rotate-12" />
      )}
    </Button>
  );
}
