import React from 'react';
import SEOHead from './SEOHead';
import useSEO from '../../hooks/useSEO';

const DynamicSEO = ({ 
  slug, 
  fallback = {},
  children 
}) => {
  const { seoData, loading } = useSEO(slug);

  // إذا كان هناك بيانات SEO من قاعدة البيانات، استخدمها
  if (seoData) {
    const schema = seoData.schemaMarkup?.type ? {
      "@context": "https://schema.org",
      "@type": seoData.schemaMarkup.type,
      ...seoData.schemaMarkup.data
    } : null;

    return (
      <>
        <SEOHead
          title={seoData.title}
          description={seoData.description}
          keywords={seoData.keywords || []}
          image={seoData.featuredImage?.url}
          url={seoData.slug ? `/${seoData.slug}` : '/'}
          type={seoData.openGraph?.type || 'website'}
          schema={schema}
          noindex={!seoData.indexing?.index}
          nofollow={!seoData.indexing?.follow}
        />
        {children}
      </>
    );
  }

  // إذا لم تكن هناك بيانات SEO، استخدم البيانات الاحتياطية
  if (!loading && fallback) {
    return (
      <>
        <SEOHead {...fallback} />
        {children}
      </>
    );
  }

  return children;
};

export default DynamicSEO;