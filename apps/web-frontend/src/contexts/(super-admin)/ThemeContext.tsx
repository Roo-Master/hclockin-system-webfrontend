'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'light' 
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
      setTheme(storedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  // Save theme to localStorage and apply to document
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('theme', theme);
      
      // Apply theme to document
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// ─── Theme CSS Variables ─────────────────────────────────────────────────────

export const themeStyles = {
  light: {
    '--bg-primary': '#FFFFFF',
    '--bg-secondary': '#F5F6FA',
    '--bg-tertiary': '#F9FAFB',
    '--text-primary': '#111827',
    '--text-secondary': '#6B7280',
    '--text-tertiary': '#9CA3AF',
    '--border-color': '#E5E7EB',
    '--shadow-color': 'rgba(0,0,0,0.1)',
  },
  dark: {
    '--bg-primary': '#1F2937',
    '--bg-secondary': '#111827',
    '--bg-tertiary': '#374151',
    '--text-primary': '#F9FAFB',
    '--text-secondary': '#D1D5DB',
    '--text-tertiary': '#9CA3AF',
    '--border-color': '#374151',
    '--shadow-color': 'rgba(0,0,0,0.3)',
  },
} as const;
