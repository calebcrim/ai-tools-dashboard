// sitemap-generator.js
// Dynamic sitemap generation for crimintel.ai

class SitemapGenerator {
  constructor() {
    this.baseUrl = 'https://crimintel.ai';
    this.changeFrequencies = {
      home: 'daily',
      tool: 'weekly',
      category: 'weekly',
      static: 'monthly'
    };
  }

  // Generate complete sitemap
  generateSitemap() {
    const urls = [
      ...this.getStaticUrls(),
      ...this.getToolUrls(),
      ...this.getCategoryUrls()
    ];
    
    const sitemap = this.createSitemapXML(urls);
    return sitemap;
  }

  // Get static page URLs
  getStaticUrls() {
    return [
      {
        loc: this.baseUrl,
        changefreq: this.changeFrequencies.home,
        priority: '1.0',
        lastmod: new Date().toISOString().split('T')[0]
      },
      {
        loc: `${this.baseUrl}/best-practices`,
        changefreq: this.changeFrequencies.static,
        priority: '0.8',
        lastmod: new Date().toISOString().split('T')[0]
      },
      {
        loc: `${this.baseUrl}/about`,
        changefreq: this.changeFrequencies.static,
        priority: '0.6'
      },
      {
        loc: `${this.baseUrl}/privacy`,
        changefreq: this.changeFrequencies.static,
        priority: '0.3'
      },
      {
        loc: `${this.baseUrl}/terms`,
        changefreq: this.changeFrequencies.static,
        priority: '0.3'
      }
    ];
  }

  // Get tool URLs
  getToolUrls() {
    if (!window.unifiedToolsData) return [];
    
    return window.unifiedToolsData.tools.map(tool => ({
      loc: `${this.baseUrl}/ai-tools/${this.slugify(tool.tool_name)}`,
      changefreq: this.changeFrequencies.tool,
      priority: '0.8',
      lastmod: new Date().toISOString().split('T')[0]
    }));
  }

  // Get category URLs
  getCategoryUrls() {
    if (!window.unifiedToolsData) return [];
    
    const categories = [...new Set(window.unifiedToolsData.tools.map(t => t.category))];
    
    return categories.map(category => ({
      loc: `${this.baseUrl}/category/${this.slugify(category)}`,
      changefreq: this.changeFrequencies.category,
      priority: '0.7',
      lastmod: new Date().toISOString().split('T')[0]
    }));
  }

  // Create sitemap XML
  createSitemapXML(urls) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls.map(url => this.createUrlEntry(url)).join('\n')}
</urlset>`;
    
    return xml;
  }

  // Create individual URL entry
  createUrlEntry(url) {
    let entry = `  <url>
    <loc>${this.escapeXML(url.loc)}</loc>`;
    
    if (url.lastmod) {
      entry += `
    <lastmod>${url.lastmod}</lastmod>`;
    }
    
    if (url.changefreq) {
      entry += `
    <changefreq>${url.changefreq}</changefreq>`;
    }
    
    if (url.priority) {
      entry += `
    <priority>${url.priority}</priority>`;
    }
    
    entry += `
  </url>`;
    
    return entry;
  }

  // Generate robots.txt content
  generateRobotsTxt() {
    return `# Robots.txt for crimintel.ai
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/

# Sitemap location
Sitemap: ${this.baseUrl}/sitemap.xml

# Crawl delay (in seconds)
Crawl-delay: 1

# Specific bot rules
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: CCBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Claude-Web
Allow: /`;
  }

  // Download sitemap as file
  downloadSitemap() {
    const sitemap = this.generateSitemap();
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Download robots.txt as file
  downloadRobotsTxt() {
    const robots = this.generateRobotsTxt();
    const blob = new Blob([robots], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Save sitemap to server (for static generation)
  async saveSitemapToServer() {
    const sitemap = this.generateSitemap();
    
    // This would typically make an API call to save the sitemap
    // For now, we'll just log it
    console.log('Sitemap generated:', sitemap.length, 'characters');
    console.log('Total URLs:', sitemap.match(/<url>/g).length);
    
    return {
      success: true,
      message: 'Sitemap generated successfully',
      urlCount: sitemap.match(/<url>/g).length
    };
  }

  // Helper methods
  slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  escapeXML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

// Create generator instance
const sitemapGenerator = new SitemapGenerator();

// Auto-generate sitemap on page load if on admin page
if (window.location.pathname === '/admin' || window.location.search.includes('generate-sitemap')) {
  document.addEventListener('DOMContentLoaded', () => {
    // Add sitemap generation UI
    const container = document.createElement('div');
    container.className = 'sitemap-generator-ui';
    container.innerHTML = `
      <div style="position: fixed; bottom: 20px; right: 20px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); z-index: 1000;">
        <h3>Sitemap Generator</h3>
        <button onclick="sitemapGenerator.downloadSitemap()" style="margin: 5px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Download sitemap.xml
        </button>
        <button onclick="sitemapGenerator.downloadRobotsTxt()" style="margin: 5px; padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Download robots.txt
        </button>
      </div>
    `;
    document.body.appendChild(container);
  });
}

// Export for use
window.sitemapGenerator = sitemapGenerator;