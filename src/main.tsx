import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// import { BrowserRouter } from 'react-router-dom'; // Remove import
import App from './App.tsx';
import './index.css';
import { useThemeStore } from './lib/theme.ts'; // Import theme store

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      {/* Router is now inside App.tsx */}
      <App />
  </StrictMode>
);

// Function to update favicon link
function updateFavicon(url: string) {
  let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = url || '/favicon.ico'; // Use default if URL is empty
}

// Initial favicon set
updateFavicon(useThemeStore.getState().currentTheme.faviconUrl);

// Subscribe to theme changes to update favicon dynamically
useThemeStore.subscribe((newState, prevState) => {
  const newFaviconUrl = newState.currentTheme.faviconUrl;
  const oldFaviconUrl = prevState.currentTheme.faviconUrl;
  
  // Only update if the favicon URL actually changed
  if (newFaviconUrl !== oldFaviconUrl) {
    console.log('Favicon URL changed in store, updating link tag:', newFaviconUrl);
    updateFavicon(newFaviconUrl);
  }
});
