import React from 'react';
import { PageTemplate } from '../../components/marketing/PageTemplate';
import { usePageStore, selectFullPageBySlug, FullPageData } from '../../lib/pageStore'; // Import hook, selector, type

function About() {
  // Use the hook and selector directly
  const pageData = usePageStore(selectFullPageBySlug('/about'));

  // Pass the loader data down
  return (
    <PageTemplate
      pageData={pageData} // Pass derived data object
      title="About KapperKing" // Keep title/subtitle overrides if needed
      subtitle="The complete software solution for modern salons."
    />
  );
}

export default About;