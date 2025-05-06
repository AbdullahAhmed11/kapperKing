import { create } from 'zustand';
import { toast } from 'sonner';
import React from 'react';

// --- Type Definitions ---
export type PageContent = {
  content: string | null;
  meta: {
    description: string | null;
    keywords: string | null;
  };
};

export type PageData = {
  id: string;
  title: string;
  slug: string;
  type: 'page' | 'blog' | 'landing';
  status: 'published' | 'draft';
  lastModified: string;
  author: string;
  stats?: {
    views: number;
    conversions: number;
  };
};

export type FullPageData = PageData & PageContent;

type PageFormData = {
  title: string;
  description: string;
  keywords: string;
  content: string;
  name: string;
  type: 'Landing_Page' | 'Blog_Page' | 'Content_Page';
  status: 'Published' | 'Draft';
};

// --- Zustand Store Definition ---
interface PageStoreState {
  pages: PageData[];
  pageContents: Record<string, PageContent>;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchPages: () => Promise<void>;
  fetchPageContent: (pageId: string) => Promise<void>;
  getPageContent: (pageId: string) => PageContent | null;
  addPage: (data: PageFormData) => Promise<void>;
  updatePage: (pageId: string, data: Partial<PageFormData>) => Promise<void>;
  deletePage: (pageId: string) => Promise<void>;
}

export const usePageStore = create<PageStoreState>((set, get) => ({
  // --- State ---
  pages: [],
  pageContents: {},
  loading: false,
  error: null,

  // --- Actions ---
  fetchPages: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('https://kapperking.runasp.net/api/Pages/GetPages');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PageData[] = await response.json();
      set({ pages: data, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch pages';
      set({ error: message, loading: false });
      toast.error(message);
    }
  },

  fetchPageContent: async (pageId) => {
    set({ loading: true });
    try {
      const response = await fetch(`https://kapperking.runasp.net/api/Pages/GetContent/${pageId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const content: PageContent = await response.json();
      set(state => ({
        pageContents: {
          ...state.pageContents,
          [pageId]: content
        },
        loading: false
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch page content';
      set({ error: message, loading: false });
      toast.error(message);
    }
  },

  getPageContent: (pageId) => {
    return get().pageContents[pageId] || null;
  },

  // addPage: async (data) => {
  //   set({ loading: true });
  //   try {
  //     const response = await fetch('https://kapperking.runasp.net/api/Pages', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(data),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const newPage: PageData = await response.json();
      
  //     set(state => ({
  //       pages: [...state.pages, newPage],
  //       loading: false
  //     }));
      
  //     toast.success("Page created successfully");
  //     await get().fetchPages(); // Refresh the list
  //   } catch (error) {
  //     const message = error instanceof Error ? error.message : 'Failed to create page';
  //     set({ error: message, loading: false });
  //     toast.error(message);
  //   }
  // },
  addPage: async (data) => {
    set({ loading: true });
    try {
      const response = await fetch('https://kapperking.runasp.net/api/Pages/AddPage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          keywords: data.keywords,
          content: data.content,
          name: data.name,
          type: data.type,
          status: data.status
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newPage: PageData = await response.json();
      
      // Generate slug from name if needed
      const slug = '/' + data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      set(state => ({
        pages: [...state.pages, {
          ...newPage,
          slug,
          lastModified: new Date().toISOString(),
          author: 'Current User' // You might want to get this from auth context
        }],
        pageContents: {
          ...state.pageContents,
          [newPage.id]: {
            content: data.content,
            meta: {
              description: data.description,
              keywords: data.keywords
            }
          }
        },
        loading: false
      }));
      
      toast.success("Page created successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create page';
      set({ error: message, loading: false });
      toast.error(message);
    }
  },
  updatePage: async (pageId, data) => {
    set({ loading: true });
    try {
      const response = await fetch('https://kapperking.runasp.net/api/Pages/EditPage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: parseInt(pageId), // Convert to number if needed
          title: data.title,
          description: data.description || '',
          keywords: data.keywords || '',
          content: data.content,
          name: (data.title ?? '').toLowerCase().replace(/\s+/g, '-'),
          type: data.type === 'Landing_Page' ? 'Landing_Page' : 
                data.type === 'Blog_Page' ? 'Blog_Page' : 'Content_Page',
          status: data.status === 'Published' ? 'Published' : 'Draft',
          updatedAt: new Date().toISOString()
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const updatedPage: PageData = await response.json();
      
      set(state => ({
        pages: state.pages.map(page => 
          page.id === pageId ? updatedPage : page
        ),
        pageContents: {
          ...state.pageContents,
          [pageId]: {
            content: data.content ?? state.pageContents[pageId]?.content ?? null,
            meta: { 
              description: data.description ?? state.pageContents[pageId]?.meta?.description ?? null,
              keywords: data.keywords ?? state.pageContents[pageId]?.meta?.keywords ?? null
            }
          }
        },
        loading: false
      }));
      
      toast.success("Page updated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update page';
      set({ error: message, loading: false });
      toast.error(message);
    }
  },







  deletePage: async (pageId) => {
    set({ loading: true });
    try {
      const response = await fetch(`https://kapperking.runasp.net/api/Pages/DeletePage/${pageId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      // Check if the response has content before parsing
      let responseData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      }
  
      set(state => ({
        pages: state.pages.filter(page => page.id !== pageId),
        pageContents: Object.fromEntries(
          Object.entries(state.pageContents).filter(([id]) => id !== pageId)
        ),
        loading: false
      }));
      
      toast.success("Page deleted successfully");
      
      // Return any data from the API if needed
      return responseData;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete page';
      set({ error: message, loading: false });
      toast.error(message);
      throw error; // Re-throw for component-level handling if needed
    }
  },
}));

// --- Selectors ---
export const selectPages = (state: PageStoreState) => state.pages;
export const selectPageContents = (state: PageStoreState) => state.pageContents;

export const selectPageBySlug = (slug: string) => (state: PageStoreState): PageData | null => {
  const cleanedSlug = slug.startsWith('/') ? slug : `/${slug}`;
  const rootSlug = slug === '/' ? '/' : cleanedSlug;
  return state.pages.find(page => page.slug === rootSlug) || null;
};

export const selectFullPageBySlug = (slug: string) => (state: PageStoreState): FullPageData | null => {
  const cleanedSlug = slug.startsWith('/') ? slug : `/${slug}`;
  const rootSlug = slug === '/' ? '/' : cleanedSlug;
  const page = state.pages.find(p => p.slug === rootSlug);
  if (!page) return null;
  const contentData = state.pageContents[page.id];
  return { 
    ...page, 
    content: contentData?.content ?? null, 
    meta: { 
      description: contentData?.meta?.description ?? null, 
      keywords: contentData?.meta?.keywords ?? null 
    } 
  };
};