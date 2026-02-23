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

// All CSS custom properties that presets might have set — clear stale inline overrides
const ALL_THEME_KEYS = [
  "primary", "ring", "border", "input",
  "sidebar-primary", "sidebar-border",
  "gradient-start", "gradient-end",
  "background", "card", "popover", "muted",
  "sidebar-background", "sidebar-accent",
];

function clearInlineThemeVars() {
  for (const key of ALL_THEME_KEYS) {
    document.documentElement.style.removeProperty(`--${key}`);
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

    clearInlineThemeVars();
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
