// import { StrictMode } from 'react';
// import { createRoot } from 'react-dom/client';
// // import { BrowserRouter } from 'react-router-dom'; // Remove import
// import App from './App.tsx';
// import './index.css';
// import { useThemeStore } from './lib/theme.ts'; // Import theme store

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//       {/* Router is now inside App.tsx */}
//       <App />
//   </StrictMode>
// );

// // Function to update favicon link
// function updateFavicon(url: string) {
//   let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
//   if (!link) {
//     link = document.createElement('link');
//     link.rel = 'icon';
//     document.head.appendChild(link);
//   }
//   link.href = url || '/favicon.ico'; // Use default if URL is empty
// }

// // Initial favicon set
// updateFavicon(useThemeStore.getState().currentTheme.faviconUrl);

// // Subscribe to theme changes to update favicon dynamically
// useThemeStore.subscribe((newState, prevState) => {
//   const newFaviconUrl = newState.currentTheme.faviconUrl;
//   const oldFaviconUrl = prevState.currentTheme.faviconUrl;
  
//   // Only update if the favicon URL actually changed
//   if (newFaviconUrl !== oldFaviconUrl) {
//     console.log('Favicon URL changed in store, updating link tag:', newFaviconUrl);
//     updateFavicon(newFaviconUrl);
//   }
// });

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// import { BrowserRouter } from 'react-router-dom'; // Router is inside App now
import App from './App.tsx';
import './index.css';
import { useThemeStore } from './lib/theme.ts';

// ------------------------------
// Mount React app
// ------------------------------

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// ------------------------------
// Helper: update favicon link tag
// ------------------------------

function updateFavicon(url: string) {
  let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = url || '/favicon.ico'; // fallback to default
}

// ------------------------------
// Fetch branding from your backend
// ------------------------------

async function fetchBrandingAndSetFavicon() {
  try {
    const res = await fetch('https://kapperking.runasp.net/api/SuperAdmin/GetBranding');
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    const branding = await res.json();

    console.log('Branding API response:', branding);

    if (branding.favIcon) {
      updateFavicon(branding.favIcon);
    } else {
      console.warn('Branding response missing favIcon, using default theme favicon');
      updateFavicon(useThemeStore.getState().currentTheme.faviconUrl);
    }
  } catch (err) {
    console.error('Error fetching branding:', err);
    updateFavicon(useThemeStore.getState().currentTheme.faviconUrl); // fallback to theme store favicon
  }
}

// ------------------------------
// Initial favicon logic
// ------------------------------

fetchBrandingAndSetFavicon();

// ------------------------------
// Keep watching theme store for changes
// ------------------------------

useThemeStore.subscribe((newState, prevState) => {
  const newFaviconUrl = newState.currentTheme.faviconUrl;
  const oldFaviconUrl = prevState.currentTheme.faviconUrl;

  if (newFaviconUrl !== oldFaviconUrl) {
    console.log('Theme store favicon changed, updating link tag:', newFaviconUrl);
    updateFavicon(newFaviconUrl);
  }
});
