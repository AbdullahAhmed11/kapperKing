import { create } from 'zustand';
import { toast } from 'sonner'; 
import React from 'react'; // Keep React import if using JSX types like React.FC

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

// Define form data type based on PageForm schema (excluding slug)
type PageFormData = {
  title: string;
  type: 'page' | 'blog' | 'landing';
  content: string; 
  status: 'published' | 'draft';
  meta?: { 
    description?: string;
    keywords?: string;
  };
};

// --- Initial Mock Data (Full Content) ---
const initialPages: PageData[] = [
   { id: '1', title: 'Home', slug: '/', type: 'landing', status: 'published', lastModified: '2024-03-20', author: 'Admin', stats: { views: 12500, conversions: 245 } },
   { id: '2', title: 'Features', slug: '/features', type: 'page', status: 'published', lastModified: '2024-03-18', author: 'Admin', stats: { views: 8200, conversions: 156 } },
   { id: '4', title: 'About', slug: '/about', type: 'page', status: 'published', lastModified: '2024-03-15', author: 'Admin', stats: { views: 3500, conversions: 85 } },
   { id: '5', title: 'Terms of Service', slug: '/terms-of-service', type: 'page', status: 'published', lastModified: '2024-02-10', author: 'Legal Team', stats: { views: 1200, conversions: 0 } },
   { id: '6', title: 'Privacy Policy', slug: '/privacy-policy', type: 'page', status: 'published', lastModified: '2024-02-10', author: 'Legal Team', stats: { views: 950, conversions: 0 } },
   { id: '7', title: 'Contact Us', slug: '/contact', type: 'page', status: 'published', lastModified: '2024-03-25', author: 'Admin', stats: { views: 1500, conversions: 10 } }
];

const initialPageContents: Record<string, PageContent> = {
  '1': {
    content: `# Welcome to KapperKing\n\nThe complete software solution for modern salons. Streamline your salon operations, boost appointments, and grow your business with our all-in-one platform.\n\n## Everything you need to run your salon\n\nOne platform to manage your entire salon business in one powerful platform.`, 
    meta: { description: "KapperKing - The complete software solution for modern salons.", keywords: "salon software, salon management" }
  },
   '2': {
    content: `# KapperKing Features\n\nDiscover the powerful features that make KapperKing the complete software solution for modern salons.\n\n## Online Agenda\nManage your salon schedule efficiently with our intuitive online agenda system. Book appointments, manage staff schedules, and reduce no-shows with automated reminders.\n\n## Online Booking\nLet clients book appointments 24/7 through your website or mobile app. Clients can select services, choose their preferred staff member, and find available time slots.\n\n## POS & Inventory\nComplete point of sale system with inventory management. Track product sales, manage stock levels, and generate sales reports.\n\n## Client Management\nBuild stronger relationships with comprehensive client profiles, appointment history, and personalized marketing.\n\n## Marketing Tools\nGrow your business with integrated marketing tools including email campaigns, loyalty programs, and promotional offers.\n\n## Analytics\nMake data-driven decisions with detailed reports on sales, appointments, client retention, and staff performance.`, 
    meta: { description: "Explore the comprehensive features of KapperKing, the all-in-one software solution for modern salons.", keywords: "salon software features, kapperking, online booking" }
  },
   '4': {
    content: `# About KapperKing\n\nThe complete software solution for modern salons.\n\n## Our Story\n\nFounded in 2023, KapperKing was born from a simple observation: salon owners were spending too much time on administrative tasks and not enough time doing what they love - creating beautiful experiences for their clients.\n\nOur founders, having worked closely with salon professionals for years, recognized that existing software solutions were either too complex, too expensive, or simply not designed with the unique needs of modern salons in mind. They set out to create a comprehensive, user-friendly platform that would streamline salon operations and help businesses grow.\n\n## Our Mission\n\nAt KapperKing, our mission is to transform the salon industry by providing innovative software solutions that empower salon owners and professionals to thrive. We are committed to delivering exceptional value, fostering strong relationships, and driving positive change in the industry.\n\n## Our Vision\n\nOur vision is to be the leading global provider of salon management software, recognized for our commitment to innovation, customer satisfaction, and industry leadership. We strive to create a future where every salon can achieve its full potential with the help of our cutting-edge technology and dedicated support.`, 
    meta: { description: "Learn about KapperKing, the complete software solution for modern salons.", keywords: "salon software, salon management, kapperking, about us" }
  },
   '5': {
    content: `# Terms of Service\n\nWelcome to KapperKing... [Full Terms Content Here] ...`, // Placeholder for brevity - assume full content was here
    meta: { description: "KapperKing Terms of Service...", keywords: "terms of service..." }
  },
   '6': {
    content: `# Privacy Policy\n\nWe respect your privacy... [Full Privacy Content Here] ...`, // Placeholder for brevity
    meta: { description: "KapperKing Privacy Policy...", keywords: "privacy policy..." }
  },
   '7': { 
     content: `# Contact Us\n\nGet in touch with the KapperKing team.\n\n**Email:** support@kapperking.com\n**Phone:** +31 123 456 789`,
     meta: { description: "Contact KapperKing for support or inquiries.", keywords: "contact, support, kapperking" }
   }
};


// --- Zustand Store Definition ---
interface PageStoreState {
  pages: PageData[];
  pageContents: Record<string, PageContent>;
  // updateCounter: number; // Remove counter state
  getPageContent: (pageId: string) => PageContent | null;
  addPage: (data: Omit<PageFormData, 'meta'> & { meta?: PageFormData['meta'] }) => void;
  updatePage: (pageId: string, data: Partial<PageFormData>) => void;
  deletePage: (pageId: string) => void;
}

export const usePageStore = create<PageStoreState>((set, get) => ({
  // --- State ---
  pages: initialPages,
  pageContents: initialPageContents,
  // updateCounter: 0, // Remove counter initialization

  // --- Actions ---
  getPageContent: (pageId) => {
    return get().pageContents[pageId] || null;
  },

  addPage: (data) => {
      const newId = String(Date.now()); 
      const newSlug = '/' + (data.title || 'new-page').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const newPageData: PageData = {
          id: newId,
          title: data.title,
          slug: newSlug, 
          type: data.type,
          status: data.status,
          lastModified: new Date().toLocaleDateString('en-CA'),
          author: 'Admin', 
      };
      const newPageContent: PageContent = {
          content: data.content,
          meta: {
              description: data.meta?.description ?? null,
              keywords: data.meta?.keywords ?? null
          }
      };

      set(state => ({
          pages: [...state.pages, newPageData],
          pageContents: { ...state.pageContents, [newId]: newPageContent }
      }));
      console.log("New page added (local state only):", newPageData);
      toast.success("New page added (local state only)");
  },

  updatePage: (pageId, data) => {
    set(state => {
      const updatedPages = state.pages.map(page => 
        page.id === pageId 
          ? { 
              ...page, 
              ...(data.title && { title: data.title }),
              ...(data.type && { type: data.type }),
              ...(data.status && { status: data.status }),
              lastModified: new Date().toLocaleDateString('en-CA') 
            } 
          : page
      );

      let updatedContents = state.pageContents;
      if (data.content !== undefined || data.meta !== undefined) {
        updatedContents = {
          ...state.pageContents,
          [pageId]: {
            content: data.content ?? state.pageContents[pageId]?.content ?? null,
            meta: {
              description: data.meta?.description ?? state.pageContents[pageId]?.meta?.description ?? null,
              keywords: data.meta?.keywords ?? state.pageContents[pageId]?.meta?.keywords ?? null
            }
          }
        };
      }
      console.log("Local page state updated for ID:", pageId); 
      toast.success("Page updated (local state only)");
      return { pages: updatedPages, pageContents: updatedContents }; // Remove counter increment
    });
  },

  deletePage: (pageId) => {
    set(state => {
        const newPages = state.pages.filter(page => page.id !== pageId);
        const newContents = { ...state.pageContents };
        delete newContents[pageId];
        console.log("Local page state deleted for ID:", pageId); 
        toast.success("Page deleted (local state only)");
        return { pages: newPages, pageContents: newContents };
    });
  },
}));

// No need to export instance separately anymore

// --- Optional Selectors ---
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