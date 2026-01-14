import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

type Theme = 'light' | 'dark';
type ThemeColor = 'bubblegum' | 'electric' | 'minty' | 'sky' | 'coral' | 'lavender' | 'peach' | 'rose';

interface ThemeContextType {
  theme: Theme;
  themeColor: ThemeColor;
  setTheme: (theme: Theme) => void;
  setThemeColor: (color: ThemeColor, persist?: boolean) => void;
  toggleTheme: () => void;
  previewThemeColor: (color: ThemeColor | null) => void;
  syncFromProfile: (color: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_COLORS: ThemeColor[] = ['bubblegum', 'electric', 'minty', 'sky', 'coral', 'lavender', 'peach', 'rose'];

function isValidThemeColor(color: string | null): color is ThemeColor {
  return color !== null && THEME_COLORS.includes(color as ThemeColor);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme') as Theme;
      if (stored) return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [themeColor, setThemeColorState] = useState<ThemeColor>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('themeColor') as ThemeColor;
      if (stored && THEME_COLORS.includes(stored)) return stored;
    }
    return 'bubblegum';
  });

  const [previewColor, setPreviewColor] = useState<ThemeColor | null>(null);

  // Apply theme (light/dark) to document + body + #root
  useEffect(() => {
    const rootEl = document.getElementById('root');
    const targets = [document.documentElement, document.body, rootEl].filter(Boolean) as HTMLElement[];

    targets.forEach((el) => {
      if (theme === 'dark') {
        el.classList.add('dark');
      } else {
        el.classList.remove('dark');
      }
    });

    localStorage.setItem('theme', theme);
  }, [theme]);

  // Apply theme color to document + body + #root (so borders/background/buttons update everywhere)
  useEffect(() => {
    const rootEl = document.getElementById('root');
    const targets = [document.documentElement, document.body, rootEl].filter(Boolean) as HTMLElement[];
    const colorToApply = previewColor || themeColor;

    targets.forEach((el) => {
      // Remove all theme color classes
      THEME_COLORS.forEach((color) => {
        el.classList.remove(`theme-${color}`);
      });

      // Add the current theme color class
      el.classList.add(`theme-${colorToApply}`);
    });

    if (!previewColor) {
      localStorage.setItem('themeColor', themeColor);
    }
  }, [themeColor, previewColor]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setThemeColor = useCallback((color: ThemeColor, persist = true) => {
    setThemeColorState(color);
    setPreviewColor(null);
    if (persist) {
      localStorage.setItem('themeColor', color);
    }
  }, []);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const previewThemeColor = useCallback((color: ThemeColor | null) => {
    setPreviewColor(color);
  }, []);

  // Sync theme from profile data (called when profile loads from DB)
  const syncFromProfile = useCallback((color: string | null) => {
    if (isValidThemeColor(color)) {
      setThemeColorState(color);
      localStorage.setItem('themeColor', color);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      themeColor,
      setTheme, 
      setThemeColor,
      toggleTheme,
      previewThemeColor,
      syncFromProfile,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}