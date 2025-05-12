import React, { useRef, useState, useEffect } from 'react';
import { Palette, Image, Type, Layout as LayoutIcon, Paintbrush } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner'; 
import { supabase } from '@/lib/supabase';
import axios from 'axios';

interface ColorPalette {
  id: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  marketingBodyText: string;
  dashboardSidebarText: string;
  dashboardButtonText: string;
  dashboardSidebarBG: string;
  marketingButtonText: string;
}

interface MarketingPageHeader {
  id: number;
  background: string;
  type: 'Color' | 'Image';
  headerTextColor: string;
}

interface BrandingData {
  logoUrl: string;
  faviconUrl: string;
  dashboardLogoUrl: string;
  sideBarLogo: string;
  headingFont: string;
  bodyFont: string;
  logo: string;
  favIcon: string;
  colorPalette?: ColorPalette;
  marketingHeader?: MarketingPageHeader;
  marketingHeaderBgImageUrl?: string; 
}

type UploadableThemeProperty = 'logoUrl' | 'faviconUrl' | 'dashboardLogoUrl' | 'marketingHeaderBgImageUrl';

const ColorInputGroup: React.FC<{
  label: string;
  id: string;
  value: string;
  onChange: (property: string, value: string) => void;
  disabled?: boolean;
}> = ({ label, id, value, onChange, disabled }) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    <div className="mt-1 flex rounded-md shadow-sm">
      <Input
        type="color"
        id={id}
        value={value || ''}
        onChange={(e) => {
          if (id === 'marketingHeaderBgImageUrl') {
            console.warn(`Invalid property: ${id}`);
          } else {
            onChange(id as keyof BrandingData, e.target.value);
          }
        }}
        className="w-12 h-10 p-1 rounded-l-md border-r-0" 
        disabled={disabled}
      />
      <Input
        type="text"
        value={value || ''}
        onChange={(e) => {
          if (id === 'marketingHeaderBgImageUrl') {
            console.warn(`Invalid property: ${id}`);
          } else {
            onChange(id as keyof BrandingData, e.target.value);
          }
        }}
        className="flex-1 rounded-l-none h-10" 
        placeholder="#RRGGBB"
        disabled={disabled}
      />
    </div>
  </div>
);

const UrlUploadGroup: React.FC<{
  label: string;
  id: UploadableThemeProperty; 
  value: string;
  onChange: (property: keyof BrandingData, value: string) => void;
  onUploadClick: () => void;
  isUploading: boolean;
  uploadingProperty: UploadableThemeProperty | null;
  previewSrc?: string;
  alt: string;
  previewClassName?: string;
}> = ({ label, id, value, onChange, onUploadClick, isUploading, uploadingProperty, previewSrc, alt, previewClassName }) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    <div className="mt-1 flex items-center space-x-3">
      {previewSrc && (
        <img 
          src={value || previewSrc} 
          alt={alt} 
          className={`bg-gray-100 p-1 rounded ${previewClassName || 'h-10 w-auto'}`} 
        />
      )}
      <Input
        id={id}
        type="text"
        value={value || ''} 
        onChange={(e) => onChange(id, e.target.value)} 
        placeholder={`Enter ${label}`}
        className="flex-1 h-10" 
        disabled={isUploading}
      />
      <Button 
        variant="outline" 
        onClick={onUploadClick}
        disabled={isUploading}
        className="h-10" 
      >
        {uploadingProperty === id ? 'Uploading...' : 'Upload'}
      </Button>
    </div>
  </div>
);

export default function AppearanceManagement() {
  const [branding, setBranding] = useState<BrandingData | null>(null);
  const [colorPalette, setColorPalette] = useState<ColorPalette | null>(null);
  const [marketingHeader, setMarketingHeader] = useState<MarketingPageHeader | null>(null);
  const [isUploading, setIsUploading] = useState<UploadableThemeProperty | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [brandingUploading, setBrandingUploading] = useState(false);
  
  // Refs for hidden file inputs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const dashboardLogoInputRef = useRef<HTMLInputElement>(null);
  const marketingHeaderImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [brandingResponse, paletteResponse, headerResponse] = await Promise.all([
          fetch('https://kapperking.runasp.net/api/SuperAdmin/GetBranding'),
          fetch('https://kapperking.runasp.net/api/SuperAdmin/GetColorPalette'),
          fetch('https://kapperking.runasp.net/api/SuperAdmin/GetMarketingPageHeader')
        ]);

        if (!brandingResponse.ok || !paletteResponse.ok || !headerResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const brandingData = await brandingResponse.json();
        const paletteData = await paletteResponse.json();
        const headerData = await headerResponse.json();

        setBranding(brandingData);
        setColorPalette(paletteData);
        setMarketingHeader(headerData);

      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleColorPaletteChange = (property: keyof ColorPalette, value: string) => {
    if (value === '' || /^#[0-9A-F]{6}$/i.test(value)) {
      setColorPalette(prev => prev ? {...prev, [property]: value} : null);
    } else {
      console.warn("Invalid hex color format:", value);
    }
  };

  const handleMarketingHeaderChange = (property: keyof MarketingPageHeader, value: string) => {
    setMarketingHeader(prev => prev ? {...prev, [property]: value} : null);
  };

  const handleBrandingChange = (property: keyof BrandingData, value: string) => {
    setBranding(prev => prev ? {...prev, [property]: value} : null);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>, 
    propertyToUpdate: UploadableThemeProperty
  ) => {
    const file = event.target.files?.[0];
    if (!file || !branding) return;

    setIsUploading(propertyToUpdate); 
    toast.info(`Uploading ${propertyToUpdate}...`);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${propertyToUpdate}-${Date.now()}.${fileExt}`;
      const filePath = fileName; 

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('branding-assets')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('branding-assets') 
        .getPublicUrl(filePath);
      
      if (!urlData?.publicUrl) throw new Error("Could not get public URL.");

      if (propertyToUpdate === 'marketingHeaderBgImageUrl') {
        setMarketingHeader(prev => prev ? {...prev, background: urlData.publicUrl} : null);
      } else {
        setBranding(prev => prev ? {...prev, [propertyToUpdate]: urlData.publicUrl} : null);
      }

      toast.success(`${propertyToUpdate} uploaded successfully!`);

    } catch (error: any) {
      console.error(`Error uploading ${propertyToUpdate}:`, error);
      toast.error(`Failed to upload ${propertyToUpdate}: ${error.message}`);
    } finally {
      setIsUploading(null); 
      if (event.target) event.target.value = ''; 
    }
  };

  const triggerFileInput = (ref: React.RefObject<HTMLInputElement>) => {
    ref.current?.click();
  };

  const handleSaveBranding = async () => {
    if (!branding) return;
    
    try {
      setBrandingUploading(true);
      
      const formData = new FormData();
      
      // Append files if they exist in the refs
      if (logoInputRef.current?.files?.[0]) {
        formData.append('logo', logoInputRef.current.files[0]);
      }
      if (faviconInputRef.current?.files?.[0]) {
        formData.append('favIcon', faviconInputRef.current.files[0]);
      }
      if (dashboardLogoInputRef.current?.files?.[0]) {
        formData.append('sideBarLogo', dashboardLogoInputRef.current.files[0]);
      }
      
      // Append other branding data
      formData.append('headingFont', branding.headingFont);
      formData.append('bodyFont', branding.bodyFont);
      
      const response = await fetch('https://kapperking.runasp.net/api/SuperAdmin/AddOrEditBranding', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to save branding');
      }
      
      const result = await response.json();
      toast.success("Branding saved successfully!");
      
      // Update local state with new URLs if returned
      if (result.logoUrl) {
        setBranding(prev => prev ? {...prev, logo: result.logoUrl} : null);
      }
      if (result.favIconUrl) {
        setBranding(prev => prev ? {...prev, favIcon: result.favIconUrl} : null);
      }
      if (result.sideBarLogoUrl) {
        setBranding(prev => prev ? {...prev, sideBarLogo: result.sideBarLogoUrl} : null);
      }
      
    } catch (error) {
      console.error('Error saving branding:', error);
      toast.error('Failed to save branding');
    } finally {
      setBrandingUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const [brandingResponse, paletteResponse, headerResponse] = await Promise.all([
        fetch('https://kapperking.runasp.net/api/SuperAdmin/UpdateBranding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(branding),
        }),
        fetch('https://kapperking.runasp.net/api/SuperAdmin/UpdateColorPalette', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(colorPalette),
        }),
        fetch('https://kapperking.runasp.net/api/SuperAdmin/UpdateMarketingPageHeader', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(marketingHeader),
        })
      ]);

      if (!brandingResponse.ok || !paletteResponse.ok || !headerResponse.ok) {
        throw new Error('Failed to save some settings');
      }

      toast.success("All settings saved successfully!");
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading settings...</div>;
  }

  if (!branding || !colorPalette || !marketingHeader) {
    return <div className="flex justify-center items-center h-64">Failed to load settings</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Appearance</h1>
          <p className="mt-1 text-sm text-gray-500">Customize your platform's look and feel</p>
        </div>
        <Button onClick={handleSaveChanges} disabled={!!isUploading || brandingUploading}>
          {isUploading ? 'Uploading...' : 'Save All Changes'}
        </Button>
      </div>

      {/* Two-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> 
        
        {/* Left Column */}
        <div className="space-y-6">
          {/* Branding Section */}
          <div className="space-y-6 p-6 bg-white shadow rounded-lg border">
            <div className="flex items-center mb-4">
              <Image className="h-6 w-6 text-gray-500" />
              <h2 className="ml-3 text-xl font-semibold text-gray-900">Branding</h2>
            </div>
            
            <input 
              type="file" 
              ref={logoInputRef} 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setBranding(prev => prev ? {...prev, logo: URL.createObjectURL(file)} : null);
                }
              }} 
              hidden 
              accept="image/png, image/jpeg, image/svg+xml, image/webp" 
            />
            <input 
              type="file" 
              ref={faviconInputRef} 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setBranding(prev => prev ? {...prev, favIcon: URL.createObjectURL(file)} : null);
                }
              }} 
              hidden 
              accept="image/x-icon, image/png, image/svg+xml" 
            />
            <input 
              type="file" 
              ref={dashboardLogoInputRef} 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setBranding(prev => prev ? {...prev, sideBarLogo: URL.createObjectURL(file)} : null);
                }
              }} 
              hidden 
              accept="image/png, image/jpeg, image/svg+xml, image/webp" 
            />
            
            <UrlUploadGroup
              label="Marketing Logo"
              id="logoUrl"
              value={branding.logo}
              onChange={handleBrandingChange}
              onUploadClick={() => triggerFileInput(logoInputRef)}
              isUploading={isUploading === 'logoUrl'}
              uploadingProperty={isUploading}
              previewSrc={branding.logo || "/logos/marketing-logo.png"}
              alt="Marketing Logo Preview"
              previewClassName="h-10 w-auto"
            />
            
            <UrlUploadGroup
              label="Favicon"
              id="faviconUrl"
              value={branding.favIcon}
              onChange={handleBrandingChange}
              onUploadClick={() => triggerFileInput(faviconInputRef)}
              isUploading={isUploading === 'faviconUrl'}
              uploadingProperty={isUploading}
              previewSrc={branding.favIcon || "/favicon.ico"}
              alt="Favicon Preview"
              previewClassName="h-6 w-6"
            />
            
            <UrlUploadGroup
              label="Dashboard Sidebar Logo"
              id="dashboardLogoUrl"
              value={branding.sideBarLogo}
              onChange={handleBrandingChange}
              onUploadClick={() => triggerFileInput(dashboardLogoInputRef)}
              isUploading={isUploading === 'dashboardLogoUrl'}
              uploadingProperty={isUploading}
              previewSrc={branding.sideBarLogo || "/logos/dashboard-logo.png"}
              alt="Dashboard Logo Preview"
              previewClassName="h-8 w-auto bg-gray-500"
            />

            {/* Typography Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div>
                <Label htmlFor="headingFont">Heading Font</Label>
                <select
                  id="headingFont"
                  value={branding.headingFont?.split(',')[0] || 'Inter'}
                  onChange={(e) => handleBrandingChange('headingFont', `${e.target.value}, sans-serif`)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-10"
                  disabled={!!isUploading}
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Poppins">Poppins</option>
                </select>
              </div>
              <div>
                <Label htmlFor="bodyFont">Body Font</Label>
                <select
                  id="bodyFont"
                  value={branding.bodyFont?.split(',')[0] || 'Inter'}
                  onChange={(e) => handleBrandingChange('bodyFont', `${e.target.value}, sans-serif`)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-10"
                  disabled={!!isUploading}
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Poppins">Poppins</option>
                </select>
              </div>
            </div>

            {/* Branding Submit Button */}
            <div className="pt-4">
              <Button 
                onClick={handleSaveBranding}
                disabled={!!isUploading || brandingUploading}
                className="w-full"
              >
                {brandingUploading ? 'Saving Branding...' : 'Save Branding Settings'}
              </Button>
            </div>
          </div>

          {/* Marketing Header Section */}
          <div className="space-y-6 p-6 bg-white shadow rounded-lg border">
            <div className="flex items-center mb-4">
              <Paintbrush className="h-6 w-6 text-gray-500" /> 
              <h2 className="ml-3 text-xl font-semibold text-gray-900">Marketing Page Header</h2>
            </div>
            {/* Background Type */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">Background Type</Label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="headerBgType"
                    value="Color"
                    checked={marketingHeader.type === 'Color'}
                    onChange={(e) => handleMarketingHeaderChange('type', e.target.value as 'Color' | 'Image')}
                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                    disabled={!!isUploading}
                  />
                  <span className="ml-2 text-sm text-gray-700">Color</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="headerBgType"
                    value="Image"
                    checked={marketingHeader.type === 'Image'}
                    onChange={(e) => handleMarketingHeaderChange('type', e.target.value as 'Color' | 'Image')}
                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                    disabled={!!isUploading}
                  />
                  <span className="ml-2 text-sm text-gray-700">Image</span>
                </label>
              </div>
            </div>

            {/* Background Color (conditional) */}
            {marketingHeader.type === 'Color' && (
              <ColorInputGroup 
                label="Background Color" 
                id="marketingHeaderBgColor" 
                value={marketingHeader.background} 
                onChange={(id, value) => handleMarketingHeaderChange('background', value)} 
                disabled={!!isUploading} 
              />
            )}

            {/* Background Image URL (conditional) */}
            {marketingHeader.type === 'Image' && (
              <>
                <input type="file" ref={marketingHeaderImageInputRef} onChange={(e) => handleFileUpload(e, 'marketingHeaderBgImageUrl')} hidden accept="image/png, image/jpeg, image/webp" />
                <UrlUploadGroup
                  label="Background Image"
                  id="marketingHeaderBgImageUrl"
                  value={marketingHeader.background}
                  onChange={(id, value) => handleMarketingHeaderChange('background', value)}
                  onUploadClick={() => triggerFileInput(marketingHeaderImageInputRef)}
                  isUploading={!!isUploading}
                  uploadingProperty={isUploading}
                  alt="Marketing Header Background"
                />
              </>
            )}
            {/* Header Text Color */}
            <ColorInputGroup 
              label="Header Text Color" 
              id="marketingHeaderTextColor" 
              value={marketingHeader.headerTextColor} 
              onChange={(id, value) => handleMarketingHeaderChange('headerTextColor', value)} 
              disabled={!!isUploading} 
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Color Palette Section */}
          <div className="space-y-6 p-6 bg-white shadow rounded-lg border">
            <div className="flex items-center mb-4">
              <Palette className="h-6 w-6 text-gray-500" />
              <h2 className="ml-3 text-xl font-semibold text-gray-900">Color Palette</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ColorInputGroup 
                label="Primary Color" 
                id="primaryColor" 
                value={colorPalette.primaryColor} 
                onChange={handleColorPaletteChange as (property: string, value: string) => void} 
                disabled={!!isUploading} 
              />
              <ColorInputGroup 
                label="Secondary Color" 
                id="secondaryColor" 
                value={colorPalette.secondaryColor} 
                onChange={handleColorPaletteChange as (property: string, value: string) => void} 
                disabled={!!isUploading} 
              />
              <ColorInputGroup 
                label="Accent Color" 
                id="accentColor" 
                value={colorPalette.accentColor} 
                onChange={handleColorPaletteChange as (property: string, value: string) => void} 
                disabled={!!isUploading} 
              />
              <ColorInputGroup 
                label="Marketing Button Text" 
                id="marketingButtonText" 
                value={colorPalette.marketingButtonText} 
                onChange={handleColorPaletteChange as (property: string, value: string) => void} 
                disabled={!!isUploading} 
              />
              <ColorInputGroup 
                label="Marketing Body Text" 
                id="marketingBodyText" 
                value={colorPalette.marketingBodyText} 
                onChange={handleColorPaletteChange as (property: string, value: string) => void} 
                disabled={!!isUploading} 
              />
              <ColorInputGroup 
                label="Dashboard Sidebar BG" 
                id="dashboardSidebarBG" 
                value={colorPalette.dashboardSidebarBG} 
                onChange={handleColorPaletteChange as (property: string, value: string) => void} 
                disabled={!!isUploading} 
              />
              <ColorInputGroup 
                label="Dashboard Sidebar Text" 
                id="dashboardSidebarText" 
                value={colorPalette.dashboardSidebarText} 
                onChange={handleColorPaletteChange as (property: string, value: string) => void} 
                disabled={!!isUploading} 
              />
              <ColorInputGroup 
                label="Dashboard Button Text" 
                id="dashboardButtonText" 
                value={colorPalette.dashboardButtonText} 
                onChange={handleColorPaletteChange as (property: string, value: string) => void} 
                disabled={!!isUploading} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}