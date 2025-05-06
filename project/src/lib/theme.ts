import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Theme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: string;
  // Add other theme properties here as needed
}

interface ThemeState {
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
  updateThemeProperty: (property: keyof Theme, value: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      currentTheme: {
        primaryColor: '#6B46C1', // Default Purple
        secondaryColor: '#E84393', // Default Pink
        accentColor: '#F97316', // Default Orange
        fontFamily: 'Inter, sans-serif',
        fontSize: 'medium',
        // Add other default theme values here
      },
      setTheme: (theme) => set({ currentTheme: theme }),
      updateThemeProperty: (property, value) =>
        set((state) => ({
          currentTheme: {
            ...state.currentTheme,
            [property]: value,
          },
        })),
    }),
    {
      name: 'kapperking-theme-storage', // Name of the item in storage
      storage: createJSONStorage(() => localStorage), // Use localStorage
    }
  )
);