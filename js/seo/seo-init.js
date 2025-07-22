// seo-init.js
// SEO initialization for crimintel.ai

// Load all SEO modules
const loadSEOModules = () => {
  const scripts = [
    '/js/seo/meta-manager.js',
    '/js/seo/url-router.js',
    '/js/seo/sitemap-generator.js'
  ];
  
  scripts.forEach(src => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    document.head.appendChild(script);
  });
};

// Initialize SEO features
const initializeSEO = () => {
  // Wait for modules to load
  setTimeout(() => {
    // Meta manager is initialized automatically
    console.log('SEO modules loaded');
    
    // Add structured data for organization
    if (window.metaManager) {
      addOrganizationSchema();
    }
    
    // Initialize breadcrumbs
    initializeBreadcrumbs();
    
    // Add canonical URL
    updateCanonicalUrl();
    
    // Add language alternatives if needed
    addLanguageAlternatives();
  }, 100);
};

// Add organization schema
const addOrganizationSchema = () => {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'CriminTel.ai',
    'alternateName': 'AI Tools Intelligence Hub',
    'url': 'https://crimintel.ai',
    'logo': 'https://crimintel.ai/images/logo.png',
    'description': 'Comprehensive database and analysis platform for AI tools and software',
    'foundingDate': '2024',
    'founder': {
      '@type': 'Organization',
      'name': 'CriminTel Technologies'
    },
    'sameAs': [
      'https://twitter.com/crimintel_ai',
      'https://linkedin.com/company/crimintel-ai',
      'https://github.com/crimintel-ai'
    ],
    'contactPoint': {
      '@type': 'ContactPoint',
      'contactType': 'customer service',
      'email': 'support@crimintel.ai',
      'availableLanguage': ['English']
    }
  };
  
  // Add website schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'CriminTel.ai - AI Tools Intelligence Hub',
    'url': 'https://crimintel.ai',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': 'https://crimintel.ai/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  };
  
  // Add both schemas
  const schemas = [orgSchema, websiteSchema];
  
  schemas.forEach(schema => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  });
};

// Initialize breadcrumbs
const initializeBreadcrumbs = () => {
  const path = window.location.pathname;
  const breadcrumbs = [];
  
  // Always add home
  breadcrumbs.push({
    '@type': 'ListItem',
    'position': 1,
    'name': 'Home',
    'item': 'https://crimintel.ai'
  });
  
  // Add current page based on path
  if (path.startsWith('/ai-tools/')) {
    const toolName = path.split('/')[2];
    breadcrumbs.push({
      '@type': 'ListItem',
      'position': 2,
      'name': 'AI Tools',
      'item': 'https://crimintel.ai/ai-tools'
    });
    breadcrumbs.push({
      '@type': 'ListItem',
      'position': 3,
      'name': unslugify(toolName),
      'item': `https://crimintel.ai${path}`
    });
  } else if (path.startsWith('/category/')) {
    const categoryName = path.split('/')[2];
    breadcrumbs.push({
      '@type': 'ListItem',
      'position': 2,
      'name': unslugify(categoryName),
      'item': `https://crimintel.ai${path}`
    });
  } else if (path !== '/') {
    const pageName = unslugify(path.replace('/', '').replace('.html', ''));
    breadcrumbs.push({
      '@type': 'ListItem',
      'position': 2,
      'name': pageName,
      'item': `https://crimintel.ai${path}`
    });
  }
  
  if (breadcrumbs.length > 1) {
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': breadcrumbs
    };
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(script);
  }
};

// Update canonical URL
const updateCanonicalUrl = () => {
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  
  // Set canonical URL
  const currentUrl = window.location.href.split('?')[0].split('#')[0];
  canonical.href = currentUrl;
};

// Add language alternatives
const addLanguageAlternatives = () => {
  // For now, we only have English
  // In the future, add other language versions here
  const languages = [
    { hreflang: 'en', href: window.location.href },
    { hreflang: 'x-default', href: window.location.href }
  ];
  
  languages.forEach(lang => {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = lang.hreflang;
    link.href = lang.href;
    document.head.appendChild(link);
  });
};

// Helper function to unslugify text
const unslugify = (slug) => {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Load modules and initialize
loadSEOModules();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSEO);
} else {
  initializeSEO();
}

// Export for debugging
window.seoInit = {
  regenerateSitemap: () => {
    if (window.sitemapGenerator) {
      window.sitemapGenerator.saveSitemapToServer();
    }
  },
  checkSEO: () => {
    console.log('SEO Check:');
    console.log('- Title:', document.title);
    console.log('- Description:', document.querySelector('meta[name="description"]')?.content);
    console.log('- Canonical:', document.querySelector('link[rel="canonical"]')?.href);
    console.log('- Structured Data:', document.querySelectorAll('script[type="application/ld+json"]').length, 'schemas found');
    console.log('- Open Graph:', document.querySelectorAll('meta[property^="og:"]').length, 'tags');
    console.log('- Twitter Cards:', document.querySelectorAll('meta[name^="twitter:"]').length, 'tags');
  }
};