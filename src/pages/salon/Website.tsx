// import React, { useState, useEffect } from 'react';
// import { useWebsiteStore } from '@/lib/store/website';
// import { useCurrentSalonStore } from '@/lib/store/currentSalon'; // Import the correct store
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Globe, Palette, Settings, Layout, Code, Share2, Plus, Trash2, Eye } from 'lucide-react';
// import { toast } from 'sonner';
// import Cookies from 'js-cookie';
// import { jwtDecode } from 'jwt-decode';
// type JwtPayload = {
//   Id: number; // adjust this to match your token's structure
//   email?: string;
//   name?: string;
//   // any other fields you expect
// };

// export default function Website() {
//   const {  loading: salonLoading, error: salonError } = useCurrentSalonStore(); // Use the correct store
// const token = Cookies.get('salonUser');

// const currentSalon = jwtDecode<JwtPayload>(token);
// if (token) {
//   const decoded = jwtDecode<JwtPayload>(token);
//   console.log('User ID:', decoded.Id);
// }
//   const { 
//     website,
//     loading,
//     fetchWebsite,
//     initializeWebsite,
//     updateTheme,
//     updateSEO,
//     updateNavigation,
//     updateSocialLinks,
//     updateCustomCode,
//     togglePublished,
//     // Note: updateSEO might not be the right place for domain, using salon store instead
//   } = useWebsiteStore();
//   const { updateCurrentSalonDetails } = useCurrentSalonStore(); // Get salon update action

//   const [activeTab, setActiveTab] = useState('theme');
//   const [previewUrl, setPreviewUrl] = useState('');

//   useEffect(() => {
//     if (currentSalon?.id) {
//       // Fetch website config only if currentSalon is loaded and has an ID
//       fetchWebsite(currentSalon.id);
//       if (currentSalon.slug) {
//          setPreviewUrl(`${window.location.origin}/s/${currentSalon.slug}`);
//       }
//     } else if (!salonLoading && !currentSalon) {
//        // Handle case where salon couldn't be loaded (e.g., show error)
//        console.error("Website.tsx: Current salon not found or failed to load.");
//        // Optionally set an error state specific to this page
//     }
//   }, [currentSalon?.id]);

//   const handleSetupWebsite = async () => {
//     await initializeWebsite(currentSalon.Id, currentSalon.Name);
//     // if (!currentSalon?.Id || !currentSalon?.Name) return;
//   };

//   // Show loading if either salon data or website data is loading
//   if (salonLoading || loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /> {/* Use theme color */}
//       </div>
//     );
//   }

//   // Show error if salon loading failed
//   if (salonError) {
//      return <div className="text-center py-12 text-red-600">Error loading salon data: {salonError}</div>;
//   }

//   if (!website) {
//     return (
//       <div className="text-center py-12">
//         <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//         <h3 className="text-lg font-medium text-gray-900">No website configured</h3>
//         <p className="mt-1 text-sm text-gray-500">
//           Get started by setting up your salon's website
//         </p>
//         <Button
//           onClick={handleSetupWebsite}
//           className="mt-4"
//         >
//           Set up website
//         </Button>
//       </div>
//     );
//   }

//   const tabs = [
//     { id: 'theme', label: 'Theme', icon: Palette },
//     { id: 'layout', label: 'Layout', icon: Layout },
//     { id: 'settings', label: 'Settings', icon: Settings },
//     { id: 'custom', label: 'Custom Code', icon: Code },
//     { id: 'social', label: 'Social', icon: Share2 }
//   ];

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-semibold text-gray-900">Website Settings</h1>
//           <p className="mt-1 text-sm text-gray-500">
//             Customize your salon's website appearance and content
//           </p>
//         </div>
//         <div className="flex items-center space-x-4">
//           <Button
//             variant="outline"
//             onClick={() => window.open(previewUrl, '_blank')}
//           >
//             <Eye className="h-4 w-4 mr-2" />
//             Preview Site
//           </Button>
//           <Button
//             onClick={() => togglePublished(currentSalon!.id, !website.isPublished)}
//             variant={website.isPublished ? 'outline' : 'default'}
//           >
//             {website.isPublished ? 'Unpublish' : 'Publish'}
//           </Button>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="border-b border-gray-200">
//         <nav className="-mb-px flex space-x-8">
//           {tabs.map((tab) => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`
//                 flex items-center py-4 px-1 border-b-2 font-medium text-sm
//                 ${activeTab === tab.id
//                   ? 'border-indigo-500 text-indigo-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                 }
//               `}
//             >
//               <tab.icon className="h-5 w-5 mr-2" />
//               {tab.label}
//             </button>
//           ))}
//         </nav>
//       </div>

//       {/* Tab Content */}
//       <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
//         {activeTab === 'theme' && (
//           <div className="p-6 space-y-6">
//             <div>
//               <h3 className="text-lg font-medium text-gray-900">Colors</h3>
//               <div className="mt-4 grid grid-cols-2 gap-4">
//                 <div>
//                   <Label htmlFor="primaryColor">Primary Color</Label>
//                   <div className="mt-1 flex rounded-md shadow-sm">
//                     <Input
//                       type="color"
//                       id="primaryColor"
//                       value={website.themeConfig.colors.primary}
//                       onChange={(e) => updateTheme(currentSalon!.id, {
//                         ...website.themeConfig,
//                         colors: { ...website.themeConfig.colors, primary: e.target.value }
//                       })}
//                       className="w-12 p-1 rounded-l-md border-r-0"
//                     />
//                     <Input
//                       type="text"
//                       value={website.themeConfig.colors.primary}
//                       onChange={(e) => updateTheme(currentSalon!.id, {
//                         ...website.themeConfig,
//                         colors: { ...website.themeConfig.colors, primary: e.target.value }
//                       })}
//                       className="flex-1 rounded-l-none"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <Label htmlFor="secondaryColor">Secondary Color</Label>
//                   <div className="mt-1 flex rounded-md shadow-sm">
//                     <Input
//                       type="color"
//                       id="secondaryColor"
//                       value={website.themeConfig.colors.secondary}
//                       onChange={(e) => updateTheme(currentSalon!.id, {
//                         ...website.themeConfig,
//                         colors: { ...website.themeConfig.colors, secondary: e.target.value }
//                       })}
//                       className="w-12 p-1 rounded-l-md border-r-0"
//                     />
//                     <Input
//                       type="text"
//                       value={website.themeConfig.colors.secondary}
//                       onChange={(e) => updateTheme(currentSalon!.id, {
//                         ...website.themeConfig,
//                         colors: { ...website.themeConfig.colors, secondary: e.target.value }
//                       })}
//                       className="flex-1 rounded-l-none"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div>
//               <h3 className="text-lg font-medium text-gray-900">Typography</h3>
//               <div className="mt-4 grid grid-cols-2 gap-4">
//                 <div>
//                   <Label htmlFor="headingFont">Heading Font</Label>
//                   <select
//                     id="headingFont"
//                     value={website.themeConfig.fonts.heading}
//                     onChange={(e) => updateTheme(currentSalon!.id, {
//                       ...website.themeConfig,
//                       fonts: { ...website.themeConfig.fonts, heading: e.target.value }
//                     })}
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                   >
//                     <option>Inter</option>
//                     <option>Roboto</option>
//                     <option>Open Sans</option>
//                   </select>
//                 </div>
//                 <div>
//                   <Label htmlFor="bodyFont">Body Font</Label>
//                   <select
//                     id="bodyFont"
//                     value={website.themeConfig.fonts.body}
//                     onChange={(e) => updateTheme(currentSalon!.id, {
//                       ...website.themeConfig,
//                       fonts: { ...website.themeConfig.fonts, body: e.target.value }
//                     })}
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                   >
//                     <option>Inter</option>
//                     <option>Roboto</option>
//                     <option>Open Sans</option>
//                   </select>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === 'layout' && (
//           <div className="p-6 space-y-6">
//             <div>
//               <h3 className="text-lg font-medium text-gray-900">Navigation</h3>
//               <div className="mt-4">
//                 {website.navigation.map((item, index) => (
//                   <div key={index} className="flex items-center space-x-4 mb-4">
//                     <Input
//                       value={item.label}
//                       onChange={(e) => {
//                         const newNavigation = [...website.navigation];
//                         newNavigation[index].label = e.target.value;
//                         updateNavigation(currentSalon!.id, newNavigation);
//                       }}
//                       placeholder="Label"
//                     />
//                     <Input
//                       value={item.url}
//                       onChange={(e) => {
//                         const newNavigation = [...website.navigation];
//                         newNavigation[index].url = e.target.value;
//                         updateNavigation(currentSalon!.id, newNavigation);
//                       }}
//                       placeholder="URL"
//                     />
//                     <Button
//                       variant="outline"
//                       onClick={() => {
//                         const newNavigation = website.navigation.filter((_, i) => i !== index);
//                         updateNavigation(currentSalon!.id, newNavigation);
//                       }}
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 ))}
//                 <Button
//                   onClick={() => {
//                     const newNavigation = [...website.navigation, { label: '', url: '' }];
//                     updateNavigation(currentSalon!.id, newNavigation);
//                   }}
//                 >
//                   <Plus className="h-4 w-4 mr-2" />
//                   Add Link
//                 </Button>
//               </div>
//             </div>

//             <div>
//               <h3 className="text-lg font-medium text-gray-900">Layout Settings</h3>
//               <div className="mt-4 grid grid-cols-2 gap-4">
//                 <div>
//                   <Label htmlFor="headerLayout">Header Layout</Label>
//                   <select
//                     id="headerLayout"
//                     value={website.themeConfig.layout.header}
//                     onChange={(e) => updateTheme(currentSalon!.id, {
//                       ...website.themeConfig,
//                       layout: { ...website.themeConfig.layout, header: e.target.value }
//                     })}
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                   >
//                     <option value="default">Default</option>
//                     <option value="centered">Centered</option>
//                     <option value="minimal">Minimal</option>
//                   </select>
//                 </div>
//                 <div>
//                   <Label htmlFor="footerLayout">Footer Layout</Label>
//                   <select
//                     id="footerLayout"
//                     value={website.themeConfig.layout.footer}
//                     onChange={(e) => updateTheme(currentSalon!.id, {
//                       ...website.themeConfig,
//                       layout: { ...website.themeConfig.layout, footer: e.target.value }
//                     })}
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                   >
//                     <option value="default">Default</option>
//                     <option value="simple">Simple</option>
//                     <option value="expanded">Expanded</option>
//                   </select>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === 'settings' && (
//           <div className="p-6 space-y-6">
//             <div>
//               <h3 className="text-lg font-medium text-gray-900">SEO Settings</h3>
//               <div className="mt-4 space-y-4">
//                 <div>
//                   <Label htmlFor="seoTitle">Page Title</Label>
//                   <Input
//                     id="seoTitle"
//                     value={website.seoConfig.title}
//                     onChange={(e) => updateSEO(currentSalon!.id, {
//                       ...website.seoConfig,
//                       title: e.target.value
//                     })}
//                     className="mt-1"
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="seoDescription">Meta Description</Label>
//                   <textarea
//                     id="seoDescription"
//                     value={website.seoConfig.description}
//                     onChange={(e) => updateSEO(currentSalon!.id, {
//                       ...website.seoConfig,
//                       description: e.target.value
//                     })}
//                     rows={3}
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="seoKeywords">Keywords (comma-separated)</Label>
//                   <Input
//                     id="seoKeywords"
//                     value={website.seoConfig.keywords.join(', ')}
//                     onChange={(e) => updateSEO(currentSalon!.id, {
//                       ...website.seoConfig,
//                       keywords: e.target.value.split(',').map(k => k.trim())
//                     })}
//                     className="mt-1"
//                   />
//                 </div>
//               </div>
//             </div>
//             {/* Add Custom Domain Setting */}
//             <div className="pt-6">
//                <h3 className="text-lg font-medium text-gray-900">Custom Domain</h3>
//                <p className="mt-1 text-sm text-gray-500">Point your own domain to this microsite (requires DNS configuration).</p>
//                <div className="mt-4">
//                   <Label htmlFor="customDomain">Domain Name</Label>
//                   <Input
//                     id="customDomain"
//                     placeholder="e.g., www.yoursalon.com"
//                     // Value comes from currentSalon, not website store
//                     defaultValue={currentSalon?.custom_domain || ''}
//                     // Use onBlur or a dedicated save button to trigger update
//                     onBlur={async (e) => {
//                        if (currentSalon?.id && currentSalon?.custom_domain !== e.target.value) {
//                           await updateCurrentSalonDetails(currentSalon.id, { custom_domain: e.target.value || null });
//                           // Optionally refetch currentSalon if update doesn't refresh state automatically
//                        }
//                     }}
//                     className="mt-1"
//                   />
//                   {/* TODO: Add instructions/link for DNS setup */}
//                </div>
//             </div>
//           </div>
//         )}

//         {activeTab === 'custom' && (
//           <div className="p-6 space-y-6">
//             <div>
//               <h3 className="text-lg font-medium text-gray-900">Custom CSS</h3>
//               <textarea
//                 value={website.customCss}
//                 onChange={(e) => updateCustomCode(currentSalon!.id, e.target.value, website.customScripts)}
//                 rows={10}
//                 className="mt-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
//                 placeholder="/* Add your custom CSS here */"
//               />
//             </div>

//             <div>
//               <h3 className="text-lg font-medium text-gray-900">Custom JavaScript</h3>
//               <textarea
//                 value={website.customScripts}
//                 onChange={(e) => updateCustomCode(currentSalon!.id, website.customCss, e.target.value)}
//                 rows={10}
//                 className="mt-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
//                 placeholder="// Add your custom JavaScript here"
//               />
//             </div>
//           </div>
//         )}

//         {activeTab === 'social' && (
//           <div className="p-6 space-y-6">
//             <div>
//               <h3 className="text-lg font-medium text-gray-900">Social Media Links</h3>
//               <div className="mt-4 space-y-4">
//                 {Object.entries(website.socialLinks).map(([platform, url]) => (
//                   <div key={platform} className="flex items-center space-x-4">
//                     <Label className="w-24">{platform}</Label>
//                     <Input
//                       value={url}
//                       onChange={(e) => {
//                         const newLinks = { ...website.socialLinks, [platform]: e.target.value };
//                         updateSocialLinks(currentSalon!.id, newLinks);
//                       }}
//                       placeholder={`Enter ${platform} URL`}
//                     />
//                   </div>
//                 ))}
//                 <Button
//                   onClick={() => {
//                     const platform = prompt('Enter social media platform name:');
//                     if (platform) {
//                       const newLinks = { ...website.socialLinks, [platform]: '' };
//                       updateSocialLinks(currentSalon!.id, newLinks);
//                     }
//                   }}
//                 >
//                   <Plus className="h-4 w-4 mr-2" />
//                   Add Social Link
//                 </Button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Palette, Settings, Layout, Code, Share2, Plus, Trash2, Eye } from 'lucide-react';
import Cookies from 'js-cookie'; 
import { jwtDecode } from 'jwt-decode';

type JwtPayload = {
  Id: number; // adjust this to match your token's structure
  email?: string;
  Name?: string;
  // any other fields you expect
};
const Website = () => {
  const [activeTab, setActiveTab] = useState('theme');
  
  const token = Cookies.get('salonUser');
  
  const decoded = jwtDecode<JwtPayload>(token);

  if (token) {
    const decoded = jwtDecode<JwtPayload>(token);
    console.log('User ID:', decoded.Name);
  }
  // Website state
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
    isPublished: false
  });

  const [customDomain, setCustomDomain] = useState('');
  const previewUrl = 'https://example.com/s/mysalon';

  const tabs = [
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'custom', label: 'Custom Code', icon: Code },
    { id: 'social', label: 'Social', icon: Share2 }
  ];

  // General update function
  const updateWebsite = (path: string, value: any) => {
    setWebsite(prev => {
      const paths = path.split('.');
      const newWebsite = {...prev};
      let current = newWebsite;
      
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
const handleSaveMicrosite = async () => {
  if (!decoded?.Id) {
    console.error("Salon ID not found in token");
    return;
  }

  const payload = {
    salonId: decoded.Id,
    primaryColor: website.themeConfig.colors.primary,
    secondaryColor: website.themeConfig.colors.secondary,
    bodyFont: website.themeConfig.fonts.body,
    headingFont: website.themeConfig.fonts.heading,
    pageTitle: website.seoConfig.title,
    metaDescription: website.seoConfig.description,
    keywords: website.seoConfig.keywords.join(','),
    customDomain: customDomain,
    customCSS: website.customCss,
    customJS: website.customScripts,
    facebookLink: website.socialLinks.facebook || '',
    twitterLink: website.socialLinks.twitter || '',
    instagramLink: website.socialLinks.instagram || '',
    secretKey: "", // add if applicable
    publishKey: "" // add if applicable
  };

  try {
    const response = await fetch('https://kapperking.runasp.net/api/Salons/AddOrEditMicrosite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
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

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header Section */}
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

      {/* Tabs Navigation */}
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

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        {/* Theme Tab */}
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

        {/* Layout Tab */}
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

        {/* Settings Tab */}
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
          </div>
        )}

        {/* Custom Code Tab */}
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

        {/* Social Tab */}
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
      </div>
    </div>
  );
};

export default Website;