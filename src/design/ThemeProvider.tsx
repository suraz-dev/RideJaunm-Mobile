import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { themes, ThemeMode, ThemeColors, primitive } from './tokens';

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
  primitive: typeof primitive;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialMode?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialMode = 'night',
}) => {
  const [mode, setMode] = useState<ThemeMode>(initialMode);

  const value = useMemo<ThemeContextValue>(() => {
    const currentColors = themes[mode] || themes.night;
    const isDark = mode !== 'dayGlare';
    return {
      mode,
      colors: currentColors,
      setMode,
      isDark,
      primitive,
    };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
