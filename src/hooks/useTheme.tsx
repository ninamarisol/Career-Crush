import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";
export type ThemeColor =
  | "bubblegum"
  | "electric"
  | "minty"
  | "sky"
  | "coral"
  | "lavender"
  | "peach"
  | "rose";

type ThemeVars = Record<string, string>;

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

const THEME_COLORS: ThemeColor[] = [
  "bubblegum",
  "electric",
  "minty",
  "sky",
  "coral",
  "lavender",
  "peach",
  "rose",
];

function isValidThemeColor(color: string | null): color is ThemeColor {
  return color !== null && THEME_COLORS.includes(color as ThemeColor);
}

// Deterministic theme mapping (fixes cases where class-based vars don't propagate)
const THEME_PRESETS: Record<ThemeColor, { light: ThemeVars; dark: ThemeVars }> = {
  bubblegum: {
    light: {
      primary: "330 100% 70%",
      ring: "330 100% 70%",
      border: "330 100% 70%",
      input: "330 100% 70%",
      "sidebar-primary": "330 100% 70%",
      "sidebar-border": "330 100% 70%",
      "gradient-start": "330 100% 97%",
      "gradient-end": "330 100% 90%",
    },
    dark: {
      background: "330 30% 8%",
      card: "330 30% 12%",
      popover: "330 30% 12%",
      muted: "330 20% 18%",
      "sidebar-background": "330 30% 10%",
      "sidebar-accent": "330 20% 18%",
      primary: "330 100% 70%",
      ring: "330 100% 70%",
      border: "330 60% 50%",
      input: "330 60% 50%",
      "sidebar-primary": "330 100% 70%",
      "sidebar-border": "330 60% 50%",
      "gradient-start": "330 30% 12%",
      "gradient-end": "330 30% 6%",
    },
  },
  electric: {
    light: {
      primary: "47 100% 55%",
      ring: "47 100% 55%",
      border: "47 100% 55%",
      input: "47 100% 55%",
      "sidebar-primary": "47 100% 55%",
      "sidebar-border": "47 100% 55%",
      "gradient-start": "47 100% 97%",
      "gradient-end": "47 100% 88%",
    },
    dark: {
      background: "47 30% 6%",
      card: "47 30% 10%",
      popover: "47 30% 10%",
      muted: "47 20% 16%",
      "sidebar-background": "47 30% 8%",
      "sidebar-accent": "47 20% 16%",
      primary: "47 100% 55%",
      ring: "47 100% 55%",
      border: "47 60% 45%",
      input: "47 60% 45%",
      "sidebar-primary": "47 100% 55%",
      "sidebar-border": "47 60% 45%",
      "gradient-start": "47 30% 10%",
      "gradient-end": "47 30% 5%",
    },
  },
  minty: {
    light: {
      primary: "160 60% 45%",
      ring: "160 60% 45%",
      border: "160 60% 45%",
      input: "160 60% 45%",
      "sidebar-primary": "160 60% 45%",
      "sidebar-border": "160 60% 45%",
      "gradient-start": "160 60% 97%",
      "gradient-end": "160 60% 88%",
    },
    dark: {
      background: "160 30% 6%",
      card: "160 30% 10%",
      popover: "160 30% 10%",
      muted: "160 20% 16%",
      "sidebar-background": "160 30% 8%",
      "sidebar-accent": "160 20% 16%",
      primary: "160 60% 45%",
      ring: "160 60% 45%",
      border: "160 50% 35%",
      input: "160 50% 35%",
      "sidebar-primary": "160 60% 45%",
      "sidebar-border": "160 50% 35%",
      "gradient-start": "160 30% 10%",
      "gradient-end": "160 30% 5%",
    },
  },
  sky: {
    light: {
      primary: "214 100% 60%",
      ring: "214 100% 60%",
      border: "214 100% 60%",
      input: "214 100% 60%",
      "sidebar-primary": "214 100% 60%",
      "sidebar-border": "214 100% 60%",
      "gradient-start": "214 100% 97%",
      "gradient-end": "214 100% 90%",
    },
    dark: {
      background: "214 30% 8%",
      card: "214 30% 12%",
      popover: "214 30% 12%",
      muted: "214 20% 18%",
      "sidebar-background": "214 30% 10%",
      "sidebar-accent": "214 20% 18%",
      primary: "214 100% 60%",
      ring: "214 100% 60%",
      border: "214 60% 45%",
      input: "214 60% 45%",
      "sidebar-primary": "214 100% 60%",
      "sidebar-border": "214 60% 45%",
      "gradient-start": "214 30% 12%",
      "gradient-end": "214 30% 6%",
    },
  },
  coral: {
    light: {
      primary: "16 100% 65%",
      ring: "16 100% 65%",
      border: "16 100% 65%",
      input: "16 100% 65%",
      "sidebar-primary": "16 100% 65%",
      "sidebar-border": "16 100% 65%",
      "gradient-start": "16 100% 97%",
      "gradient-end": "16 100% 90%",
    },
    dark: {
      background: "16 30% 8%",
      card: "16 30% 12%",
      popover: "16 30% 12%",
      muted: "16 20% 18%",
      "sidebar-background": "16 30% 10%",
      "sidebar-accent": "16 20% 18%",
      primary: "16 100% 65%",
      ring: "16 100% 65%",
      border: "16 60% 50%",
      input: "16 60% 50%",
      "sidebar-primary": "16 100% 65%",
      "sidebar-border": "16 60% 50%",
      "gradient-start": "16 30% 12%",
      "gradient-end": "16 30% 6%",
    },
  },
  lavender: {
    light: {
      primary: "270 70% 65%",
      ring: "270 70% 65%",
      border: "270 70% 65%",
      input: "270 70% 65%",
      "sidebar-primary": "270 70% 65%",
      "sidebar-border": "270 70% 65%",
      "gradient-start": "270 70% 97%",
      "gradient-end": "270 70% 90%",
    },
    dark: {
      background: "270 30% 8%",
      card: "270 30% 12%",
      popover: "270 30% 12%",
      muted: "270 20% 18%",
      "sidebar-background": "270 30% 10%",
      "sidebar-accent": "270 20% 18%",
      primary: "270 70% 65%",
      ring: "270 70% 65%",
      border: "270 50% 50%",
      input: "270 50% 50%",
      "sidebar-primary": "270 70% 65%",
      "sidebar-border": "270 50% 50%",
      "gradient-start": "270 30% 12%",
      "gradient-end": "270 30% 6%",
    },
  },
  peach: {
    light: {
      primary: "30 100% 70%",
      ring: "30 100% 70%",
      border: "30 100% 70%",
      input: "30 100% 70%",
      "sidebar-primary": "30 100% 70%",
      "sidebar-border": "30 100% 70%",
      "gradient-start": "30 100% 97%",
      "gradient-end": "30 100% 90%",
    },
    dark: {
      background: "30 30% 8%",
      card: "30 30% 12%",
      popover: "30 30% 12%",
      muted: "30 20% 18%",
      "sidebar-background": "30 30% 10%",
      "sidebar-accent": "30 20% 18%",
      primary: "30 100% 70%",
      ring: "30 100% 70%",
      border: "30 60% 50%",
      input: "30 60% 50%",
      "sidebar-primary": "30 100% 70%",
      "sidebar-border": "30 60% 50%",
      "gradient-start": "30 30% 12%",
      "gradient-end": "30 30% 6%",
    },
  },
  rose: {
    light: {
      primary: "350 90% 65%",
      ring: "350 90% 65%",
      border: "350 90% 65%",
      input: "350 90% 65%",
      "sidebar-primary": "350 90% 65%",
      "sidebar-border": "350 90% 65%",
      "gradient-start": "350 90% 97%",
      "gradient-end": "350 90% 90%",
    },
    dark: {
      background: "350 30% 8%",
      card: "350 30% 12%",
      popover: "350 30% 12%",
      muted: "350 20% 18%",
      "sidebar-background": "350 30% 10%",
      "sidebar-accent": "350 20% 18%",
      primary: "350 90% 65%",
      ring: "350 90% 65%",
      border: "350 60% 50%",
      input: "350 60% 50%",
      "sidebar-primary": "350 90% 65%",
      "sidebar-border": "350 60% 50%",
      "gradient-start": "350 30% 12%",
      "gradient-end": "350 30% 6%",
    },
  },
};

function applyThemeVars(vars: ThemeVars) {
  for (const [key, value] of Object.entries(vars)) {
    document.documentElement.style.setProperty(`--${key}`, value);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") return stored;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });

  const [themeColor, setThemeColorState] = useState<ThemeColor>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("themeColor");
      if (isValidThemeColor(stored)) return stored;
    }
    return "bubblegum";
  });

  const [previewColor, setPreviewColor] = useState<ThemeColor | null>(null);
  const effectiveColor = useMemo(() => previewColor ?? themeColor, [previewColor, themeColor]);

  // Tailwind dark mode class
  useEffect(() => {
    const rootEl = document.getElementById("root");
    const targets = [document.documentElement, document.body, rootEl].filter(Boolean) as HTMLElement[];

    targets.forEach((el) => {
      if (theme === "dark") el.classList.add("dark");
      else el.classList.remove("dark");
    });

    localStorage.setItem("theme", theme);
  }, [theme]);

  // Theme color vars (this is what drives outlines/buttons/sliders/progress)
  useEffect(() => {
    const rootEl = document.getElementById("root");
    const targets = [document.documentElement, document.body, rootEl].filter(Boolean) as HTMLElement[];

    targets.forEach((el) => {
      THEME_COLORS.forEach((c) => el.classList.remove(`theme-${c}`));
      el.classList.add(`theme-${effectiveColor}`);
    });

    const preset = THEME_PRESETS[effectiveColor];
    applyThemeVars(theme === "dark" ? preset.dark : preset.light);
    document.documentElement.dataset.themeColor = effectiveColor;

    if (!previewColor) localStorage.setItem("themeColor", themeColor);
  }, [theme, themeColor, previewColor, effectiveColor]);

  const setTheme = (newTheme: Theme) => setThemeState(newTheme);

  const setThemeColor = useCallback((color: ThemeColor, persist = true) => {
    setThemeColorState(color);
    setPreviewColor(null);
    if (persist) localStorage.setItem("themeColor", color);
  }, []);

  const toggleTheme = () => setThemeState((prev) => (prev === "light" ? "dark" : "light"));

  const previewThemeColor = useCallback((color: ThemeColor | null) => {
    setPreviewColor(color);
  }, []);

  const syncFromProfile = useCallback((color: string | null) => {
    if (isValidThemeColor(color)) {
      setThemeColorState(color);
      localStorage.setItem("themeColor", color);
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeColor,
        setTheme,
        setThemeColor,
        toggleTheme,
        previewThemeColor,
        syncFromProfile,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
