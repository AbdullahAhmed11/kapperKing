import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Palette, Settings, Layout, Code, Share2, Plus, Trash2, Eye, Camera, Image as ImageIcon } from 'lucide-react';
import Cookies from 'js-cookie'; 
import { jwtDecode } from 'jwt-decode';

type JwtPayload = {
  Id: number;
  email?: string;
  Name?: string;
};

const Website = () => {
  const [activeTab, setActiveTab] = useState('theme');
  const token = Cookies.get('salonUser');
  const decoded = token ? jwtDecode<JwtPayload>(token) : undefined;
  const [customDomain, setCustomDomain] = useState('');
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const [website, setWebsite] = useState({
    themeConfig: {
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter'
      },
      layout: {
        header: 'default',
        footer: 'default'
      }
    },
    navigation: [
      { label: 'Home', url: '/' },
      { label: 'Services', url: '/services' }
    ],
    seoConfig: {
      title: 'My Salon - Beauty Services',
      description: 'Premium beauty services at affordable prices',
      keywords: ['salon', 'beauty', 'hair', 'nails']
    },
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: ''
    },
    customCss: '',
    customScripts: '',
    isPublished: false,
    aboutDescription: '',
    aboutImage: null as File | null,
    logo: null as File | null
  });

  // General update function
  const updateWebsite = (path: string, value: any) => {
    setWebsite(prev => {
      const paths = path.split('.');
      const newWebsite = {...prev};
      let current: any = newWebsite;
      
      for (let i = 0; i < paths.length - 1; i++) {
        current = current[paths[i]];
      }
      
      current[paths[paths.length - 1]] = value;
      return newWebsite;
    });
  };

  // Navigation functions
  const addNavigationLink = () => {
    updateWebsite('navigation', [...website.navigation, { label: '', url: '' }]);
  };

  const removeNavigationLink = (index: number) => {
    updateWebsite('navigation', website.navigation.filter((_, i) => i !== index));
  };

  const updateNavigationLink = (index: number, field: 'label' | 'url', value: string) => {
    const newNavigation = [...website.navigation];
    newNavigation[index][field] = value;
    updateWebsite('navigation', newNavigation);
  };

  // Social links functions
  const addSocialLink = () => {
    const platform = prompt('Enter social media platform name:');
    if (platform) {
      updateWebsite('socialLinks', { ...website.socialLinks, [platform]: '' });
    }
  };

  const removeSocialLink = (platform: string) => {
    const newLinks = {...website.socialLinks};
    delete newLinks[platform];
    updateWebsite('socialLinks', newLinks);
  };

  // Image handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'aboutImage' | 'logo' | 'gallery') => {
    if (e.target.files) {
      if (field === 'gallery') {
        const newImages = Array.from(e.target.files);
        setGalleryImages(prev => [...prev, ...newImages]);
      } else {
        updateWebsite(field, e.target.files[0]);
      }
    }
  };

  const removeImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = async () => {
    if (!decoded?.Id || galleryImages.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('SalonId', decoded.Id.toString());
    
    galleryImages.forEach((image) => {
      formData.append(`Images`, image);
    });

    try {
      const response = await fetch('https://kapperking.runasp.net/api/Salons/AddGallary', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Gallery images uploaded successfully!');
        setGalleryImages([]);
      } else {
        const error = await response.text();
        alert(`Failed to upload images: ${error}`);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('An error occurred while uploading images');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveMicrosite = async () => {
    if (!decoded?.Id) {
      console.error("Salon ID not found in token");
      return;
    }

    const formData = new FormData();
    formData.append('salonId', decoded.Id.toString());
    formData.append('primaryColor', website.themeConfig.colors.primary);
    formData.append('secondaryColor', website.themeConfig.colors.secondary);
    formData.append('bodyFont', website.themeConfig.fonts.body);
    formData.append('headingFont', website.themeConfig.fonts.heading);
    formData.append('pageTitle', website.seoConfig.title);
    formData.append('metaDescription', website.seoConfig.description);
    formData.append('keywords', website.seoConfig.keywords.join(','));
    formData.append('customDomain', customDomain);
    formData.append('customCSS', website.customCss);
    formData.append('customJS', website.customScripts);
    formData.append('facebookLink', website.socialLinks.facebook || '');
    formData.append('twitterLink', website.socialLinks.twitter || '');
    formData.append('instagramLink', website.socialLinks.instagram || '');
    formData.append('aboutDescription', website.aboutDescription);
    
    if (website.aboutImage) {
      formData.append('aboutImage', website.aboutImage);
    }
    if (website.logo) {
      formData.append('logo', website.logo);
    }

    try {
      const response = await fetch('https://kapperking.runasp.net/api/Salons/AddOrEditMicrosite', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Microsite saved:', data);
        alert('Microsite settings saved successfully!');
      } else {
        console.error('Failed to save microsite:', data);
        alert('Failed to save microsite. Please try again.');
      }
    } catch (error) {
      console.error('Error saving microsite:', error);
      alert('An error occurred while saving the microsite.');
    }
  };

  const tabs = [
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'custom', label: 'Custom Code', icon: Code },
    { id: 'social', label: 'Social', icon: Share2 },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon }
  ];

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Website Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Customize your salon's website appearance and content
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => window.open(`/s/${decoded?.Name}/${decoded?.Id}`, '_blank')}>
            <Eye className="h-4 w-4 mr-2" />
            Preview Site
          </Button>
          <Button 
            variant={website.isPublished ? 'outline' : 'default'}
            onClick={() => updateWebsite('isPublished', !website.isPublished)}
          >
            {website.isPublished ? 'Unpublish' : 'Publish'}
          </Button>
          <Button variant="default" onClick={handleSaveMicrosite}>
            Save Microsite
          </Button>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

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
                      onChange={(e) => updateWebsite('themeConfig.colors.primary', e.target.value)}
                      className="w-12 p-1 rounded-l-md border-r-0"
                    />
                    <Input
                      type="text"
                      value={website.themeConfig.colors.primary}
                      onChange={(e) => updateWebsite('themeConfig.colors.primary', e.target.value)}
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
                      onChange={(e) => updateWebsite('themeConfig.colors.secondary', e.target.value)}
                      className="w-12 p-1 rounded-l-md border-r-0"
                    />
                    <Input
                      type="text"
                      value={website.themeConfig.colors.secondary}
                      onChange={(e) => updateWebsite('themeConfig.colors.secondary', e.target.value)}
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
                    onChange={(e) => updateWebsite('themeConfig.fonts.heading', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option>Inter</option>
                    <option>Roboto</option>
                    <option>Open Sans</option>
                    <option>Montserrat</option>
                    <option>Poppins</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="bodyFont">Body Font</Label>
                  <select
                    id="bodyFont"
                    value={website.themeConfig.fonts.body}
                    onChange={(e) => updateWebsite('themeConfig.fonts.body', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option>Inter</option>
                    <option>Roboto</option>
                    <option>Open Sans</option>
                    <option>Montserrat</option>
                    <option>Poppins</option>
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
                      onChange={(e) => updateNavigationLink(index, 'label', e.target.value)}
                      placeholder="Label"
                    />
                    <Input
                      value={item.url}
                      onChange={(e) => updateNavigationLink(index, 'url', e.target.value)}
                      placeholder="URL"
                    />
                    <Button
                      variant="outline"
                      onClick={() => removeNavigationLink(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button onClick={addNavigationLink}>
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
                    onChange={(e) => updateWebsite('themeConfig.layout.header', e.target.value)}
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
                    onChange={(e) => updateWebsite('themeConfig.layout.footer', e.target.value)}
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
                    onChange={(e) => updateWebsite('seoConfig.title', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="seoDescription">Meta Description</Label>
                  <textarea
                    id="seoDescription"
                    value={website.seoConfig.description}
                    onChange={(e) => updateWebsite('seoConfig.description', e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="seoKeywords">Keywords (comma-separated)</Label>
                  <Input
                    id="seoKeywords"
                    value={website.seoConfig.keywords.join(', ')}
                    onChange={(e) => updateWebsite('seoConfig.keywords', e.target.value.split(',').map(k => k.trim()))}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-6">
              <h3 className="text-lg font-medium text-gray-900">Custom Domain</h3>
              <p className="mt-1 text-sm text-gray-500">Point your own domain to this microsite (requires DNS configuration).</p>
              <div className="mt-4">
                <Label htmlFor="customDomain">Domain Name</Label>
                <Input
                  id="customDomain"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="e.g., www.yoursalon.com"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="pt-6">
              <h3 className="text-lg font-medium text-gray-900">About Section</h3>
              <div className="mt-4">
                <Label htmlFor="aboutDescription">Description</Label>
                <textarea
                  id="aboutDescription"
                  value={website.aboutDescription}
                  onChange={(e) => updateWebsite('aboutDescription', e.target.value)}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Tell customers about your salon..."
                />
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="aboutImage">About Image</Label>
                  <Input
                    id="aboutImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'aboutImage')}
                    className="mt-1"
                  />
                  {website.aboutImage && (
                    <div className="mt-2">
                      <img 
                        src={URL.createObjectURL(website.aboutImage)} 
                        alt="About preview" 
                        className="h-20 object-cover rounded"
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="logo">Logo</Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'logo')}
                    className="mt-1"
                  />
                  {website.logo && (
                    <div className="mt-2">
                      <img 
                        src={URL.createObjectURL(website.logo)} 
                        alt="Logo preview" 
                        className="h-20 object-contain rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Custom CSS</h3>
              <textarea
                value={website.customCss}
                onChange={(e) => updateWebsite('customCss', e.target.value)}
                rows={10}
                className="mt-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
                placeholder="/* Add your custom CSS here */"
              />
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">Custom JavaScript</h3>
              <textarea
                value={website.customScripts}
                onChange={(e) => updateWebsite('customScripts', e.target.value)}
                rows={10}
                className="mt-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
                placeholder="// Add your custom JavaScript here"
              />
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
                    <Label className="w-24 capitalize">{platform}</Label>
                    <Input
                      value={url}
                      onChange={(e) => updateWebsite(`socialLinks.${platform}`, e.target.value)}
                      placeholder={`Enter ${platform} URL`}
                    />
                    <Button
                      variant="outline"
                      onClick={() => removeSocialLink(platform)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button onClick={addSocialLink}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Social Link
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Gallery Images</h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload images to showcase your salon's work
              </p>
              
              <div className="mt-4">
                <Label htmlFor="gallery-upload" className="cursor-pointer">
                  <Button asChild variant="outline">
                    <div>
                      <Camera className="h-4 w-4 mr-2" />
                      Select Images
                    </div>
                  </Button>
                  <Input
                    id="gallery-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'gallery')}
                    className="hidden"
                  />
                </Label>
              </div>

              {galleryImages.length > 0 && (
                <>
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    {galleryImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Gallery image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <Button
                      onClick={handleImageUpload}
                      disabled={uploading}
                    >
                      {uploading ? 'Uploading...' : 'Upload Images'}
                    </Button>
                    <span className="ml-2 text-sm text-gray-500">
                      {galleryImages.length} images selected
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Website;