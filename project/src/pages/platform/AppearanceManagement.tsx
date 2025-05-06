import React from 'react';
import { Palette, Layout, Image, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useThemeStore } from '@/lib/theme';
import { toast } from 'sonner'; // Import toast

export default function AppearanceManagement() {
  const { currentTheme: theme, updateThemeProperty } = useThemeStore();

  const handleColorChange = (property: keyof typeof theme, value: string) => {
    // Basic hex color validation (optional)
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      updateThemeProperty(property, value);
    }
  };

  const handleSaveChanges = () => {
    // Persistence is handled by Zustand middleware,
    // so we just show a notification here.
    toast.success("Appearance settings saved successfully!");
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Appearance</h1>
          <p className="mt-1 text-sm text-gray-500">Customize your platform's look and feel</p>
        </div>
        <Button onClick={handleSaveChanges}>Save Changes</Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Theme Colors */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <Palette className="h-6 w-6 text-gray-400" />
              <h2 className="ml-3 text-lg font-medium text-gray-900">Theme Colors</h2>
            </div>
            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <Input
                    type="color"
                    id="primaryColor"
                    value={theme.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="w-12 p-1 rounded-l-md border-r-0"
                  />
                  <Input
                    type="text"
                    value={theme.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="flex-1 rounded-l-none"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <Input
                    type="color"
                    id="secondaryColor"
                    value={theme.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="w-12 p-1 rounded-l-md border-r-0"
                  />
                  <Input
                    type="text"
                    value={theme.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="flex-1 rounded-l-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <Type className="h-6 w-6 text-gray-400" />
              <h2 className="ml-3 text-lg font-medium text-gray-900">Typography</h2>
            </div>
            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="headingFont">Heading Font</Label>
                <select
                  id="headingFont"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option>Inter</option>
                  <option>Roboto</option>
                  <option>Open Sans</option>
                </select>
              </div>
              <div>
                <Label htmlFor="bodyFont">Body Font</Label>
                <select
                  id="bodyFont"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option>Inter</option>
                  <option>Roboto</option>
                  <option>Open Sans</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <Layout className="h-6 w-6 text-gray-400" />
              <h2 className="ml-3 text-lg font-medium text-gray-900">Layout</h2>
            </div>
            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="containerWidth">Container Width</Label>
                <select
                  id="containerWidth"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option>Default (1280px)</option>
                  <option>Wide (1440px)</option>
                  <option>Narrow (1024px)</option>
                </select>
              </div>
              <div>
                <Label htmlFor="spacing">Element Spacing</Label>
                <select
                  id="spacing"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option>Default</option>
                  <option>Compact</option>
                  <option>Relaxed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Logo & Branding */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <Image className="h-6 w-6 text-gray-400" />
              <h2 className="ml-3 text-lg font-medium text-gray-900">Logo & Branding</h2>
            </div>
            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="logo">Logo</Label>
                <div className="mt-1 flex items-center">
                  <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Image className="h-6 w-6 text-gray-400" />
                  </div>
                  <Button variant="outline" className="ml-4">
                    Change Logo
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="favicon">Favicon</Label>
                <div className="mt-1 flex items-center">
                  <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Image className="h-4 w-4 text-gray-400" />
                  </div>
                  <Button variant="outline" className="ml-4">
                    Change Favicon
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}