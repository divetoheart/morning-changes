import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeName = 'dark' | 'light' | 'student' | 'bluesy' | 'vintage';

type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'morning-changes.theme.v1';
const browserColors: Record<ThemeName, string> = {
  dark: '#090806',
  light: '#f8f6f1',
  student: '#f9f8f3',
  bluesy: '#111a31',
  vintage: '#1a0d07'
};

function storedTheme(): ThemeName {
  const value = window.localStorage.getItem(STORAGE_KEY);
  if (value === 'dark' || value === 'light' || value === 'student' || value === 'bluesy' || value === 'vintage') return value;
  return 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>(storedTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === 'light' || theme === 'student' ? 'light' : 'dark';
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', browserColors[theme]);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('Theme controls must be used inside ThemeProvider.');
  return context;
}
