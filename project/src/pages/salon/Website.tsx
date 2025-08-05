import React, { useState, useEffect } from 'react';
import { useWebsiteStore } from '@/lib/store/website';
import { useSalonStore } from '@/lib/store/salon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Palette, Settings, Layout, Code, Share2, Plus, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function Website() {
  const { currentSalon } = useSalonStore();
  const { 
    website,
    loading,
    fetchWebsite,
    initializeWebsite,
    updateTheme,
    updateSEO,
    updateNavigation,
    updateSocialLinks,
    updateCustomCode,
    togglePublished
  } = useWebsiteStore();

  const [activeTab, setActiveTab] = useState('theme');
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (currentSalon?.id) {
      fetchWebsite(currentSalon.id);
      setPreviewUrl(`${window.location.origin}/s/${currentSalon.slug}`);
    }
  }, [currentSalon?.id]);

  const handleSetupWebsite = async () => {
    if (!currentSalon?.id || !currentSalon?.name) return;
    await initializeWebsite(currentSalon.id, currentSalon.name);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!website) {
    return (
      <div className="text-center py-12">
        <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No website configured</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by setting up your salon's website
        </p>
        <Button
          onClick={handleSetupWebsite}
          className="mt-4"
        >
          Set up website
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'settings', label: 'Settings', icon: Settings },
    // { id: 'custom', label: 'Custom Code', icon: Code },
    { id: 'social', label: 'Social', icon: Share2 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Website Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Customize your salon's website appearance and content
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => window.open(previewUrl, '_blank')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Site
          </Button>
          <Button
            onClick={() => togglePublished(currentSalon!.id, !website.isPublished)}
            variant={website.isPublished ? 'outline' : 'default'}
          >
            {website.isPublished ? 'Unpublish' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        {activeTab === 'theme' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Colors</h3>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <Input
                      type="color"
                      id="primaryColor"
                      value={website.themeConfig.colors.primary}
                      onChange={(e) => updateTheme(currentSalon!.id, {
                        ...website.themeConfig,
                        colors: { ...website.themeConfig.colors, primary: e.target.value }
                      })}
                      className="w-12 p-1 rounded-l-md border-r-0"
                    />
                    <Input
                      type="text"
                      value={website.themeConfig.colors.primary}
                      onChange={(e) => updateTheme(currentSalon!.id, {
                        ...website.themeConfig,
                        colors: { ...website.themeConfig.colors, primary: e.target.value }
                      })}
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
                      value={website.themeConfig.colors.secondary}
                      onChange={(e) => updateTheme(currentSalon!.id, {
                        ...website.themeConfig,
                        colors: { ...website.themeConfig.colors, secondary: e.target.value }
                      })}
                      className="w-12 p-1 rounded-l-md border-r-0"
                    />
                    <Input
                      type="text"
                      value={website.themeConfig.colors.secondary}
                      onChange={(e) => updateTheme(currentSalon!.id, {
                        ...website.themeConfig,
                        colors: { ...website.themeConfig.colors, secondary: e.target.value }
                      })}
                      className="flex-1 rounded-l-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">Typography</h3>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="headingFont">Heading Font</Label>
                  <select
                    id="headingFont"
                    value={website.themeConfig.fonts.heading}
                    onChange={(e) => updateTheme(currentSalon!.id, {
                      ...website.themeConfig,
                      fonts: { ...website.themeConfig.fonts, heading: e.target.value }
                    })}
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
                    value={website.themeConfig.fonts.body}
                    onChange={(e) => updateTheme(currentSalon!.id, {
                      ...website.themeConfig,
                      fonts: { ...website.themeConfig.fonts, body: e.target.value }
                    })}
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
        )}

        {activeTab === 'layout' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Navigation</h3>
              <div className="mt-4">
                {website.navigation.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 mb-4">
                    <Input
                      value={item.label}
                      onChange={(e) => {
                        const newNavigation = [...website.navigation];
                        newNavigation[index].label = e.target.value;
                        updateNavigation(currentSalon!.id, newNavigation);
                      }}
                      placeholder="Label"
                    />
                    <Input
                      value={item.url}
                      onChange={(e) => {
                        const newNavigation = [...website.navigation];
                        newNavigation[index].url = e.target.value;
                        updateNavigation(currentSalon!.id, newNavigation);
                      }}
                      placeholder="URL"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        const newNavigation = website.navigation.filter((_, i) => i !== index);
                        updateNavigation(currentSalon!.id, newNavigation);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={() => {
                    const newNavigation = [...website.navigation, { label: '', url: '' }];
                    updateNavigation(currentSalon!.id, newNavigation);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Link
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">Layout Settings</h3>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="headerLayout">Header Layout</Label>
                  <select
                    id="headerLayout"
                    value={website.themeConfig.layout.header}
                    onChange={(e) => updateTheme(currentSalon!.id, {
                      ...website.themeConfig,
                      layout: { ...website.themeConfig.layout, header: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="default">Default</option>
                    <option value="centered">Centered</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="footerLayout">Footer Layout</Label>
                  <select
                    id="footerLayout"
                    value={website.themeConfig.layout.footer}
                    onChange={(e) => updateTheme(currentSalon!.id, {
                      ...website.themeConfig,
                      layout: { ...website.themeConfig.layout, footer: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="default">Default</option>
                    <option value="simple">Simple</option>
                    <option value="expanded">Expanded</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">SEO Settings</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="seoTitle">Page Title</Label>
                  <Input
                    id="seoTitle"
                    value={website.seoConfig.title}
                    onChange={(e) => updateSEO(currentSalon!.id, {
                      ...website.seoConfig,
                      title: e.target.value
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="seoDescription">Meta Description</Label>
                  <textarea
                    id="seoDescription"
                    value={website.seoConfig.description}
                    onChange={(e) => updateSEO(currentSalon!.id, {
                      ...website.seoConfig,
                      description: e.target.value
                    })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="seoKeywords">Keywords (comma-separated)</Label>
                  <Input
                    id="seoKeywords"
                    value={website.seoConfig.keywords.join(', ')}
                    onChange={(e) => updateSEO(currentSalon!.id, {
                      ...website.seoConfig,
                      keywords: e.target.value.split(',').map(k => k.trim())
                    })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

     

        {activeTab === 'social' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Social Media Links</h3>
              <div className="mt-4 space-y-4">
                {Object.entries(website.socialLinks).map(([platform, url]) => (
                  <div key={platform} className="flex items-center space-x-4">
                    <Label className="w-24">{platform}</Label>
                    <Input
                      value={url}
                      onChange={(e) => {
                        const newLinks = { ...website.socialLinks, [platform]: e.target.value };
                        updateSocialLinks(currentSalon!.id, newLinks);
                      }}
                      placeholder={`Enter ${platform} URL`}
                    />
                  </div>
                ))}
                <Button
                  onClick={() => {
                    const platform = prompt('Enter social media platform name:');
                    if (platform) {
                      const newLinks = { ...website.socialLinks, [platform]: '' };
                      updateSocialLinks(currentSalon!.id, newLinks);
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Social Link
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}