// meta-manager.js
// Dynamic meta tag management for crimintel.ai

class MetaManager {
  constructor() {
    this.defaultMeta = {
      siteName: 'AI Tools Intelligence Hub - CriminTel.ai',
      siteUrl: 'https://crimintel.ai',
      defaultImage: '/images/og-default.jpg',
      twitterHandle: '@crimintel_ai',
      defaultDescription: 'Discover 345+ AI tools with executive-ready analysis, pricing & ROI insights. Daily AI news, guides & best practices for decision-makers.',
      keywords: 'AI tools, artificial intelligence software, AI comparison, best AI tools 2025, machine learning tools, AI software directory'
    };
  }

  // Update page meta tags
  updateMeta(options = {}) {
    const meta = { ...this.defaultMeta, ...options };
    
    // Title
    if (meta.title) {
      document.title = `${meta.title} | ${this.defaultMeta.siteName}`;
      this.setMetaTag('og:title', meta.title);
      this.setMetaTag('twitter:title', meta.title);
    }
    
    // Description
    if (meta.description) {
      this.setMetaTag('description', meta.description);
      this.setMetaTag('og:description', meta.description);
      this.setMetaTag('twitter:description', meta.description);
    }
    
    // Keywords
    if (meta.keywords) {
      this.setMetaTag('keywords', meta.keywords);
    }
    
    // URL
    const currentUrl = meta.url || window.location.href;
    this.setMetaTag('og:url', currentUrl);
    this.setMetaTag('twitter:url', currentUrl);
    this.setLinkTag('canonical', currentUrl);
    
    // Image
    const image = meta.image || this.defaultMeta.defaultImage;
    this.setMetaTag('og:image', this.getAbsoluteUrl(image));
    this.setMetaTag('twitter:image', this.getAbsoluteUrl(image));
    
    // Type
    this.setMetaTag('og:type', meta.type || 'website');
    
    // Twitter Card
    this.setMetaTag('twitter:card', meta.twitterCard || 'summary_large_image');
    this.setMetaTag('twitter:site', this.defaultMeta.twitterHandle);
    
    // Site name
    this.setMetaTag('og:site_name', this.defaultMeta.siteName);
    
    // Additional tags
    if (meta.additionalTags) {
      Object.entries(meta.additionalTags).forEach(([name, content]) => {
        this.setMetaTag(name, content);
      });
    }
  }

  // Update meta for tool page
  updateToolMeta(tool) {
    const meta = {
      title: `${tool.tool_name} - AI Tool Review & Analysis`,
      description: tool.brief_purpose_summary || `Detailed analysis of ${tool.tool_name}. ${tool.category} AI tool with pricing, features, pros/cons, and integration options.`,
      keywords: `${tool.tool_name}, ${tool.category} AI tools, ${tool.tags ? tool.tags.join(', ') : ''}, AI software review`,
      type: 'article',
      url: `${this.defaultMeta.siteUrl}/ai-tools/${this.slugify(tool.tool_name)}`,
      additionalTags: {
        'article:published_time': new Date().toISOString(),
        'article:modified_time': new Date().toISOString(),
        'article:section': tool.category,
        'article:tag': tool.tags ? tool.tags.join(',') : tool.category
      }
    };
    
    this.updateMeta(meta);
    this.addStructuredData(this.generateToolSchema(tool));
  }

  // Update meta for category page
  updateCategoryMeta(category, toolCount) {
    const meta = {
      title: `${category} AI Tools - ${toolCount} Tools Compared`,
      description: `Explore ${toolCount} ${category} AI tools. Compare features, pricing, and capabilities to find the best ${category} software for your needs.`,
      keywords: `${category} AI tools, best ${category} software, ${category} AI comparison, ${category} artificial intelligence`,
      type: 'website',
      url: `${this.defaultMeta.siteUrl}/category/${this.slugify(category)}`
    };
    
    this.updateMeta(meta);
  }

  // Update meta for comparison page
  updateComparisonMeta(tools) {
    const toolNames = tools.map(t => t.tool_name).join(' vs ');
    const categories = [...new Set(tools.map(t => t.category))].join(', ');
    
    const meta = {
      title: `Compare: ${toolNames}`,
      description: `Detailed comparison of ${toolNames}. Compare features, pricing, pros/cons, and use cases to make the best choice.`,
      keywords: `${toolNames.replace(' vs ', ', ')}, AI tools comparison, ${categories} comparison`,
      type: 'article',
      url: `${this.defaultMeta.siteUrl}/compare/${tools.map(t => this.slugify(t.tool_name)).join('-vs-')}`
    };
    
    this.updateMeta(meta);
    this.addStructuredData(this.generateComparisonSchema(tools));
  }

  // Helper to set meta tag
  setMetaTag(name, content) {
    let meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    
    if (!meta) {
      meta = document.createElement('meta');
      if (name.startsWith('og:') || name.startsWith('article:')) {
        meta.setAttribute('property', name);
      } else {
        meta.setAttribute('name', name);
      }
      document.head.appendChild(meta);
    }
    
    meta.setAttribute('content', content);
  }

  // Helper to set link tag
  setLinkTag(rel, href) {
    let link = document.querySelector(`link[rel="${rel}"]`);
    
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', rel);
      document.head.appendChild(link);
    }
    
    link.setAttribute('href', href);
  }

  // Generate tool schema
  generateToolSchema(tool) {
    return {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': tool.tool_name,
      'description': tool.brief_purpose_summary,
      'applicationCategory': tool.category,
      'url': tool.url,
      'offers': this.generatePricingSchema(tool.pricing_model),
      'aggregateRating': tool.rating ? {
        '@type': 'AggregateRating',
        'ratingValue': tool.rating,
        'bestRating': '5',
        'worstRating': '1',
        'ratingCount': tool.ratingCount || 1
      } : undefined,
      'featureList': tool.feature_breakdown ? 
        tool.feature_breakdown.split('\n').filter(f => f.trim()) : [],
      'softwareRequirements': tool.integration_potential,
      'review': tool.pros_cons_limitations ? {
        '@type': 'Review',
        'reviewBody': tool.pros_cons_limitations,
        'author': {
          '@type': 'Organization',
          'name': 'CriminTel.ai'
        }
      } : undefined
    };
  }

  // Generate pricing schema
  generatePricingSchema(pricingModel) {
    if (!pricingModel) return undefined;
    
    const offers = [];
    
    // Parse common pricing patterns
    if (pricingModel.toLowerCase().includes('free')) {
      offers.push({
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD',
        'name': 'Free Plan'
      });
    }
    
    // Extract price patterns like $X/month
    const priceMatches = pricingModel.match(/\$(\d+)(?:\/(\w+))?/g);
    if (priceMatches) {
      priceMatches.forEach(match => {
        const [, price, period] = match.match(/\$(\d+)(?:\/(\w+))?/) || [];
        if (price) {
          offers.push({
            '@type': 'Offer',
            'price': price,
            'priceCurrency': 'USD',
            'name': `Paid Plan`,
            'priceSpecification': period ? {
              '@type': 'UnitPriceSpecification',
              'price': price,
              'priceCurrency': 'USD',
              'unitText': period.toUpperCase()
            } : undefined
          });
        }
      });
    }
    
    return offers.length > 0 ? offers : undefined;
  }

  // Generate comparison schema
  generateComparisonSchema(tools) {
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'name': `Comparison: ${tools.map(t => t.tool_name).join(' vs ')}`,
      'description': `Detailed comparison of ${tools.length} AI tools`,
      'numberOfItems': tools.length,
      'itemListElement': tools.map((tool, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'item': this.generateToolSchema(tool)
      }))
    };
  }

  // Add structured data to page
  addStructuredData(data) {
    // Remove existing structured data
    const existing = document.querySelector('script[type="application/ld+json"]');
    if (existing) {
      existing.remove();
    }
    
    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  // Get absolute URL
  getAbsoluteUrl(url) {
    if (url.startsWith('http')) {
      return url;
    }
    return `${this.defaultMeta.siteUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  // Convert string to URL-friendly slug
  slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
  }

  // Initialize default meta tags
  initializeDefaultMeta() {
    // Add base meta tags if they don't exist
    this.ensureMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    this.ensureMetaTag('robots', 'index, follow');
    this.ensureMetaTag('author', 'CriminTel.ai');
    this.ensureMetaTag('generator', 'CriminTel.ai Platform');
    
    // Add default Open Graph tags
    this.updateMeta({
      title: 'AI Tools Intelligence Hub',
      description: this.defaultMeta.defaultDescription,
      keywords: this.defaultMeta.keywords
    });
    
    // Add organization schema
    this.addStructuredData({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'CriminTel.ai',
      'url': this.defaultMeta.siteUrl,
      'logo': this.getAbsoluteUrl('/images/logo.png'),
      'description': 'AI Tools Intelligence Hub - Comprehensive database and analysis of AI software tools',
      'sameAs': [
        'https://twitter.com/crimintel_ai',
        'https://linkedin.com/company/crimintel-ai'
      ]
    });
  }

  // Ensure meta tag exists
  ensureMetaTag(name, content) {
    if (!document.querySelector(`meta[name="${name}"]`)) {
      const meta = document.createElement('meta');
      meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
    }
  }
}

// Export singleton instance
const metaManager = new MetaManager();

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    metaManager.initializeDefaultMeta();
  });
} else {
  metaManager.initializeDefaultMeta();
}