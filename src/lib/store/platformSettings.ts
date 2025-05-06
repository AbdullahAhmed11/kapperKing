import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Define the shape of the settings data
// Match this closely with the Zod schema in PlatformSettings.tsx
export interface PlatformSettingsData {
  platformName: string;
  supportEmail: string;
  defaultCurrency: string;
  defaultLanguage: string;
  defaultTimezone: string;
  // trialDuration: number; // Removed
  // Removed file upload settings
  // maxFileSize: number;
  // allowedFileTypes: string;
  emailSettings: {
    fromName: string;
    fromEmail: string;
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword?: string; // Password might be sensitive, consider storing securely if real
  };
  security: {
    passwordMinLength: number;
    sessionTimeout: number;
    maxLoginAttempts: number;
  };
  socialLinks: { // Added social links object
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  stripeConfig: { // Added Stripe config
    publishableKey: string;
    secretKey: string; // Note: Store securely, consider masking in UI
    webhookSecret: string;
  };
}

interface PlatformSettingsState {
  settings: PlatformSettingsData;
  setSettings: (newSettings: PlatformSettingsData) => void;
  updateSettings: (updatedSettings: Partial<PlatformSettingsData>) => void;
}

// Define initial default values (can be overridden by persisted state)
const defaultSettings: PlatformSettingsData = {
  platformName: 'KapperKing',
  supportEmail: 'support@kapperking.com',
  defaultCurrency: 'EUR',
  defaultLanguage: 'en',
  defaultTimezone: 'Europe/Amsterdam',
  // trialDuration: 14, // Removed
  emailSettings: {
    fromName: 'KapperKing',
    fromEmail: 'noreply@kapperking.com',
    smtpHost: '', // Default to empty for real setup
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '', // Default to empty
  },
  security: {
    passwordMinLength: 8,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
  },
  socialLinks: { // Added default social links (empty or placeholders)
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
  },
  stripeConfig: { // Added default Stripe config (empty)
    publishableKey: '',
    secretKey: '',
    webhookSecret: '',
  },
};

export const usePlatformSettingsStore = create<PlatformSettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      setSettings: (newSettings) => set({ settings: newSettings }),
      updateSettings: (updatedSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...updatedSettings },
        })),
    }),
    {
      name: 'kapperking-platform-settings', // localStorage key
      storage: createJSONStorage(() => localStorage), 
    }
  )
);

// Selector to get all settings
export const selectPlatformSettings = (state: PlatformSettingsState) => state.settings;