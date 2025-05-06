import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Theme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: string;
  logoUrl: string; // Add logo URL
  faviconUrl: string;
  headingFont: string;
  bodyFont: string;
  dashboardSidebarColor: string;
  dashboardLogoUrl: string;
  dashboardSidebarTextColor: string;
  // Marketing Header Settings
  marketingHeaderBgType: 'color' | 'image';
  marketingHeaderBgColor: string;
  marketingHeaderBgImageUrl: string;
  marketingHeaderTextColor: string;
  // Additional Text Colors
  dashboardButtonTextColor: string;
  marketingButtonTextColor: string;
  marketingBodyTextColor: string;
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
        logoUrl: '/logos/marketing-logo.png', // Use new marketing logo path
        faviconUrl: '', // Default to empty string, rely on index.html link
        headingFont: 'Inter, sans-serif',
        bodyFont: 'Inter, sans-serif',
        dashboardSidebarColor: '#1F2937',
        dashboardLogoUrl: '/logos/dashboard-logo.png',
        dashboardSidebarTextColor: '#D1D5DB',
        // Marketing Header Defaults
        marketingHeaderBgType: 'color',
        marketingHeaderBgColor: '#6B46C1',
        marketingHeaderBgImageUrl: '',
        marketingHeaderTextColor: '#FFFFFF',
        // Additional Text Color Defaults
        dashboardButtonTextColor: '#FFFFFF', // Default white for dark sidebar
        marketingButtonTextColor: '#FFFFFF', // Default white for primary buttons
        marketingBodyTextColor: '#374151', // Default gray-700
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