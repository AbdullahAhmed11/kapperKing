import React, { createContext, useContext, useEffect } from 'react';
import { useThemeStore, Theme } from '../lib/theme';

// --- Helper Function: Hex to HSL ---
// Basic conversion, might need refinement for edge cases or alpha
function hexToHsl(hex: string): string | null {
  if (!hex || !hex.startsWith('#')) return null;
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) { // #RGB format
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) { // #RRGGBB format
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  } else {
    return null; // Invalid format
  }

  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  // Format as HSL string "H S% L%" (degrees for H, percentages for S, L)
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  return `${h} ${s}% ${l}%`;
}


interface ThemeContextType {
  theme: Theme;
  updateThemeProperty: (property: keyof Theme, value: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Subscribe directly to the specific properties needed for CSS variables
  const primaryColor = useThemeStore((state) => state.currentTheme.primaryColor);
  const secondaryColor = useThemeStore((state) => state.currentTheme.secondaryColor);
  const accentColor = useThemeStore((state) => state.currentTheme.accentColor);
  const headingFont = useThemeStore((state) => state.currentTheme.headingFont);
  const bodyFont = useThemeStore((state) => state.currentTheme.bodyFont);
  const dashboardButtonTextColor = useThemeStore((state) => state.currentTheme.dashboardButtonTextColor);
  const marketingButtonTextColor = useThemeStore((state) => state.currentTheme.marketingButtonTextColor);
  const marketingBodyTextColor = useThemeStore((state) => state.currentTheme.marketingBodyTextColor);
  // Get the full theme and update function for the legacy context (if still needed)
  const theme = useThemeStore((state) => state.currentTheme);
  const updateThemeProperty = useThemeStore((state) => state.updateThemeProperty);


  useEffect(() => {
    const root = document.documentElement;
    console.log("ThemeProvider applying theme:", { primaryColor, secondaryColor, accentColor, headingFont, bodyFont });

    // Convert hex colors to HSL strings for Shadcn variables
    const primaryHsl = hexToHsl(primaryColor);
    const secondaryHsl = hexToHsl(secondaryColor);
    const accentHsl = hexToHsl(accentColor);

    // Set Shadcn CSS variables
    if (primaryHsl) root.style.setProperty('--primary', primaryHsl);
    if (secondaryHsl) root.style.setProperty('--secondary', secondaryHsl);
    if (accentHsl) root.style.setProperty('--accent', accentHsl);
    
    // Set font variables (Tailwind uses these directly)
    root.style.setProperty('--font-heading', headingFont);
    root.style.setProperty('--font-body', bodyFont);

    // Set text color variables
    root.style.setProperty('--dashboard-button-text-color', dashboardButtonTextColor);
    root.style.setProperty('--marketing-button-text-color', marketingButtonTextColor);
    root.style.setProperty('--marketing-body-text-color', marketingBodyTextColor);

  }, [
    primaryColor,
    secondaryColor,
    accentColor,
    headingFont,
    bodyFont,
    dashboardButtonTextColor,
    marketingButtonTextColor,
    marketingBodyTextColor
  ]); // Depend on individual properties

  // Provide legacy context if needed, but primary application is via CSS vars
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