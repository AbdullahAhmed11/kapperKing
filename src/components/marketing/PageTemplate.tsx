// import React from 'react'; 
// import { FullPageData } from '../../lib/pageStore'; 
// import { Markdown } from '../ui/markdown'; 
// import { useThemeStore } from '@/lib/theme';
// import { Users, Sparkles } from 'lucide-react'; // Import necessary icons

// interface PageTemplateProps {
//   pageData: FullPageData | null; 
//   title?: string; 
//   subtitle?: string; 
// }

// export const PageTemplate: React.FC<PageTemplateProps> = ({ pageData, title, subtitle }) => {
//   // Get theme settings for the header
//   const { 
//     marketingHeaderBgType, 
//     marketingHeaderBgColor, 
//     marketingHeaderBgImageUrl, 
//     marketingHeaderTextColor 
//   } = useThemeStore((state) => state.currentTheme);

//   // Optional: Log to see renders (can remove later)
//   // console.log(`PageTemplate rendered. Content Start: ${pageData?.content?.substring(0, 30)}`); 

//   // --- Loading/Not Found State ---
//   // if (!pageData) {
//   //   return (
//   //     <div className="text-center py-12">
//   //       <h1 className="text-2xl font-semibold text-gray-900">Page not found</h1>
//   //       <p className="mt-2 text-gray-600">Could not load content for this page.</p>
//   //     </div>
//   //   );
//   // }

//   // --- Render Page ---
//   return (
//     <>
//       {/* Apply dynamic header styles */}
//       <div 
//         className="py-20 md:py-24 text-center relative bg-cover bg-center overflow-hidden" // Added overflow-hidden
//         style={{ 
//           backgroundColor: marketingHeaderBgType === 'color' ? (marketingHeaderBgColor || '#6B46C1') : undefined, // Apply color if type is color
//           backgroundImage: marketingHeaderBgType === 'image' && marketingHeaderBgImageUrl ? `url(${marketingHeaderBgImageUrl})` : undefined, // Apply image if type is image and URL exists
//           color: marketingHeaderTextColor || '#FFFFFF', // Apply text color
//         }}
//       >
//         {/* Optional overlay for image background */}
//         {/* Correctly wrap conditional rendering and icons */}
//         {marketingHeaderBgType === 'image' && marketingHeaderBgImageUrl && (
//           <div className="absolute inset-0 bg-black/50 z-0"></div>
//         )}
//          {/* Decorative Background Icons */}
//          <Users className="absolute -top-5 -left-12 h-40 w-40 text-white opacity-[0.04] transform -rotate-15" aria-hidden="true" />
//          <Sparkles className="absolute -bottom-10 -right-8 h-48 w-48 text-white opacity-[0.04] transform rotate-10" aria-hidden="true" />
//         {/* Removed stray closing brace/paren */}
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10"> {/* Ensure content is above overlay */}
//           <h1 
//             className="text-5xl md:text-6xl font-extrabold tracking-tight font-heading"
//             // Apply text color via style tag for specificity over potential Tailwind defaults
//             style={{ color: marketingHeaderTextColor || '#FFFFFF' }} 
//           >
//             {title || pageData?.title} {/* Removed optional chaining as pageData is guaranteed here */}
//           </h1> 
//           {subtitle && 
//             <p 
//               className="mt-4 text-xl" 
//               // Apply text color with opacity (adjust alpha value 0xCC = 80%)
//               style={{ color: marketingHeaderTextColor ? `${marketingHeaderTextColor}CC` : '#FFFFFFCC' }} 
//             >
//               {subtitle}
//             </p>
//           } 
//         </div>
//       </div>

//       {/* Content Section */}
//       <div className="container max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
//         <div className="prose prose-lg max-w-none">
//           <Markdown content={pageData?.content ?? ''} />
//         </div>
//       </div>
//     </>
//   );
// };

import React from 'react';
import { Users, Sparkles } from 'lucide-react';
import { Markdown } from '../ui/markdown';

interface PageTemplateProps {
  pageData: {
    title?: string;
    content?: string;
  } | null;
  title?: string;
  subtitle?: string;
}

export const PageTemplate: React.FC<PageTemplateProps> = ({ 
  pageData, 
  title, 
  subtitle 
}) => {
  // --- Static Theme Settings (Replace dynamic values) ---
  const headerBgColor = '#6B46C1'; // Purple (default)
  const headerTextColor = '#FFFFFF'; // White
  const headerBgImageUrl = ''; // Empty (no image by default)
  const headerBgType = 'color'; // 'color' | 'image'

  return (
    <>
      {/* Header with static styles */}
      <div 
        className="py-20 md:py-24 text-center relative bg-cover bg-center overflow-hidden"
        style={{ 
          backgroundColor: headerBgType === 'color' ? headerBgColor : undefined,
          backgroundImage: headerBgType === 'image' && headerBgImageUrl ? `url(${headerBgImageUrl})` : undefined,
          color: headerTextColor,
        }}
      >
        {/* Overlay (only if bg is image) */}
        {headerBgType === 'image' && headerBgImageUrl && (
          <div className="absolute inset-0 bg-black/50 z-0"></div>
        )}

        {/* Decorative Icons */}
        <Users className="absolute -top-5 -left-12 h-40 w-40 text-white opacity-[0.04] transform -rotate-15" aria-hidden="true" />
        <Sparkles className="absolute -bottom-10 -right-8 h-48 w-48 text-white opacity-[0.04] transform rotate-10" aria-hidden="true" />

        {/* Title & Subtitle */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight font-heading">
            {title || pageData?.title}
          </h1>
          {subtitle && (
            <p className="mt-4 text-xl opacity-80">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Content Section (Static Prose Styling) */}
      <div className="container max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="prose prose-lg max-w-none">
          <Markdown content={pageData?.content ?? ''} />
        </div>
      </div>
    </>
  );
};