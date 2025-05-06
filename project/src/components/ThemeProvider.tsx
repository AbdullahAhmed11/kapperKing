import React, { createContext, useContext, useEffect } from 'react';
import { useThemeStore, Theme } from '../lib/theme';

interface ThemeContextType {
  theme: Theme;
  updateThemeProperty: (property: keyof Theme, value: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const themeStore = useThemeStore();
  const { currentTheme: theme, updateThemeProperty } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    // Revert to setting direct hex values
    root.style.setProperty('--color-primary', theme.primaryColor);
    root.style.setProperty('--color-secondary', theme.secondaryColor);
    root.style.setProperty('--color-accent', theme.accentColor);
    root.style.setProperty('--font-family', theme.fontFamily);
    // root.style.setProperty('--font-size', theme.fontSize); // Still likely not needed
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, updateThemeProperty }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};