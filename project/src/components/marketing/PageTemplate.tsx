import React from 'react'; // Remove useState import
import { FullPageData } from '../../lib/pageStore'; // Import type only
import { Markdown } from '../ui/markdown'; // Keep Markdown component
// import { Markdown } from '../ui/markdown'; // Keep commented for now
// MarketingLayout is handled by the router, no need to import/use here

interface PageTemplateProps {
  // slug: string; // Remove slug prop
  pageData: FullPageData | null; // Expect page data object or null
  // pageData: FullPageData | null; // Remove pageData prop
  title?: string; // Optional override title
  subtitle?: string; // Optional override subtitle
}
export const PageTemplate: React.FC<PageTemplateProps> = ({ pageData, title, subtitle }) => {
  // Remove local state

  // Optional: Log to see renders (can remove later)
  console.log(`PageTemplate rendered. Content Start: ${pageData?.content?.substring(0, 30)}`); // Keep log for now

  // --- Loading/Not Found State ---
  // TODO: Add a proper loading indicator based on store state if fetching becomes async
  if (!pageData) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-semibold text-gray-900">Page not found</h1>
        {/* Removed slug, just show generic message */}
        <p className="mt-2 text-gray-600">Could not load content for this page.</p>
      </div>
    );
  }

  // --- Render Page ---
  return (
    <>
      {/* Header Section - Uses default purple gradient */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-20 md:py-24 text-white text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Use override title/subtitle if provided, otherwise use data from store */}
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">{title || pageData.title}</h1>
          {subtitle && <p className="mt-4 text-xl text-indigo-100">{subtitle}</p>}
        </div>
      </div>

      {/* Content Section */}
      {/* Removed test button div */}
      <div className="container max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Restore Markdown rendering */}
        <div className="prose prose-lg max-w-none">
          <Markdown content={pageData.content ?? ''} />
        </div>
      </div>
    </>
  );
};