'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

export default function ThemeToggle({
  className = '',
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    const prefersDark = typeof window !== 'undefined'
      && window.matchMedia
      && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = (stored as Theme) || (prefersDark ? 'dark' : 'light');
    setTheme(initial);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', initial === 'dark');
    }
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', next === 'dark');
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', next);
    }
  };

  const label = theme === 'dark' ? 'Light Mode' : 'Dark Mode';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors border border-white/40 bg-white/20 text-white hover:bg-white/30 ${className}`}
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      {showLabel && <span className="text-xs">{label}</span>}
    </button>
  );
}
